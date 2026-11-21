from datetime import datetime, timedelta
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.document import Document
from app.models.log import QueryLog, UserActivity
from app.schemas.analytics import DashboardStats, CategoryCount, QueryActivityPoint
from app.api.health import get_system_health

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

CATEGORY_COLORS = {
    "IT Operations": "#0EA5E9",
    "Network Management": "#14B8A6",
    "Server Maintenance": "#F59E0B",
    "Security": "#EF4444",
    "Troubleshooting": "#8B5CF6",
    "General Procedures": "#64748B"
}


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_docs = db.query(Document).count()
    indexed_sops = db.query(Document).filter(Document.status == "indexed").count()
    queries_count = db.query(QueryLog).count()
    successful_retrievals = db.query(QueryLog).filter(QueryLog.success == True).count()

    success_rate = round((successful_retrievals / queries_count * 100), 1) if queries_count > 0 else 0.0

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

    timeline_points = []
    today = datetime.utcnow().date()
    for i in range(6, -1, -1):
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
        timeline_points.append(
            QueryActivityPoint(
                date=day.strftime("%b %d"),
                queries=q_count,
                documents_indexed=d_count
            )
        )

    recent_docs_rows = (
        db.query(Document)
        .order_by(Document.created_at.desc())
        .limit(5)
        .all()
    )
    recent_sops = [
        {
            "id": d.id,
            "title": d.title,
            "category": d.category,
            "chunk_count": d.chunk_count,
            "status": d.status,
            "created_at": d.created_at.strftime("%Y-%m-%d %H:%M")
        }
        for d in recent_docs_rows
    ]

    recent_act_rows = (
        db.query(UserActivity)
        .order_by(UserActivity.created_at.desc())
        .limit(6)
        .all()
    )
    recent_activities = [
        {
            "id": a.id,
            "type": a.activity_type,
            "description": a.description,
            "created_at": a.created_at.strftime("%H:%M:%S")
        }
        for a in recent_act_rows
    ]

    health_data = get_system_health(db)

    return DashboardStats(
        total_documents=total_docs,
        indexed_sops=indexed_sops,
        queries_processed=queries_count,
        successful_retrievals=successful_retrievals,
        success_rate_percentage=success_rate,
        categories=categories,
        activity_timeline=timeline_points,
        recent_sops=recent_sops,
        recent_activities=recent_activities,
        system_health=health_data.model_dump()
    )
