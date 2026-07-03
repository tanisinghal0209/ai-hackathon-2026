"""
Chapter 20.23 — Parent-Child Chunk Relationships
Chapter 20.24 — Chunk Metadata
Chapter 20.28 — Embedding Generation Pipeline
Chapter 20.29 — Embedding Versioning
Chapter 20.30 — Vector Index Construction

DocumentIndexer takes the structured output of DocumentParser (rich blocks with
heading hierarchy and semantic roles), stores chunks with full metadata, links
parent-child relationships, extracts engineering entities, and generates versioned
embeddings into pgvector.
"""
import os
import re
import uuid
from datetime import datetime
from llama_index.embeddings.openai import OpenAIEmbedding
from sqlalchemy.orm import Session
from app.models.core import Chunk, Embedding, EngineeringEntity, Document as DbDocument, Page
from app.services.entity_extractor import extract_entities, infer_discipline_and_category

# Pipeline version — bump this when the ingestion logic changes (EDR 20-N)
PIPELINE_VERSION = "1.0.0"
EMBEDDING_MODEL = "text-embedding-3-small"


class DocumentIndexer:
    def __init__(self, db_session: Session):
        self.db = db_session
        self.embed_model = OpenAIEmbedding(
            api_key=os.getenv("OPENAI_API_KEY"),
            model=EMBEDDING_MODEL,
        )

    def index_chunks(self, document_id: str, chunks_data: list):
        """
        Full pipeline per 20.23-20.30:
        1. Create or reuse a Page record per chunk.
        2. Store Chunk with rich metadata (section heading, semantic role, discipline…).
        3. Link previous/next chunk ids (navigable chain).
        4. Extract and store EngineeringEntities (20.25).
        5. Generate embedding and store as versioned Embedding (20.29).
        """
        doc = self.db.query(DbDocument).filter(DbDocument.id == document_id).first()
        if not doc:
            raise ValueError(f"Document {document_id} not found in DB.")

        # Archive any previous active embeddings for this document (re-indexing scenario)
        self.db.execute(
            """UPDATE embeddings SET is_active = 0
               WHERE chunk_id IN (SELECT id FROM chunks WHERE document_id = :doc_id)""",
            {"doc_id": document_id}
        )

        chunk_records = []

        for order, chunk_meta in enumerate(chunks_data):
            raw_text = chunk_meta.get("text", "")
            page_num = chunk_meta.get("page_number", 1)

            # --- Page record (get or create) ---
            page_record = (
                self.db.query(Page)
                .filter(Page.document_id == document_id, Page.page_number == page_num)
                .first()
            )
            if not page_record:
                page_record = Page(
                    id=str(uuid.uuid4()),
                    document_id=document_id,
                    page_number=page_num,
                    text="",  # full page text is not stored at page level in this design
                )
                self.db.add(page_record)
                self.db.flush()  # get the id before the chunk FK ref

            # --- Infer discipline/category from text ---
            meta = infer_discipline_and_category(raw_text)

            # --- Extract clause identifier from heading if present (e.g. "4.2.1 UPS") ---
            heading = ""
            clause_id = None
            heading_match = re.match(r"^\[(.+?)\]", raw_text)
            if heading_match:
                heading = heading_match.group(1)
                clause_match = re.match(r"^(\d+(?:\.\d+)*)\s+", heading)
                if clause_match:
                    clause_id = clause_match.group(1)

            # --- Semantic role extracted from chunk prefix "(Role):" ---
            semantic_role = "Informational Content"
            role_match = re.search(r"\(([^)]+)\):", raw_text)
            if role_match:
                semantic_role = role_match.group(1)

            # --- Create Chunk record ---
            chunk_id = str(uuid.uuid4())
            chunk_record = Chunk(
                id=chunk_id,
                page_id=page_record.id,
                document_id=document_id,
                text=raw_text,
                chunk_order=order,
                token_count=len(raw_text.split()),
                section_heading=heading or None,
                clause_identifier=clause_id,
                semantic_role=semantic_role,
                engineering_discipline=meta["discipline"],
                equipment_category=meta["category"],
                parser_confidence=1.0,
                chunk_version=1,
            )
            self.db.add(chunk_record)
            chunk_records.append(chunk_record)

        self.db.flush()  # persist all chunks so we can link previous/next

        # --- 20.23: Wire previous ↔ next chain ---
        for i, chunk in enumerate(chunk_records):
            if i > 0:
                chunk.previous_chunk_id = chunk_records[i - 1].id
            if i < len(chunk_records) - 1:
                chunk.next_chunk_id = chunk_records[i + 1].id

        self.db.flush()

        # --- 20.25: Entity extraction + 20.28-20.30: Embedding generation ---
        for chunk in chunk_records:
            # Entity extraction
            entities = extract_entities(chunk.id, document_id, chunk.text)
            for ent in entities:
                self.db.add(EngineeringEntity(
                    id=str(uuid.uuid4()),
                    chunk_id=ent["chunk_id"],
                    document_id=ent["document_id"],
                    entity_type=ent["entity_type"],
                    entity_value=ent["entity_value"],
                    canonical_name=ent["canonical_name"],
                ))

            # Embedding generation (20.28)
            vector = self.embed_model.get_text_embedding(chunk.text)

            # Versioned embedding record (20.29)
            self.db.add(Embedding(
                id=str(uuid.uuid4()),
                chunk_id=chunk.id,
                model=EMBEDDING_MODEL,
                model_version=f"{EMBEDDING_MODEL}-v1",
                pipeline_version=PIPELINE_VERSION,
                chunk_version=chunk.chunk_version,
                vector_dimension=len(vector),
                is_active=1,
                vector=vector,
            ))

        self.db.commit()
        return len(chunk_records)

