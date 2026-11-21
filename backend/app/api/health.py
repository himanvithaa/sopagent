import time
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.session import get_db
from app.services.ollama_service import ollama_service
from app.services.vector_store import vector_store
from app.schemas.settings import SystemHealthResponse, ComponentHealth
from app.core.config import settings

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", response_model=SystemHealthResponse)
def get_system_health(db: Session = Depends(get_db)):
    # 1. FastAPI status
    fastapi_health = ComponentHealth(
        name="FastAPI Service",
        status="connected",
        details="Operational (v0.110+)",
        latency_ms=0.5
    )

    # 2. Database status
    db_start = time.time()
    try:
        db.execute(text("SELECT 1"))
        db_latency = round((time.time() - db_start) * 1000, 1)
        db_type = "PostgreSQL" if "postgresql" in settings.DATABASE_URL else "SQLite"
        db_health = ComponentHealth(
            name=f"Database ({db_type})",
            status="connected",
            details="Engine connected, schema active",
            latency_ms=db_latency
        )
    except Exception as e:
        db_health = ComponentHealth(
            name="Database Engine",
            status="disconnected",
            details=f"Connection failure: {str(e)}",
            latency_ms=None
        )

    # 3. ChromaDB status
    chroma_stats = vector_store.get_stats()
    chroma_health = ComponentHealth(
        name="ChromaDB Vector Store",
        status="connected" if chroma_stats.get("status") == "connected" else "disconnected",
        details=f"Collection '{chroma_stats.get('collection_name')}' ({chroma_stats.get('count', 0)} chunks indexed)",
        metadata=chroma_stats
    )

    # 4. Ollama daemon & models
    ollama_info = ollama_service.check_health()
    if ollama_info["is_connected"]:
        ollama_status = "connected"
        ollama_details = f"Listening on {ollama_info['base_url']} ({len(ollama_info['installed_models'])} models available)"
    else:
        ollama_status = "disconnected"
        ollama_details = f"Ollama daemon unreachable at {settings.OLLAMA_BASE_URL}. Run 'ollama serve' to enable local inference."

    ollama_health = ComponentHealth(
        name="Ollama Local Daemon",
        status=ollama_status,
        details=ollama_details,
        latency_ms=ollama_info.get("latency_ms")
    )

    # 5. Llama Chat Model status
    if ollama_info["has_chat_model"]:
        llama_status = "connected"
        llama_details = f"Model '{ollama_service.chat_model}' loaded and ready"
    elif ollama_info["is_connected"]:
        llama_status = "warning"
        llama_details = f"Model '{ollama_service.chat_model}' not installed. Run 'ollama run {ollama_service.chat_model}'"
    else:
        llama_status = "disconnected"
        llama_details = f"Daemon offline. Required model: {ollama_service.chat_model}"

    llama_health = ComponentHealth(
        name=f"LLM Generation ({ollama_service.chat_model})",
        status=llama_status,
        details=llama_details
    )

    # 6. Embedding Model status
    if ollama_info["has_embed_model"]:
        embed_status = "connected"
        embed_details = f"Model '{ollama_service.embed_model}' loaded and ready"
    elif ollama_info["is_connected"]:
        embed_status = "warning"
        embed_details = f"Model '{ollama_service.embed_model}' not installed. Run 'ollama pull {ollama_service.embed_model}'"
    else:
        embed_status = "disconnected"
        embed_details = f"Daemon offline. Fallback semantic vectorizer active. Required: {ollama_service.embed_model}"

    embed_health = ComponentHealth(
        name=f"Embeddings ({ollama_service.embed_model})",
        status=embed_status,
        details=embed_details
    )

    overall = "healthy"
    if ollama_status != "connected" or db_health.status != "connected":
        overall = "degraded"

    return SystemHealthResponse(
        status=overall,
        fastapi=fastapi_health,
        database=db_health,
        chromadb=chroma_health,
        ollama=ollama_health,
        llama_model=llama_health,
        embed_model=embed_health
    )
