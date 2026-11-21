import time
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.vector_store import vector_store
from app.schemas.search import SearchResponse, SearchResultItem

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("", response_model=SearchResponse)
def semantic_search(
    q: str = Query(..., min_length=1, description="Natural language operational query or keyword"),
    category: Optional[str] = None,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    start_time = time.time()
    valid_category = category if isinstance(category, str) and category and category != "All" else None
    valid_limit = int(limit) if isinstance(limit, (int, str)) and str(limit).isdigit() else 10

    matches = vector_store.search(
        query=q if isinstance(q, str) else str(q),
        limit=valid_limit,
        category=valid_category
    )
    elapsed_ms = int((time.time() - start_time) * 1000)

    results = [
        SearchResultItem(
            chunk_id=m["chunk_id"],
            document_id=m["document_id"],
            document_title=m["document_title"],
            category=m["category"],
            page_number=m["page_number"],
            section_title=m["section_title"],
            content=m["content"],
            relevance_score=m["relevance_score"]
        )
        for m in matches
    ]

    return SearchResponse(
        query=str(q),
        total_matches=len(results),
        results=results,
        execution_time_ms=elapsed_ms
    )
