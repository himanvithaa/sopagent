import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, Boolean
from app.database.base import Base


class QueryLog(Base):
    __tablename__ = "query_logs"

    id = Column(String(64), primary_key=True, index=True)
    query_text = Column(Text, nullable=False)
    conversation_id = Column(String(64), nullable=True, index=True)
    document_matches_count = Column(Integer, default=0)
    top_relevance_score = Column(Float, default=0.0)
    response_time_ms = Column(Integer, default=0)
    success = Column(Boolean, default=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)


class UserActivity(Base):
    __tablename__ = "user_activity"

    id = Column(String(64), primary_key=True, index=True)
    activity_type = Column(String(64), nullable=False, index=True)  # upload, delete, query, view_sop, system_check
    description = Column(Text, nullable=False)
    target_id = Column(String(64), nullable=True)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
