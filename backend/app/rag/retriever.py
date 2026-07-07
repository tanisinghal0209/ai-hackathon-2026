"""
Chapter 20.31 — Hybrid Retrieval Architecture
Chapter 20.32 — Query Understanding
Chapter 20.33 — Query Expansion
Chapter 20.34 — Multi-Stage Retrieval Pipeline
Chapter 20.35 — Reranking Engine
Chapter 20.36 — Context Assembly
Chapter 20.37 — Citation Graph Construction
Chapter 20.38 — Knowledge Validation

DocumentRetriever orchestrates all retrieval stages before any LLM is invoked.
The pipeline: Intent Analysis → Metadata Filtering → Vector Search →
Keyword Search → Deduplication → Query Expansion Merge → Reranking →
Context Assembly.
"""
import os
import uuid
import time
from typing import List, Dict, Optional

from llama_index.embeddings.openai import OpenAIEmbedding
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.rag.query_engine import analyse_query, expand_query

# Maximum tokens allowed in the assembled context package (20.36)
MAX_CONTEXT_TOKENS = 6000
# Number of initial candidates per search channel (20.35)
INITIAL_CANDIDATE_LIMIT = 20
# Final chunks forwarded to Claude (20.35)
FINAL_CHUNK_LIMIT = 8


class DocumentRetriever:
    def __init__(self, db_session: Session):
        self.db = db_session
        self.embed_model = OpenAIEmbedding(
            api_key=os.getenv("OPENAI_API_KEY"),
            model="text-embedding-3-small",
        )

    # ------------------------------------------------------------------
    # Stage 1: Intent Analysis (20.32)
    # ------------------------------------------------------------------
    def _analyse_intent(self, query: str) -> Dict:
        return analyse_query(query)

    # ------------------------------------------------------------------
    # Stage 2: Vector Search (20.31 — dense channel)
    # ------------------------------------------------------------------
    def _vector_search(self, query: str, project_id: str, intent: Dict) -> List[Dict]:
        use_mock = os.getenv("MOCK_EMBEDDINGS", "true").lower() == "true"
        if use_mock:
            query_vector = [float(ord(c)) / 255.0 for c in query[:1536]]
            if len(query_vector) < 1536:
                query_vector += [0.0] * (1536 - len(query_vector))
        else:
            try:
                query_vector = self.embed_model.get_text_embedding(query)
            except Exception as e:
                # Fallback to local mock query embedding if OpenAI fails
                query_vector = [float(ord(c)) / 255.0 for c in query[:1536]]
                if len(query_vector) < 1536:
                    query_vector += [0.0] * (1536 - len(query_vector))
        is_sqlite = "sqlite" in str(self.db.bind.url)

        # Metadata filters derived from intent (20.32)
        discipline_filter = ""
        if intent.get("discipline"):
            discipline_filter = "AND c.engineering_discipline = :discipline"

        if is_sqlite:
            # SQLite fallback: fetch active embeddings and calculate cosine similarity in Python
            sql = text(f"""
                SELECT c.id, c.text, c.section_heading, c.clause_identifier,
                       c.semantic_role, c.engineering_discipline, c.equipment_category,
                       c.chunk_order, c.previous_chunk_id, c.next_chunk_id,
                       c.parser_confidence,
                       d.filename, d.category, d.id AS document_id,
                       p.page_number,
                       e.vector
                FROM embeddings e
                JOIN chunks c ON e.chunk_id = c.id
                JOIN documents d ON c.document_id = d.id
                LEFT JOIN pages p ON c.page_id = p.id
                WHERE d.project_id = :project_id
                  AND e.is_active = 1
                  {discipline_filter}
            """)
            params = {"project_id": project_id}
            if intent.get("discipline"):
                params["discipline"] = intent["discipline"]
            rows = self.db.execute(sql, params).fetchall()

            import math
            def cosine_similarity(v1, v2):
                dot_product = sum(a * b for a, b in zip(v1, v2))
                magnitude1 = math.sqrt(sum(a * a for a in v1))
                magnitude2 = math.sqrt(sum(b * b for b in v2))
                if not magnitude1 or not magnitude2:
                    return 0.0
                return dot_product / (magnitude1 * magnitude2)

            hits = []
            for r in rows:
                raw_vec = r.vector
                if isinstance(raw_vec, str):
                    try:
                        clean_str = raw_vec.strip("[]")
                        vec = [float(x) for x in clean_str.split(",") if x.strip()]
                    except Exception:
                        vec = []
                elif isinstance(raw_vec, (list, tuple)):
                    vec = [float(x) for x in raw_vec]
                else:
                    vec = []

                sim = cosine_similarity(query_vector, vec) if vec else 0.0

                hits.append({
                    "id": r.id,
                    "text": r.text,
                    "section_heading": r.section_heading,
                    "clause_identifier": r.clause_identifier,
                    "semantic_role": r.semantic_role,
                    "engineering_discipline": r.engineering_discipline,
                    "equipment_category": r.equipment_category,
                    "filename": r.filename,
                    "category": r.category,
                    "document_id": r.document_id,
                    "page_number": r.page_number,
                    "parser_confidence": r.parser_confidence,
                    "similarity": sim
                })

            hits = sorted(hits, key=lambda x: x["similarity"], reverse=True)[:INITIAL_CANDIDATE_LIMIT]
            return [self._row_to_dict(h, source="vector") for h in hits]

        else:
            # PostgreSQL pgvector path
            vector_str = "[" + ",".join(map(str, query_vector)) + "]"
            params = {"vector": vector_str, "project_id": project_id, "limit": INITIAL_CANDIDATE_LIMIT}
            if intent.get("discipline"):
                params["discipline"] = intent["discipline"]

            sql = text(f"""
                SELECT c.id, c.text, c.section_heading, c.clause_identifier,
                       c.semantic_role, c.engineering_discipline, c.equipment_category,
                       c.chunk_order, c.previous_chunk_id, c.next_chunk_id,
                       c.parser_confidence,
                       d.filename, d.category, d.id AS document_id,
                       p.page_number,
                       1 - (e.vector <=> :vector) AS similarity
                FROM embeddings e
                JOIN chunks c ON e.chunk_id = c.id
                JOIN documents d ON c.document_id = d.id
                LEFT JOIN pages p ON c.page_id = p.id
                WHERE d.project_id = :project_id
                  AND e.is_active = 1
                  {discipline_filter}
                ORDER BY e.vector <=> :vector
                LIMIT :limit
            """)

            rows = self.db.execute(sql, params).fetchall()
            return [self._row_to_dict(r, source="vector") for r in rows]

    # ------------------------------------------------------------------
    # Stage 3: Keyword / Full-Text Search (20.31 — lexical channel)
    # ------------------------------------------------------------------
    def _keyword_search(self, query: str, project_id: str) -> List[Dict]:
        """
        PostgreSQL full-text search using tsvector/tsquery.
        Catches exact engineering identifiers that semantic search may miss (EDR 20-O).
        """
        sql = text("""
            SELECT c.id, c.text, c.section_heading, c.clause_identifier,
                   c.semantic_role, c.engineering_discipline, c.equipment_category,
                   c.chunk_order, c.previous_chunk_id, c.next_chunk_id,
                   c.parser_confidence,
                   d.filename, d.category, d.id AS document_id,
                   p.page_number,
                   ts_rank_cd(to_tsvector('english', c.text),
                              plainto_tsquery('english', :query)) AS similarity
            FROM chunks c
            JOIN documents d ON c.document_id = d.id
            LEFT JOIN pages p ON c.page_id = p.id
            WHERE d.project_id = :project_id
              AND to_tsvector('english', c.text) @@ plainto_tsquery('english', :query)
            ORDER BY similarity DESC
            LIMIT :limit
        """)
        try:
            rows = self.db.execute(
                sql,
                {"query": query, "project_id": project_id, "limit": INITIAL_CANDIDATE_LIMIT}
            ).fetchall()
            return [self._row_to_dict(r, source="keyword") for r in rows]
        except Exception:
            # Full-text index not yet created — gracefully degrade to vector-only
            return []

    # ------------------------------------------------------------------
    # Stage 4: Deduplication (20.34)
    # ------------------------------------------------------------------
    def _deduplicate(self, candidates: List[Dict]) -> List[Dict]:
        seen: Dict[str, float] = {}
        for c in candidates:
            cid = c["chunk_id"]
            # Keep the highest score if a chunk appears in both channels
            if cid not in seen or c["similarity"] > seen[cid]:
                seen[cid] = c["similarity"]
        # Rebuild with deduped scores
        deduped: Dict[str, Dict] = {}
        for c in candidates:
            cid = c["chunk_id"]
            if cid not in deduped or c["similarity"] >= deduped[cid]["similarity"]:
                c["similarity"] = seen[cid]
                deduped[cid] = c
        return list(deduped.values())

    # ------------------------------------------------------------------
    # Stage 5: Query Expansion Merge (20.33)
    # ------------------------------------------------------------------
    def _expansion_search(self, original_query: str, project_id: str, intent: Dict) -> List[Dict]:
        expansions = expand_query(original_query)
        extra: List[Dict] = []
        # Run additional vector searches for each ontology-expanded variant
        for variant in expansions[1:]:  # skip original — already searched
            extra.extend(self._vector_search(variant, project_id, intent))
        return extra

    # ------------------------------------------------------------------
    # Stage 6: Score-Based Reranking (20.35)
    # ------------------------------------------------------------------
    def _rerank(self, candidates: List[Dict], intent: Dict) -> List[Dict]:
        """
        Deterministic reranking using composite scoring.
        Boosts chunks whose metadata aligns with identified intent signals.
        A future integration point for Cohere/Jina rerankers (EDR 20-Q).
        """
        for c in candidates:
            score = c.get("similarity", 0.0)
            # Boost mandatory requirements (more engineering weight)
            if c.get("semantic_role") == "Mandatory Requirement":
                score += 0.08
            # Boost if equipment category matches intent
            if intent.get("equipment_category") and \
               c.get("equipment_category") == intent["equipment_category"]:
                score += 0.06
            # Boost if discipline matches intent
            if intent.get("discipline") and \
               c.get("engineering_discipline") == intent["discipline"]:
                score += 0.04
            # Penalty for low parser confidence
            confidence = c.get("parser_confidence", 1.0) or 1.0
            score *= confidence
            c["composite_score"] = round(score, 4)

        return sorted(candidates, key=lambda x: x["composite_score"], reverse=True)

    # ------------------------------------------------------------------
    # Stage 7: Context Assembly (20.36)
    # ------------------------------------------------------------------
    def _assemble_context(self, ranked: List[Dict]) -> List[Dict]:
        """
        Select top chunks within the token budget.
        Preserves complete engineering clauses — never truncates mid-clause (20.36).
        """
        selected: List[Dict] = []
        token_total = 0

        for chunk in ranked:
            tokens = len(chunk.get("text", "").split())
            if token_total + tokens > MAX_CONTEXT_TOKENS:
                break  # never truncate — stop cleanly
            selected.append(chunk)
            token_total += tokens
            if len(selected) >= FINAL_CHUNK_LIMIT:
                break

        return selected

    # ------------------------------------------------------------------
    # Stage 8: Knowledge Validation (20.38)
    # ------------------------------------------------------------------
    def _validate_chunk(self, chunk: Dict) -> bool:
        """
        Confirms chunk exists, has text, and parser confidence meets threshold.
        In production this would also verify embedding availability.
        """
        return bool(chunk.get("chunk_id") and chunk.get("text") and
                    (chunk.get("parser_confidence") or 1.0) >= 0.5)

    # ------------------------------------------------------------------
    # Internal helper
    # ------------------------------------------------------------------
    def _row_to_dict(self, row, source: str) -> Dict:
        is_dict = isinstance(row, dict)
        is_mapping = hasattr(row, "_mapping")
        def _get(field):
            if is_dict:
                return row.get(field)
            if is_mapping:
                return row._mapping.get(field)
            try:
                return getattr(row, field, None)
            except Exception:
                return None

        return {
            "chunk_id": _get("id") or _get("chunk_id"),
            "text": _get("text"),
            "section_heading": _get("section_heading"),
            "clause_identifier": _get("clause_identifier"),
            "semantic_role": _get("semantic_role"),
            "engineering_discipline": _get("engineering_discipline"),
            "equipment_category": _get("equipment_category"),
            "filename": _get("filename"),
            "category": _get("category"),
            "document_id": _get("document_id"),
            "page_number": _get("page_number"),
            "similarity": float(_get("similarity")) if _get("similarity") is not None else 0.0,
            "parser_confidence": float(_get("parser_confidence")) if _get("parser_confidence") else 1.0,
            "retrieval_source": source,  # "vector" or "keyword"
        }

    # ------------------------------------------------------------------
    # Public API: full pipeline (20.34)
    # ------------------------------------------------------------------
    def retrieve_context(
        self,
        question: str,
        project_id: str,
        limit: int = FINAL_CHUNK_LIMIT,
        session_id: Optional[str] = None,
    ) -> List[Dict]:
        """
        Executes the complete multi-stage retrieval pipeline and returns
        context-assembled, validated chunks ready for Claude.
        """
        t0 = time.time()

        # Stage 1: Intent Analysis
        intent = self._analyse_intent(question)

        # Stage 2 & 3: Parallel vector + keyword search
        vector_hits = self._vector_search(question, project_id, intent)
        keyword_hits = self._keyword_search(question, project_id)

        # Stage 4: Deduplication
        candidates = self._deduplicate(vector_hits + keyword_hits)

        # Stage 5: Query expansion merge
        expansion_hits = self._expansion_search(question, project_id, intent)
        candidates = self._deduplicate(candidates + expansion_hits)

        # Stage 6: Reranking
        ranked = self._rerank(candidates, intent)

        # Stage 7: Context assembly (token budget enforcement)
        assembled = self._assemble_context(ranked[:limit * 3])  # give reranker room

        # Stage 8: Knowledge validation
        validated = [c for c in assembled if self._validate_chunk(c)][:limit]

        elapsed = round(time.time() - t0, 3)
        print(f"[Retriever] {len(validated)} chunks assembled in {elapsed}s | "
              f"intent={intent} | vector={len(vector_hits)} keyword={len(keyword_hits)}")

        return validated

