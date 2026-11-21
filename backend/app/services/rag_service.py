import time
import uuid
import json
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from app.models.log import QueryLog, UserActivity
from app.services.vector_store import vector_store
from app.services.ollama_service import ollama_service
from app.core.config import settings


class RAGService:
    @staticmethod
    def process_query(
        query: str,
        db: Session,
        conversation_id: Optional[str] = None,
        category: Optional[str] = None,
        history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        start_time = time.time()

        try:
            # Step 1: ChromaDB semantic search
            retrieved_chunks = vector_store.search(
                query=query,
                limit=settings.TOP_K_CHUNKS,
                category=category
            )

            # Step 2: Context-grounded response generation
            rag_output = ollama_service.generate_rag_response(
                query=query,
                retrieved_chunks=retrieved_chunks,
                conversation_history=history
            )

            elapsed_ms = int((time.time() - start_time) * 1000)
            top_score = retrieved_chunks[0]["relevance_score"] if retrieved_chunks else 0.0

            # Step 3: Record query in audit log
            query_log = QueryLog(
                id=str(uuid.uuid4()),
                query_text=query,
                conversation_id=conversation_id,
                document_matches_count=len(retrieved_chunks),
                top_relevance_score=top_score,
                response_time_ms=elapsed_ms,
                success=rag_output.get("is_grounded_in_docs", False) or len(retrieved_chunks) > 0,
                error_message=None
            )
            db.add(query_log)

            # Step 4: Record user activity
            activity = UserActivity(
                id=str(uuid.uuid4()),
                activity_type="query",
                description=f"AI Query: '{query[:50]}...'",
                target_id=retrieved_chunks[0]["document_id"] if retrieved_chunks else None,
                metadata_json=json.dumps({
                    "matches": len(retrieved_chunks),
                    "top_doc": retrieved_chunks[0]["document_title"] if retrieved_chunks else None,
                    "elapsed_ms": elapsed_ms
                })
            )
            db.add(activity)
            db.commit()

            rag_output["elapsed_ms"] = elapsed_ms
            return rag_output

        except Exception as e:
            elapsed_ms = int((time.time() - start_time) * 1000)
            db.rollback()
            query_log = QueryLog(
                id=str(uuid.uuid4()),
                query_text=query,
                conversation_id=conversation_id,
                document_matches_count=0,
                top_relevance_score=0.0,
                response_time_ms=elapsed_ms,
                success=False,
                error_message=str(e)
            )
            db.add(query_log)
            db.commit()
            raise e


rag_service = RAGService()
