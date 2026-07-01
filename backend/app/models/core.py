from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from datetime import datetime
import uuid

from app.database.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    client_org = Column(String)
    location = Column(String)
    lifecycle_stage = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    filename = Column(String, nullable=False)
    storage_path = Column(String, nullable=False)
    upload_timestamp = Column(DateTime, default=datetime.utcnow)
    uploader_id = Column(String) # For future auth integration
    category = Column(String)
    processing_status = Column(String, default="Pending")
    page_count = Column(Integer)
    language = Column(String, default="en")
    file_size = Column(Integer)
    checksum = Column(String)
    parser_version = Column(String)

    project = relationship("Project")

class Page(Base):
    __tablename__ = "pages"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    page_number = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    
    document = relationship("Document")

class Chunk(Base):
    __tablename__ = "chunks"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    page_id = Column(String, ForeignKey("pages.id"), nullable=False)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    text = Column(Text, nullable=False)
    chunk_order = Column(Integer, nullable=False)
    token_count = Column(Integer)
    section_heading = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    page = relationship("Page")
    document = relationship("Document")

class Embedding(Base):
    __tablename__ = "embeddings"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    chunk_id = Column(String, ForeignKey("chunks.id"), nullable=False)
    model = Column(String, nullable=False)
    vector_dimension = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    model_version = Column(String)
    
    # Requires pgvector extension in PostgreSQL
    vector = Column(Vector(1536)) # Assuming text-embedding-3-small (1536 dims)
    
    chunk = relationship("Chunk")
