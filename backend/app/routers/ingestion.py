from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from app.services.document_parser import DocumentParser
import os
import uuid

router = APIRouter()

# Temporary local storage for uploaded files before processing
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def process_document(file_path: str, filename: str):
    """
    Background task to process the uploaded document.
    """
    try:
        # Extract and parse text
        if file_path.endswith('.pdf'):
            pages = DocumentParser.parse_pdf(file_path)
        else:
            # Handle other types like CSV later
            pages = []
            
        # Chunk text (512 tokens with 50 overlap as per SRS)
        chunks = DocumentParser.chunk_text(pages, chunk_size=512, overlap=50)
        
        # TODO: Vectorize chunks using Voyage AI or OpenAI and store in Supabase pgvector
        print(f"Processed {filename}: extracted {len(chunks)} chunks.")
        
    except Exception as e:
        print(f"Error processing {filename}: {e}")
    finally:
        # Clean up local file
        if os.path.exists(file_path):
            os.remove(file_path)

@router.post("/upload")
async def upload_document(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Uploads a document for ingestion. Returns a unique document ID immediately,
    and processes the document asynchronously in the background.
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
            
        # Add background processing task
        background_tasks.add_task(process_document, file_path, file.filename)
        
        return {
            "message": "Document uploaded successfully and is being processed.",
            "document_id": doc_id,
            "filename": file.filename
        }
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Failed to upload document: {str(e)}")
