import os
import sys
import uuid

# Ensure backend directory is in python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

from dotenv import load_dotenv
# Load environment variables from .env in project root
project_root = os.path.dirname(backend_dir)
load_dotenv(dotenv_path=os.path.join(project_root, ".env"))

from app.database.session import SessionLocal, engine, Base
from sqlalchemy import text
from app.models.core import Project, Document as DbDocument
from app.services.document_parser import DocumentParser
from app.rag.indexer import DocumentIndexer

def seed():
    print("==========================================================")
    print("DATABASE SEEDING STARTED")
    print("==========================================================")
    
    # 1. Initialize SQLite Database tables
    print("[1/4] Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Clean previous records for a fresh seed
    print(" -> Clearing previous database entries for a fresh seed...")
    db.execute(text("DELETE FROM embeddings"))
    db.execute(text("DELETE FROM chunks"))
    db.execute(text("DELETE FROM documents"))
    db.execute(text("DELETE FROM pages"))
    db.execute(text("DELETE FROM engineering_entities"))
    db.commit()
    
    # 2. Check/create default project
    print("[2/4] Verifying project context...")
    project_id = "default-project"
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        project = Project(
            id=project_id,
            name="Phoenix DC-01",
            client_org="NxtGen Cloud Infrastructure Ltd",
            location="Bengaluru",
            lifecycle_stage="Construction"
        )
        db.add(project)
        db.commit()
        print(" -> Created default project 'Phoenix DC-01'.")
    else:
        print(f" -> Found existing project context: '{project.name}'.")
        
    # 3. Read files from datasets/knowledge_base/
    kb_dir = os.path.join(project_root, "datasets", "knowledge_base")
    print(f"[3/4] Searching for text files in: {kb_dir}")
    if not os.path.exists(kb_dir):
        print(f"ERROR: Knowledge base directory '{kb_dir}' not found!")
        return
        
    files = sorted([f for f in os.listdir(kb_dir) if f.endswith(".txt")])
    print(f" -> Found {len(files)} files to process.")
    
    # 4. Ingest and embed files
    print("[4/4] Ingesting and generating embeddings (this calls OpenAI)...")
    indexer = DocumentIndexer(db)
    
    for filename in files:
        file_path = os.path.join(kb_dir, filename)
        
        # Check if already exists
        existing_doc = db.query(DbDocument).filter(DbDocument.filename == filename).first()
        if existing_doc:
            print(f"[-] '{filename}' already exists in DB. Skipping.")
            continue
            
        print(f"[+] Indexing '{filename}'...")
        
        try:
            # Create Document database record
            doc_id = str(uuid.uuid4())
            new_doc = DbDocument(
                id=doc_id,
                project_id=project_id,
                filename=filename,
                storage_path=file_path,
                category="Specification" if "spec" in filename.lower() else "Submittal" if "submittal" in filename.lower() else "General",
                processing_status="Processing",
                file_size=os.path.getsize(file_path)
            )
            db.add(new_doc)
            db.commit()
            
            # Parse document
            blocks = DocumentParser.parse_txt(file_path)
            # Chunk blocks
            chunks = DocumentParser.chunk_text(blocks)
            
            # Generate versioned embeddings & extract entities
            indexed_chunks = indexer.index_chunks(doc_id, chunks)
            
            # Update Document status
            new_doc.processing_status = "Completed"
            new_doc.page_count = max(1, indexed_count := len(chunks))
            db.commit()
            
            print(f"    -> Complete: indexed {indexed_chunks} chunks.")
            
        except Exception as e:
            print(f"    -> ERROR indexing '{filename}': {e}")
            db.rollback()
            
    db.close()
    print("==========================================================")
    print("DATABASE SEEDING COMPLETE")
    print("==========================================================")

if __name__ == "__main__":
    seed()
