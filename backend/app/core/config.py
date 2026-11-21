import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "OPERA – Intelligent Operations Assistant"
    TAGLINE: str = "From operational questions to actionable knowledge."
    API_V1_STR: str = "/api"

    # Ollama Local AI Integration
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_CHAT_MODEL: str = "llama3.2"
    OLLAMA_EMBED_MODEL: str = "nomic-embed-text"
    OLLAMA_REQUEST_TIMEOUT: float = 90.0

    # Application Database (PostgreSQL or SQLite fallback)
    DATABASE_URL: str = "sqlite:///./opera.db"

    # ChromaDB Vector Store
    CHROMA_PERSIST_DIRECTORY: str = "./chroma_db"

    # Storage for uploaded files
    STORAGE_DIRECTORY: str = "./storage"
    MAX_UPLOAD_SIZE_MB: int = 50

    # Chunking Configuration
    CHUNK_SIZE: int = 700
    CHUNK_OVERLAP: int = 120
    TOP_K_CHUNKS: int = 4
    SIMILARITY_THRESHOLD: float = 0.35

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

# Ensure storage directories exist
os.makedirs(settings.STORAGE_DIRECTORY, exist_ok=True)
os.makedirs(os.path.join(settings.STORAGE_DIRECTORY, "documents"), exist_ok=True)
os.makedirs(settings.CHROMA_PERSIST_DIRECTORY, exist_ok=True)
