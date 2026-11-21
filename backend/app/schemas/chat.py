from typing import List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class SourceCitation(BaseModel):
    document_id: str
    document_title: str
    category: str
    page_number: int
    section_title: str
    excerpt: str
    relevance_score: float


class StructuredResponse(BaseModel):
    understanding: str
    relevant_sop_found: str
    recommended_corrective_actions: List[str]
    important_notes: List[str]
    source_references: List[SourceCitation]
    is_grounded_in_docs: bool = True


class ChatMessageRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    category_filter: Optional[str] = None


class ChatMessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    structured_data: Optional[StructuredResponse] = None
    retrieved_chunks: List[SourceCitation] = []
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ConversationResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessageResponse] = []
    model_config = ConfigDict(from_attributes=True)


class ConversationSummary(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0
    model_config = ConfigDict(from_attributes=True)
