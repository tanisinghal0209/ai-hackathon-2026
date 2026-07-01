import os
from llama_index.core import VectorStoreIndex, Document as LlamaDocument
from llama_index.embeddings.openai import OpenAIEmbedding
from sqlalchemy.orm import Session
from app.models.core import Chunk, Document as DbDocument
import uuid

# Engine Decision 17-E: LlamaIndex manages documents.
# The Indexer relies on pre-chunked semantic chunks (512 tokens / 50 overlap) stored in pgvector.
# For Hackathon purposes, we use OpenAI embeddings as specified in 17.8.

class DocumentIndexer:
    def __init__(self, db_session: Session):
        self.db = db_session
        self.embed_model = OpenAIEmbedding(
            api_key=os.getenv("OPENAI_API_KEY"),
            model="text-embedding-3-small"
        )

    def index_chunks(self, document_id: str, chunks_data: list):
        """
        Takes raw chunk texts extracted from the DocumentParser,
        generates embeddings via LlamaIndex/OpenAI, and stores them in pgvector.
        """
        # Fetch document metadata
        doc = self.db.query(DbDocument).filter(DbDocument.id == document_id).first()
        if not doc:
            raise ValueError(f"Document {document_id} not found in DB.")
            
        for chunk_meta in chunks_data:
            # 1. Store the literal text in Chunks table (17.7)
            chunk_record = Chunk(
                id=str(uuid.uuid4()),
                page_id=str(uuid.uuid4()), # Stub: page should be created earlier
                document_id=document_id,
                text=chunk_meta["text"],
                chunk_order=chunk_meta.get("order", 0)
            )
            self.db.add(chunk_record)
            
            # 2. Generate embedding
            # 17.8 Embedding Generation (text-embedding-3-small)
            vector = self.embed_model.get_text_embedding(chunk_meta["text"])
            
            # 3. Store vector in Embeddings table with pgvector
            from app.models.core import Embedding
            embed_record = Embedding(
                id=str(uuid.uuid4()),
                chunk_id=chunk_record.id,
                model="text-embedding-3-small",
                vector_dimension=1536,
                vector=vector
            )
            self.db.add(embed_record)
            
        self.db.commit()
