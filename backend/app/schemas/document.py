from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class DocumentChunkBase(BaseModel):
    chunk_index: int
    page_number: int
    section_title: str
    content: str


class DocumentChunkResponse(DocumentChunkBase):
    id: str
    document_id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class DocumentBase(BaseModel):
    title: str
    category: str = "General Procedures"
    description: Optional[str] = ""


class DocumentCreate(DocumentBase):
    pass


class DocumentResponse(DocumentBase):
    id: str
    filename: str
    file_size: int
    file_type: str
    status: str
    chunk_count: int
    page_count: int
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class DocumentDetailResponse(DocumentResponse):
    chunks: List[DocumentChunkResponse] = []
    content_preview: Optional[str] = None
