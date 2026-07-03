import os
from celery.exceptions import SoftTimeLimitExceeded
from app.worker import celery_app
from app.services.document_parser import DocumentParser
from app.database.session import SessionLocal
from app.models.core import Document

@celery_app.task(bind=True, max_retries=3, autoretry_for=(Exception,), retry_backoff=True)
def process_document_task(self, document_id: str, file_path: str, filename: str):
    """
    Chapter 20: Asynchronous Document Processing with Retry Policies.
    Parses, chunks, and prepares documents for indexing.
    Updates PostgreSQL state at each milestone.
    """
    db = SessionLocal()
    doc = db.query(Document).filter(Document.id == document_id).first()
    
    try:
        if doc:
            doc.processing_status = "Parsing"
            db.commit()

        # 1. Parsing Phase
        if file_path.endswith('.pdf'):
            pages = DocumentParser.parse_pdf(file_path)
        else:
            pages = []
            
        if doc:
            doc.processing_status = "Chunking"
            db.commit()

        # 2. Semantic Chunking Phase (512 tokens / 50 overlap)
        chunks = DocumentParser.chunk_text(pages, chunk_size=512, overlap=50)
        
        if doc:
            doc.processing_status = "Embedding"
            db.commit()

        # 3. Embedding and Indexing Phase
        # For full implementation, DocumentIndexer logic is called here.
        # e.g., indexer = DocumentIndexer(db)
        # indexer.index_chunks(document_id, chunks)

        print(f"Worker finished processing {filename}: generated {len(chunks)} semantic chunks.")
        
        if doc:
            doc.processing_status = "Completed"
            db.commit()

    except Exception as e:
        # EDR 20-D: Let Celery handle transient exceptions with exponential backoff.
        # If it reaches max retries, mark as Failed (Dead-Letter queue logic)
        print(f"Task Failed: {e}")
        if self.request.retries == self.max_retries:
            if doc:
                doc.processing_status = "Failed"
                db.commit()
        raise e
    finally:
        db.close()
        # Clean up local file in worker environment
        if os.path.exists(file_path):
            os.remove(file_path)
