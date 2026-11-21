import uuid
import json
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.chat import Conversation, Message
from app.schemas.chat import (
    ChatMessageRequest,
    ChatMessageResponse,
    ConversationResponse,
    ConversationSummary,
    StructuredResponse,
    SourceCitation
)
from app.services.rag_service import rag_service

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("", response_model=ChatMessageResponse)
def send_chat_message(request: ChatMessageRequest, db: Session = Depends(get_db)):
    user_query = request.message.strip()
    if not user_query:
        raise HTTPException(status_code=400, detail="Query message cannot be empty")

    now = datetime.now(timezone.utc)
    conv_id = request.conversation_id
    if conv_id:
        conversation = db.query(Conversation).filter(Conversation.id == conv_id).first()
        if not conversation:
            conv_id = str(uuid.uuid4())
            conversation = Conversation(
                id=conv_id,
                title=user_query[:40] + ("..." if len(user_query) > 40 else ""),
                created_at=now,
                updated_at=now
            )
            db.add(conversation)
            db.commit()
    else:
        conv_id = str(uuid.uuid4())
        conversation = Conversation(
            id=conv_id,
            title=user_query[:40] + ("..." if len(user_query) > 40 else ""),
            created_at=now,
            updated_at=now
        )
        db.add(conversation)
        db.commit()

    user_msg_id = str(uuid.uuid4())
    user_msg = Message(
        id=user_msg_id,
        conversation_id=conv_id,
        role="user",
        content=user_query,
        created_at=now
    )
    db.add(user_msg)
    db.commit()

    past_messages = (
        db.query(Message)
        .filter(Message.conversation_id == conv_id)
        .order_by(Message.created_at)
        .all()
    )
    history = [{"role": m.role, "content": m.content} for m in past_messages]

    rag_result = rag_service.process_query(
        query=user_query,
        db=db,
        conversation_id=conv_id,
        category=request.category_filter,
        history=history
    )

    assistant_msg_id = str(uuid.uuid4())
    sources_data = [
        SourceCitation(
            document_id=s["document_id"],
            document_title=s["document_title"],
            category=s["category"],
            page_number=s["page_number"],
            section_title=s["section_title"],
            excerpt=s["excerpt"],
            relevance_score=s["relevance_score"]
        )
        for s in rag_result.get("source_references", [])
    ]

    structured_obj = StructuredResponse(
        understanding=rag_result.get("understanding", ""),
        relevant_sop_found=rag_result.get("relevant_sop_found", ""),
        recommended_corrective_actions=rag_result.get("recommended_corrective_actions", []),
        important_notes=rag_result.get("important_notes", []),
        source_references=sources_data,
        is_grounded_in_docs=rag_result.get("is_grounded_in_docs", True)
    )

    assistant_msg = Message(
        id=assistant_msg_id,
        conversation_id=conv_id,
        role="assistant",
        content=rag_result.get("raw_text", ""),
        structured_data=structured_obj.model_dump_json(),
        retrieved_chunks=json.dumps([s.model_dump() for s in sources_data]),
        created_at=datetime.now(timezone.utc)
    )
    db.add(assistant_msg)

    conversation.updated_at = datetime.now(timezone.utc)
    db.commit()

    return ChatMessageResponse(
        id=assistant_msg_id,
        conversation_id=conv_id,
        role="assistant",
        content=assistant_msg.content,
        structured_data=structured_obj,
        retrieved_chunks=sources_data,
        created_at=assistant_msg.created_at
    )


@router.get("/conversations", response_model=List[ConversationSummary])
def get_conversations(db: Session = Depends(get_db)):
    convs = db.query(Conversation).order_by(Conversation.updated_at.desc()).all()
    results = []
    for c in convs:
        count = db.query(Message).filter(Message.conversation_id == c.id).count()
        results.append(
            ConversationSummary(
                id=c.id,
                title=c.title,
                created_at=c.created_at,
                updated_at=c.updated_at,
                message_count=count
            )
        )
    return results


@router.get("/history/{conv_id}", response_model=ConversationResponse)
def get_conversation_history(conv_id: str, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages_out = []
    for m in conv.messages:
        struct_data = None
        if m.structured_data:
            try:
                struct_data = StructuredResponse(**json.loads(m.structured_data))
            except Exception:
                struct_data = None

        chunks_data = []
        if m.retrieved_chunks:
            try:
                raw_c = json.loads(m.retrieved_chunks)
                chunks_data = [SourceCitation(**c) for c in raw_c]
            except Exception:
                chunks_data = []

        messages_out.append(
            ChatMessageResponse(
                id=m.id,
                conversation_id=m.conversation_id,
                role=m.role,
                content=m.content,
                structured_data=struct_data,
                retrieved_chunks=chunks_data,
                created_at=m.created_at
            )
        )

    return ConversationResponse(
        id=conv.id,
        title=conv.title,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        messages=messages_out
    )


@router.delete("/conversations/{conv_id}")
def delete_conversation(conv_id: str, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(conv)
    db.commit()
    return {"status": "success", "message": "Conversation cleared"}
