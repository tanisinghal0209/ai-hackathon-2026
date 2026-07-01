import os
from llama_index.embeddings.openai import OpenAIEmbedding
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict

class DocumentRetriever:
    def __init__(self, db_session: Session):
        self.db = db_session
        self.embed_model = OpenAIEmbedding(
            api_key=os.getenv("OPENAI_API_KEY"),
            model="text-embedding-3-small"
        )

    def retrieve_context(self, question: str, project_id: str, limit: int = 8) -> List[Dict]:
        """
        Stage 1-5 of the Retrieval Strategy (Chapter 17.10)
        """
        # Stage One: Question is converted to embedding
        query_vector = self.embed_model.get_text_embedding(question)
        
        # Format the vector for pgvector literal
        vector_str = "[" + ",".join(map(str, query_vector)) + "]"
        
        # Stage Two: Cosine similarity search (using pgvector <-> operator)
        # Stage Three: Metadata filtering by project_id (implicitly joining docs)
        # We retrieve top 20 initially, then filter/select best 8 (Stage 4 & 5)
        
        query = text("""
            SELECT c.id, c.text, c.page_id, d.filename, d.category,
                   1 - (e.vector <=> :vector) AS similarity
            FROM embeddings e
            JOIN chunks c ON e.chunk_id = c.id
            JOIN documents d ON c.document_id = d.id
            WHERE d.project_id = :project_id
            ORDER BY e.vector <=> :vector
            LIMIT 20
        """)
        
        results = self.db.execute(query, {"vector": vector_str, "project_id": project_id}).fetchall()
        
        # Stage Four & Five: Select the best 8 chunks to send to Claude
        # (In a real implementation, LlamaIndex node postprocessors could do reranking here)
        top_chunks = results[:limit]
        
        context_blocks = []
        for row in top_chunks:
            context_blocks.append({
                "chunk_id": row.id,
                "text": row.text,
                "filename": row.filename,
                "category": row.category,
                "similarity": row.similarity
            })
            
        return context_blocks
