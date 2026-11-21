from typing import List, Optional
from pydantic import BaseModel


class SearchQuery(BaseModel):
    query: str
    category: Optional[str] = None
    limit: int = 10
    min_score: float = 0.2


class SearchResultItem(BaseModel):
    chunk_id: str
    document_id: str
    document_title: str
    category: str
    page_number: int
    section_title: str
    content: str
    relevance_score: float


class SearchResponse(BaseModel):
    query: str
    total_matches: int
    results: List[SearchResultItem]
    execution_time_ms: int
