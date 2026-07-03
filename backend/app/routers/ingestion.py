from fastapi import APIRouter, UploadFile, File, HTTPException
from app.tasks.ingestion_tasks import process_document_task
from app.database.session import get_db
from app.models.core import Document
from fastapi import Depends
from sqlalchemy.orm import Session
import os
import uuid

router = APIRouter()

# Temporary local storage for uploaded files before processing
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Chapter 20: Intelligent Document Ingestion
    Uploads a document for ingestion and queues it via Celery (EDR 20-C).
    Returns a unique document ID immediately for polling.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
        
    allowed_extensions = [".pdf", ".csv"]
    if not any(file.filename.endswith(ext) for ext in allowed_extensions):
        raise HTTPException(status_code=400, detail="Unsupported file format")

    doc_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{file.filename}")

    try:
        # Save file locally for background worker
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
            
        # Register in database with "Queued" status
        new_doc = Document(
            id=doc_id,
            project_id="default-project", # Stub for hackathon
            filename=file.filename,
            storage_path=file_path,
            processing_status="Queued"
        )
        db.add(new_doc)
        db.commit()

        # Submit to Celery Queue
        process_document_task.delay(doc_id, file_path, file.filename)
        
        return {
            "message": "Document uploaded successfully and queued for background processing.",
            "document_id": doc_id,
            "filename": file.filename
        }
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Failed to upload document: {str(e)}")

@router.get("/status/{document_id}")
def get_document_status(document_id: str, db: Session = Depends(get_db)):
    """
    Endpoint to poll processing status of a document.
    """
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    return {
        "document_id": doc.id,
        "filename": doc.filename,
        "status": doc.processing_status
    }
