from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel


class CategoryCount(BaseModel):
    name: str
    count: int
    color: Optional[str] = None


class QueryActivityPoint(BaseModel):
    date: str
    queries: int
    documents_indexed: int


class TopTopic(BaseModel):
    topic: str
    count: int
    success_rate: float


class TopDocument(BaseModel):
    id: str
    title: str
    category: str
    access_count: int


class DashboardStats(BaseModel):
    total_documents: int
    indexed_sops: int
    queries_processed: int
    successful_retrievals: int
    success_rate_percentage: float
    categories: List[CategoryCount]
    activity_timeline: List[QueryActivityPoint]
    recent_sops: List[Dict[str, Any]]
    recent_activities: List[Dict[str, Any]]
    system_health: Dict[str, Any]


class AnalyticsResponse(BaseModel):
    total_queries: int
    successful_queries: int
    success_rate: float
    avg_response_time_ms: float
    query_volume_trend: List[QueryActivityPoint]
    category_distribution: List[CategoryCount]
    most_searched_topics: List[TopTopic]
    frequently_retrieved_documents: List[TopDocument]
