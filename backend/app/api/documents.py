import os
import re
import uuid
import shutil
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.document import Document, DocumentChunk
from app.models.log import UserActivity
from app.schemas.document import DocumentResponse, DocumentDetailResponse
from app.services.document_parser import DocumentParser
from app.services.vector_store import vector_store
from app.core.config import settings

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload", response_model=List[DocumentResponse])
def upload_documents(
    files: List[UploadFile] = File(...),
    category: str = Form("General Procedures"),
    description: Optional[str] = Form(""),
    db: Session = Depends(get_db)
):
    storage_dir = os.path.join(settings.STORAGE_DIRECTORY, "documents")
    os.makedirs(storage_dir, exist_ok=True)

    allowed_exts = {".pdf", ".docx", ".txt"}
    created_documents = []

    for file in files:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in allowed_exts:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported format '{ext}' for file {file.filename}. Allowed: PDF, DOCX, TXT"
            )

        # Extract standardized SOP ID if present in filename (e.g. SOP-MNT-001 or SOP-IT-002)
        match = re.search(r"(SOP-[A-Z]+-\d+)", file.filename, re.IGNORECASE)
        if match:
            doc_id = match.group(1).upper()
        else:
            doc_id = f"SOP-{uuid.uuid4().hex[:8].upper()}"

        # Prevent duplicate document ingestion
        existing = db.query(Document).filter(
            (Document.id == doc_id) | (Document.filename == file.filename)
        ).first()
        if existing:
            raise HTTPException(
                status_code=409,
                detail=f"Duplicate document rejected: '{file.filename}' (ID: {doc_id}) has already been ingested into the Knowledge Hub."
            )

        saved_filename = f"{doc_id}_{file.filename}"
        saved_path = os.path.join(storage_dir, saved_filename)

        with open(saved_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_size = os.path.getsize(saved_path)

        try:
            pages_data, page_count = DocumentParser.extract_text_from_file(saved_path, ext.strip("."))
            chunks = DocumentParser.chunk_document(
                pages_data,
                chunk_size=settings.CHUNK_SIZE,
                chunk_overlap=settings.CHUNK_OVERLAP
            )

            # Determine clean, standardized title and category
            if doc_id == "SOP-MNT-001":
                clean_title = "SOP-MNT-001: Industrial Machine Preventive Maintenance"
                doc_category = "Industrial Maintenance"
            elif doc_id == "SOP-IT-002":
                clean_title = "SOP-IT-002: IT Network Troubleshooting and Incident Resolution"
                doc_category = "Network Management"
            else:
                clean_title = os.path.splitext(file.filename)[0].replace("_", " ").replace("-", " ")
                if not clean_title.upper().startswith("SOP"):
                    clean_title = f"{doc_id}: {clean_title}"
                doc_category = category if isinstance(category, str) and category != "General Procedures" else "General Procedures"

            now = datetime.now(timezone.utc)
            doc = Document(
                id=doc_id,
                title=clean_title,
                filename=file.filename,
                file_path=os.path.abspath(saved_path),
                file_size=file_size,
                file_type=ext.strip("."),
                category=doc_category,
                description=description if isinstance(description, str) and description else f"Standard Operating Procedure: {clean_title}",
                status="indexed",
                chunk_count=len(chunks),
                page_count=page_count,
                created_at=now,
                updated_at=now
            )
            db.add(doc)

            for chunk_data in chunks:
                chunk_obj = DocumentChunk(
                    id=f"{doc_id}_chunk_{chunk_data['chunk_index']}",
                    document_id=doc_id,
                    chunk_index=chunk_data["chunk_index"],
                    page_number=chunk_data["page_number"],
                    section_title=chunk_data["section_title"],
                    content=chunk_data["content"],
                    created_at=now
                )
                db.add(chunk_obj)

            db.commit()
            db.refresh(doc)

            # Store vectors in ChromaDB
            vector_store.add_document_chunks(
                document_id=doc_id,
                document_title=doc.title,
                category=doc.category,
                chunks=chunks
            )

            act = UserActivity(
                id=str(uuid.uuid4()),
                activity_type="upload",
                description=f"Uploaded & indexed SOP: {doc.title}",
                target_id=doc_id,
                created_at=now
            )
            db.add(act)
            db.commit()

            created_documents.append(doc)

        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            now = datetime.now(timezone.utc)
            failed_doc = Document(
                id=doc_id,
                title=file.filename,
                filename=file.filename,
                file_path=os.path.abspath(saved_path),
                file_size=file_size,
                file_type=ext.strip("."),
                category=category if isinstance(category, str) else "General Procedures",
                description=description if isinstance(description, str) else "",
                status="failed",
                error_message=str(e),
                chunk_count=0,
                page_count=0,
                created_at=now,
                updated_at=now
            )
            db.add(failed_doc)
            db.commit()
            db.refresh(failed_doc)
            created_documents.append(failed_doc)

    return created_documents


@router.get("", response_model=List[DocumentResponse])
def list_documents(
    category: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Document)
    if isinstance(category, str) and category and category != "All":
        query = query.filter(Document.category == category)
    if isinstance(status, str) and status and status != "All":
        query = query.filter(Document.status == status)
    if isinstance(search, str) and search.strip():
        query = query.filter(Document.title.ilike(f"%{search.strip()}%") | Document.description.ilike(f"%{search.strip()}%"))

    return query.order_by(Document.created_at.desc()).all()


@router.get("/{doc_id}", response_model=DocumentDetailResponse)
def get_document(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    preview = None
    if os.path.exists(doc.file_path):
        try:
            with open(doc.file_path, "r", encoding="utf-8", errors="ignore") as f:
                preview = f.read(4000)
        except Exception:
            preview = None

    act = UserActivity(
        id=str(uuid.uuid4()),
        activity_type="view_sop",
        description=f"Viewed SOP: {doc.title}",
        target_id=doc.id,
        created_at=datetime.now(timezone.utc)
    )
    db.add(act)
    db.commit()

    return DocumentDetailResponse(
        id=doc.id,
        title=doc.title,
        filename=doc.filename,
        file_path=doc.file_path,
        file_size=doc.file_size,
        file_type=doc.file_type,
        category=doc.category,
        description=doc.description,
        status=doc.status,
        chunk_count=doc.chunk_count,
        page_count=doc.page_count,
        error_message=doc.error_message,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
        chunks=doc.chunks,
        content_preview=preview
    )


@router.delete("/{doc_id}")
def delete_document(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    vector_store.delete_document(doc_id)

    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    title = doc.title
    db.delete(doc)

    act = UserActivity(
        id=str(uuid.uuid4()),
        activity_type="delete",
        description=f"Deleted SOP: {title}",
        target_id=doc_id,
        created_at=datetime.now(timezone.utc)
    )
    db.add(act)
    db.commit()

    return {"status": "success", "message": f"Document '{title}' deleted from repository and vector index."}
