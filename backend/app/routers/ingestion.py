from fastapi import APIRouter, UploadFile, File
from app.tasks.ingestion_tasks import process_document_task
from app.database.session import get_db
from app.models.core import Document
from fastapi import Depends
from sqlalchemy.orm import Session
import os
import uuid
from app.core.exceptions import DocumentNotFoundError, StorageError, UnsupportedFileTypeError, ValidationError
from app.repositories.document_repository import DocumentRepository

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
        raise ValidationError("No file provided.", field="file")
        
    allowed_extensions = [".pdf", ".csv", ".txt"]
    if not any(file.filename.endswith(ext) for ext in allowed_extensions):
        raise UnsupportedFileTypeError(file.filename)

    doc_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{file.filename}")
    document_repository = DocumentRepository(db)

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
        document_repository.create(new_doc)

        # Submit to Celery Queue or run synchronously if Celery/Redis is not configured/running
        run_sync = os.getenv("SYNC_INGESTION", "true").lower() == "true"
        if run_sync:
            try:
                process_document_task(doc_id, file_path, file.filename)
            except Exception as e:
                print(f"[Ingestion] Synchronous processing failed: {e}")
                raise e
        else:
            try:
                process_document_task.delay(doc_id, file_path, file.filename)
            except Exception as celery_err:
                print(f"[Ingestion] Celery task failed to queue: {celery_err}. Running synchronously.")
                process_document_task(doc_id, file_path, file.filename)
        
        return {
            "message": "Document uploaded successfully and queued for background processing.",
            "document_id": doc_id,
            "filename": file.filename
        }
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise StorageError(f"Failed to upload document: {str(e)}") from e

@router.get("/status/{document_id}")
def get_document_status(document_id: str, db: Session = Depends(get_db)):
    """
    Endpoint to poll processing status of a document.
    """
    document_repository = DocumentRepository(db)
    doc = document_repository.get_by_id(document_id)
    if not doc:
        raise DocumentNotFoundError(document_id)
        
    return {
        "document_id": doc.id,
        "filename": doc.filename,
        "status": doc.processing_status
    }

@router.get("/")
def list_documents(db: Session = Depends(get_db)):
    """
    Endpoint to list all uploaded documents.
    """
    document_repository = DocumentRepository(db)
    docs = document_repository.find_all()
    return [
        {
            "document_id": doc.id,
            "filename": doc.filename,
            "category": doc.category,
            "status": doc.processing_status,
            "upload_timestamp": doc.upload_timestamp.isoformat() if doc.upload_timestamp else None,
            "page_count": doc.page_count,
            "file_size": doc.file_size
        }
        for doc in docs
    ]

