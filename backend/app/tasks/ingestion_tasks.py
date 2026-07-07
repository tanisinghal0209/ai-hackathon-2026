"""
Chapter 20: Full Ingestion Task
Orchestrates the complete pipeline:
  Parse → Chunk → [Entity Extraction] → [Embedding] → Completed
Updates Document.processing_status at every stage.
Celery autoretry handles transient failures (EDR 20-D).
"""
import os
from app.worker import celery_app
from app.services.document_parser import DocumentParser
from app.rag.indexer import DocumentIndexer
from app.database.session import SessionLocal
from app.models.core import Document
from app.events import document_event
from app.services.event_publisher import EventPublisher


@celery_app.task(
    bind=True,
    max_retries=3,
    autoretry_for=(Exception,),
    retry_backoff=True,
    queue="document_processing",
)
def process_document_task(self, document_id: str, file_path: str, filename: str):
    """
    Full Engineering Knowledge Acquisition pipeline (Chapter 20).
    Every processing status change is persisted so the /status endpoint reflects
    live progress even for 10,000-page documents.
    """
    db = SessionLocal()
    doc = db.query(Document).filter(Document.id == document_id).first()
    event_publisher = EventPublisher()
    correlation_id = document_id

    def _update_status(status: str):
        if doc:
            doc.processing_status = status
            db.commit()
            event_publisher.publish(
                document_event(
                    f"Document{status}Event",
                    document_id=document_id,
                    correlation_id=correlation_id,
                    filename=filename,
                    status=status,
                )
            )

    try:
        # ---- Stage 1: Parsing (20.13 / 20.14) ----
        _update_status("Parsing")
        if file_path.lower().endswith(".pdf"):
            structured_blocks = DocumentParser.parse_pdf(file_path)
        elif file_path.lower().endswith(".txt"):
            structured_blocks = DocumentParser.parse_txt(file_path)
        else:
            structured_blocks = []
        event_publisher.publish(
            document_event(
                "DocumentParsedEvent",
                document_id=document_id,
                correlation_id=correlation_id,
                filename=filename,
                block_count=len(structured_blocks),
            )
        )

        # ---- Stage 2: Semantic Chunking (20.21 / 20.22) ----
        _update_status("Chunking")
        chunks = DocumentParser.chunk_text(structured_blocks, chunk_size=512, overlap=50)
        event_publisher.publish(
            document_event(
                "ChunkGenerationCompletedEvent",
                document_id=document_id,
                correlation_id=correlation_id,
                filename=filename,
                chunk_count=len(chunks),
            )
        )

        # ---- Stage 3: Entity Recognition + Embedding Generation (20.25 / 20.28-20.30) ----
        _update_status("Embedding")
        if chunks:
            indexer = DocumentIndexer(db)
            total = indexer.index_chunks(document_id, chunks)
            event_publisher.publish(
                document_event(
                    "KnowledgeIndexedEvent",
                    document_id=document_id,
                    correlation_id=correlation_id,
                    filename=filename,
                    indexed_chunks=total,
                )
            )
            print(f"[Worker] {filename}: indexed {total} chunks with entity extraction and versioned embeddings.")
        else:
            print(f"[Worker] {filename}: no chunks produced — document may be empty or unsupported.")

        # ---- Completed ----
        _update_status("Completed")

    except Exception as exc:
        # EDR 20-D: autoretry_for handles transient errors with exponential backoff.
        # On final retry exhaustion, mark as Failed (Dead-Letter logic).
        print(f"[Worker ERROR] {filename}: {exc}")
        if self.request.retries >= self.max_retries:
            _update_status("Failed")
        raise exc
    finally:
        db.close()
        if os.path.exists(file_path):
            os.remove(file_path)
