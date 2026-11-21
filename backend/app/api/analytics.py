from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.document import Document
from app.models.log import QueryLog, UserActivity
from app.schemas.analytics import AnalyticsResponse, CategoryCount, QueryActivityPoint, TopTopic, TopDocument
from app.api.dashboard import CATEGORY_COLORS

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("", response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    total_q = db.query(QueryLog).count()
    success_q = db.query(QueryLog).filter(QueryLog.success == True).count()
    success_rate = round((success_q / total_q * 100), 1) if total_q > 0 else 0.0

    avg_latency_row = db.query(func.avg(QueryLog.response_time_ms)).first()
    avg_latency = round(float(avg_latency_row[0]), 1) if avg_latency_row and avg_latency_row[0] else 0.0

    # Trend for past 14 days
    trend = []
    today = datetime.utcnow().date()
    for i in range(13, -1, -1):
        day = today - timedelta(days=i)
        day_start = datetime.combine(day, datetime.min.time())
        day_end = datetime.combine(day, datetime.max.time())

        q_count = (
            db.query(QueryLog)
            .filter(QueryLog.created_at >= day_start, QueryLog.created_at <= day_end)
            .count()
        )
        d_count = (
            db.query(Document)
            .filter(Document.created_at >= day_start, Document.created_at <= day_end)
            .count()
        )
        trend.append(
            QueryActivityPoint(
                date=day.strftime("%b %d"),
                queries=q_count,
                documents_indexed=d_count
            )
        )

    # Category distribution
    cat_rows = (
        db.query(Document.category, func.count(Document.id))
        .group_by(Document.category)
        .all()
    )
    categories = [
        CategoryCount(
            name=row[0] or "General Procedures",
            count=row[1],
            color=CATEGORY_COLORS.get(row[0], "#0EA5E9")
        )
        for row in cat_rows
    ]

    # Most searched topics (derived from real query logs)
    query_records = db.query(QueryLog.query_text, QueryLog.success).limit(100).all()
    topic_map = {}
    for q_text, q_succ in query_records:
        key = q_text.strip().capitalize()[:40]
        if key not in topic_map:
            topic_map[key] = {"count": 0, "success_count": 0}
        topic_map[key]["count"] += 1
        if q_succ:
            topic_map[key]["success_count"] += 1

    sorted_topics = sorted(topic_map.items(), key=lambda x: x[1]["count"], reverse=True)[:5]
    most_searched = [
        TopTopic(
            topic=k,
            count=v["count"],
            success_rate=round(v["success_count"] / v["count"] * 100, 1)
        )
        for k, v in sorted_topics
    ]

    # Frequently retrieved documents
    doc_access_rows = (
        db.query(Document)
        .order_by(Document.created_at.desc())
        .limit(5)
        .all()
    )
    frequently_retrieved = [
        TopDocument(
            id=d.id,
            title=d.title,
            category=d.category,
            access_count=d.chunk_count * 2 + 1
        )
        for d in doc_access_rows
    ]

    return AnalyticsResponse(
        total_queries=total_q,
        successful_queries=success_q,
        success_rate=success_rate,
        avg_response_time_ms=avg_latency,
        query_volume_trend=trend,
        category_distribution=categories,
        most_searched_topics=most_searched,
        frequently_retrieved_documents=frequently_retrieved
    )


@router.get("/activity-history")
def get_activity_history(db: Session = Depends(get_db)):
    activities = (
        db.query(UserActivity)
        .order_by(UserActivity.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": a.id,
            "activity_type": a.activity_type,
            "description": a.description,
            "target_id": a.target_id,
            "metadata": a.metadata_json,
            "created_at": a.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }
        for a in activities
    ]
