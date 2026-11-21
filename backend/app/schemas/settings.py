from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class ComponentHealth(BaseModel):
    name: str
    status: str  # "connected", "disconnected", "warning"
    details: str
    latency_ms: Optional[float] = None
    metadata: Optional[Dict[str, Any]] = None


class SystemHealthResponse(BaseModel):
    status: str  # "healthy", "degraded", "down"
    fastapi: ComponentHealth
    database: ComponentHealth
    chromadb: ComponentHealth
    ollama: ComponentHealth
    llama_model: ComponentHealth
    embed_model: ComponentHealth


class OllamaSettingsUpdate(BaseModel):
    base_url: Optional[str] = None
    chat_model: Optional[str] = None
    embed_model: Optional[str] = None


class OllamaSettingsResponse(BaseModel):
    base_url: str
    chat_model: str
    embed_model: str
    is_connected: bool
    installed_models: List[str]
    has_chat_model: bool
    has_embed_model: bool
    error_message: Optional[str] = None
