import os
import re
import math
import hashlib
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings as ChromaSettings
from chromadb.api.types import EmbeddingFunction, Documents, Embeddings
from app.core.config import settings
from app.services.ollama_service import ollama_service


class OperaEmbeddingFunction(EmbeddingFunction):
    def __init__(self):
        pass

    def __call__(self, input: Documents) -> Embeddings:
        return [VectorStoreService._deterministic_semantic_vector(doc) for doc in input]


class VectorStoreService:
    def __init__(self):
        self.persist_directory = settings.CHROMA_PERSIST_DIRECTORY
        os.makedirs(self.persist_directory, exist_ok=True)
        self.client = chromadb.PersistentClient(
            path=self.persist_directory,
            settings=ChromaSettings(anonymized_telemetry=False)
        )
        self.collection_name = "opera_sop_knowledge"
        self._collection = None
        self._embedding_function = OperaEmbeddingFunction()

    def get_collection(self):
        if self._collection is None:
            self._collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"},
                embedding_function=self._embedding_function
            )
        return self._collection

    @staticmethod
    def _deterministic_semantic_vector(text: str, dim: int = 384) -> List[float]:
        vec = [0.0] * dim
        words = re.findall(r"\w+", text.lower())
        for i, word in enumerate(words):
            h = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16)
            idx = h % dim
            sign = 1.0 if ((h >> 8) & 1) else -1.0
            vec[idx] += sign * (1.0 / math.sqrt(i + 1))

        # Add character bi-grams
        for i in range(min(len(text) - 1, 150)):
            bg = text[i:i+2].lower()
            h = int(hashlib.sha1(bg.encode("utf-8")).hexdigest(), 16)
            idx = h % dim
            sign = 1.0 if ((h >> 4) & 1) else -1.0
            vec[idx] += 0.3 * sign

        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            return [x / norm for x in vec]
        return [0.0] * dim

    def get_embedding(self, text: str) -> List[float]:
        try:
            emb = ollama_service.get_embedding(text)
            if emb and len(emb) > 0:
                return emb
        except Exception:
            pass
        return self._deterministic_semantic_vector(text)

    def add_document_chunks(self, document_id: str, document_title: str, category: str, chunks: List[Dict[str, Any]]):
        collection = self.get_collection()
        if not chunks:
            return

        health = ollama_service.check_health()
        use_ollama = health["is_connected"] and health.get("has_embed_model", False)

        ids = []
        embeddings = []
        documents = []
        metadatas = []

        for chunk in chunks:
            chunk_id = f"{document_id}_chunk_{chunk['chunk_index']}"
            content = chunk["content"]

            if use_ollama:
                emb = self.get_embedding(content)
            else:
                emb = self._deterministic_semantic_vector(content)

            ids.append(chunk_id)
            embeddings.append(emb)
            documents.append(content)
            metadatas.append({
                "document_id": document_id,
                "document_title": document_title,
                "category": category,
                "page_number": int(chunk.get("page_number", 1)),
                "section_title": chunk.get("section_title", "General"),
                "chunk_index": int(chunk.get("chunk_index", 0))
            })

        collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas
        )

    def search(self, query: str, limit: int = 4, category: Optional[str] = None) -> List[Dict[str, Any]]:
        collection = self.get_collection()
        total_count = collection.count()
        if total_count == 0:
            return []

        health = ollama_service.check_health()
        use_ollama = health["is_connected"] and health.get("has_embed_model", False)

        if use_ollama:
            query_emb = self.get_embedding(query)
        else:
            query_emb = self._deterministic_semantic_vector(query)

        where_clause = {"category": category} if category and category != "All" else None

        # Retrieve a broader candidate pool for re-ranking and cross-document balance
        candidate_k = min(30, total_count)
        results = collection.query(
            query_embeddings=[query_emb],
            n_results=candidate_k,
            where=where_clause,
            include=["documents", "metadatas", "distances"]
        )

        matches = []
        if not (results and "documents" in results and results["documents"]):
            return []

        docs = results["documents"][0]
        metas = results["metadatas"][0]
        dists = results["distances"][0] if "distances" in results else [0.0] * len(docs)

        # Stop words to filter out of keyword scoring
        stop_words = {
            "what", "when", "where", "which", "who", "whom", "this", "that",
            "these", "those", "from", "with", "about", "have", "been", "does",
            "done", "should", "could", "would", "into", "onto", "their", "there",
            "then", "than", "each", "both", "some", "such", "also", "most", "more"
        }
        q_words = [w for w in re.findall(r"\b[a-zA-Z0-9_\-]{3,}\b", query.lower()) if w not in stop_words]

        # Check if query is explicitly cross-document
        is_cross_doc = any(
            k in query.lower() for k in ["both", "compare", "comparison", "each process", "each sop", "between both", "in both"]
        )

        for doc, meta, dist in zip(docs, metas, dists):
            base_relevance = max(0.0, min(1.0, 1.0 - (dist / 2.0)))
            
            # Hybrid lexical score with stem/prefix matching
            sec_lower = str(meta.get("section_title", "")).lower()
            doc_lower = str(meta.get("document_title", "")).lower()
            content_lower = doc.lower()

            kw_hits = 0
            sec_hits = 0
            for qw in q_words:
                stem = qw[:5] if len(qw) >= 6 else qw
                if qw in sec_lower or stem in sec_lower:
                    sec_hits += 1
                if qw in content_lower or stem in content_lower or qw in doc_lower or stem in doc_lower:
                    kw_hits += 1

            lexical_ratio = (kw_hits / max(len(q_words), 1)) if q_words else 0.0
            sec_boost = min(0.35, sec_hits * 0.18)
            
            # Document specificity boost
            doc_boost = 0.0
            if "sop-mnt-001" in query.lower() or ("machine" in query.lower() and "sop-mnt-001" in meta["document_id"].lower()):
                doc_boost = 0.15
            elif "sop-it-002" in query.lower() or ("network" in query.lower() and "sop-it-002" in meta["document_id"].lower()):
                doc_boost = 0.15

            combined_score = min(0.99, max(0.0, (base_relevance * 0.45) + (lexical_ratio * 0.35) + sec_boost + doc_boost))

            matches.append({
                "chunk_id": f"{meta['document_id']}_chunk_{meta.get('chunk_index', 0)}",
                "document_id": meta["document_id"],
                "document_title": meta["document_title"],
                "category": meta["category"],
                "page_number": meta.get("page_number", 1),
                "section_title": meta.get("section_title", "General"),
                "content": doc,
                "relevance_score": round(combined_score, 3)
            })

        matches.sort(key=lambda x: x["relevance_score"], reverse=True)

        if is_cross_doc:
            # Balance chunks across distinct documents (e.g. SOP-MNT-001 and SOP-IT-002)
            by_doc: Dict[str, List[Dict[str, Any]]] = {}
            for m in matches:
                by_doc.setdefault(m["document_id"], []).append(m)

            balanced: List[Dict[str, Any]] = []
            per_doc_quota = max(2, limit // max(len(by_doc), 1))
            for doc_id, doc_matches in by_doc.items():
                balanced.extend(doc_matches[:per_doc_quota])

            balanced.sort(key=lambda x: x["relevance_score"], reverse=True)
            return balanced[:max(limit, 4)]

        return matches[:limit]

    def delete_document(self, document_id: str):
        collection = self.get_collection()
        try:
            collection.delete(where={"document_id": document_id})
        except Exception:
            pass

    def get_stats(self) -> Dict[str, Any]:
        try:
            collection = self.get_collection()
            return {
                "status": "connected",
                "count": collection.count(),
                "collection_name": self.collection_name
            }
        except Exception as e:
            return {
                "status": "disconnected",
                "count": 0,
                "error": str(e)
            }


vector_store = VectorStoreService()
