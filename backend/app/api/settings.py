from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.ollama_service import ollama_service
from app.services.vector_store import vector_store
from app.services.seed_data import seed_database_if_empty
from app.models.document import Document
from app.schemas.settings import OllamaSettingsResponse, OllamaSettingsUpdate

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("/ollama", response_model=OllamaSettingsResponse)
def get_ollama_settings():
    health = ollama_service.check_health()
    return OllamaSettingsResponse(
        base_url=ollama_service.base_url,
        chat_model=ollama_service.chat_model,
        embed_model=ollama_service.embed_model,
        is_connected=health["is_connected"],
        installed_models=health.get("installed_models", []),
        has_chat_model=health.get("has_chat_model", False),
        has_embed_model=health.get("has_embed_model", False),
        error_message=health.get("error")
    )


@router.post("/ollama", response_model=OllamaSettingsResponse)
def update_ollama_settings(update_data: OllamaSettingsUpdate):
    ollama_service.update_config(
        base_url=update_data.base_url,
        chat_model=update_data.chat_model,
        embed_model=update_data.embed_model
    )
    return get_ollama_settings()


@router.post("/seed")
def seed_demo_data(db: Session = Depends(get_db)):
    seed_database_if_empty(db)
    return {"status": "success", "message": "Enterprise SOP sample repository successfully seeded."}


@router.post("/reindex")
def reindex_all_documents(db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.status == "indexed").all()
    reindexed_count = 0
    for doc in docs:
        chunks_data = [
            {
                "chunk_index": c.chunk_index,
                "page_number": c.page_number,
                "section_title": c.section_title,
                "content": c.content
            }
            for c in doc.chunks
        ]
        vector_store.add_document_chunks(
            document_id=doc.id,
            document_title=doc.title,
            category=doc.category,
            chunks=chunks_data
        )
        reindexed_count += 1

    return {
        "status": "success",
        "message": f"Successfully re-indexed {reindexed_count} documents into ChromaDB."
    }
