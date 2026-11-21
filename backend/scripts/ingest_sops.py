import os
import sys
import io

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import HTTPException
from starlette.datastructures import UploadFile
from app.database.session import SessionLocal
from app.api.documents import upload_documents
from app.models.document import Document, DocumentChunk
from app.services.vector_store import vector_store

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "sample_sops"))

def run_ingestion():
    db = SessionLocal()
    print("=================================================================")
    print("STEP 1: INGEST SOP-MNT-001.pdf INTO KNOWLEDGE HUB")
    print("=================================================================")
    mnt_path = os.path.join(DATA_DIR, "SOP-MNT-001.pdf")
    if not os.path.exists(mnt_path):
        raise FileNotFoundError(f"Missing file: {mnt_path}")

    # Check if already present in DB; if so, clear it first so we test fresh upload
    existing_mnt = db.query(Document).filter(Document.id == "SOP-MNT-001").first()
    if existing_mnt:
        print(f"Removing pre-existing {existing_mnt.id} to test clean upload...")
        vector_store.delete_document("SOP-MNT-001")
        db.query(DocumentChunk).filter(DocumentChunk.document_id == "SOP-MNT-001").delete()
        db.delete(existing_mnt)
        db.commit()

    with open(mnt_path, "rb") as f:
        content_bytes = f.read()
    
    upload_file_mnt = UploadFile(
        file=io.BytesIO(content_bytes),
        filename="SOP-MNT-001.pdf"
    )

    docs_created = upload_documents(
        files=[upload_file_mnt],
        category="Industrial Maintenance",
        description="Industrial Machine Preventive Maintenance Standard Operating Procedure",
        db=db
    )
    doc_mnt = docs_created[0]
    print(f"SUCCESS: Ingested {doc_mnt.id} | Title: {doc_mnt.title}")
    print(f"  Pages: {doc_mnt.page_count} | Chunks: {doc_mnt.chunk_count} | Category: {doc_mnt.category}")

    print("\n=================================================================")
    print("STEP 2: INGEST SOP-IT-002.pdf INTO KNOWLEDGE HUB")
    print("=================================================================")
    it_path = os.path.join(DATA_DIR, "SOP-IT-002.pdf")
    if not os.path.exists(it_path):
        raise FileNotFoundError(f"Missing file: {it_path}")

    existing_it = db.query(Document).filter(Document.id == "SOP-IT-002").first()
    if existing_it:
        print(f"Removing pre-existing {existing_it.id} to test clean upload...")
        vector_store.delete_document("SOP-IT-002")
        db.query(DocumentChunk).filter(DocumentChunk.document_id == "SOP-IT-002").delete()
        db.delete(existing_it)
        db.commit()

    with open(it_path, "rb") as f:
        content_bytes_it = f.read()

    upload_file_it = UploadFile(
        file=io.BytesIO(content_bytes_it),
        filename="SOP-IT-002.pdf"
    )

    docs_created_it = upload_documents(
        files=[upload_file_it],
        category="Network Management",
        description="IT Network Troubleshooting & Incident Resolution Standard Operating Procedure",
        db=db
    )
    doc_it = docs_created_it[0]
    print(f"SUCCESS: Ingested {doc_it.id} | Title: {doc_it.title}")
    print(f"  Pages: {doc_it.page_count} | Chunks: {doc_it.chunk_count} | Category: {doc_it.category}")

    print("\n=================================================================")
    print("STEP 3: TEST DUPLICATE PREVENTION (HTTP 409)")
    print("=================================================================")
    try:
        dup_file = UploadFile(
            file=io.BytesIO(content_bytes),
            filename="SOP-MNT-001.pdf"
        )
        upload_documents(
            files=[dup_file],
            category="Industrial Maintenance",
            db=db
        )
        print("ERROR: Duplicate upload should have failed with HTTP 409!")
    except HTTPException as e:
        print(f"PASS: Duplicate upload blocked with HTTP {e.status_code}: {e.detail}")

    print("\n=================================================================")
    print("STEP 4: VERIFY VECTOR STORE CHROMA COLLECTION")
    print("=================================================================")
    coll = vector_store.get_collection()
    print(f"Chroma collection count: {coll.count()} chunks total")
    sample_mnt_chunks = coll.get(where={"document_id": "SOP-MNT-001"})
    print(f"SOP-MNT-001 chunks in Chroma: {len(sample_mnt_chunks['ids'])}")
    sample_it_chunks = coll.get(where={"document_id": "SOP-IT-002"})
    print(f"SOP-IT-002 chunks in Chroma: {len(sample_it_chunks['ids'])}")
    print("=================================================================\n")
    db.close()

if __name__ == "__main__":
    run_ingestion()
