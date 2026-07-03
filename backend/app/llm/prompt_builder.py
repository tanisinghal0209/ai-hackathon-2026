import os
from typing import List, Dict

class PromptAssemblyService:
    """
    Chapter 17.12 - Prompt Assembly Pipeline
    Constructs Claude's final prompt using 4 distinct components:
    1. System Prompt (from version-controlled template)
    2. User Question (immutable)
    3. Project Context (Retrieved Chunks)
    4. Response Instructions (Citation and formatting rules)
    """
    def __init__(self, prompt_version: str = "v1.0"):
        self.prompt_version = prompt_version
        self.prompt_path = os.path.join(
            os.path.dirname(__file__), 
            f"../../../../prompts/knowledge_copilot_{prompt_version}.txt"
        )
        
    def _load_system_prompt(self) -> str:
        try:
            with open(self.prompt_path, "r") as f:
                return f.read()
        except FileNotFoundError:
            return "You are an engineering assistant. Answer based on context."

    def _format_context(self, chunks: List[Dict]) -> str:
        """
        20.36: Assembles context package for Claude.
        Includes all metadata required for citation graph construction (20.37).
        Adjacent chunks from the same section are grouped together.
        """
        context_str = "--- PROJECT CONTEXT ---\n\n"
        current_section = None

        for idx, chunk in enumerate(chunks):
            section = chunk.get("section_heading") or "General"
            # Group same-section chunks visually
            if section != current_section:
                context_str += f"\n=== Section: {section} ===\n"
                current_section = section

            clause = chunk.get("clause_identifier", "")
            role = chunk.get("semantic_role", "Informational Content")
            discipline = chunk.get("engineering_discipline", "")
            page = chunk.get("page_number", "?")
            score = chunk.get("composite_score") or chunk.get("similarity", 0)
            source = chunk.get("retrieval_source", "vector")

            context_str += f"[CHUNK_ID: {chunk.get('chunk_id', idx)}]\n"
            context_str += f"Source: {chunk.get('filename', 'Unknown')} | Page: {page}"
            if clause:
                context_str += f" | Clause: {clause}"
            context_str += f"\nType: {chunk.get('category', 'General')} | Role: {role}"
            if discipline:
                context_str += f" | Discipline: {discipline}"
            context_str += f"\nRetrieval: score={score:.3f} via {source}\n"
            context_str += f"Text:\n{chunk.get('text', '')}\n"
            context_str += "-" * 40 + "\n"

        return context_str

    def assemble_prompt(self, user_question: str, retrieved_chunks: List[Dict]) -> str:
        system_instructions = self._load_system_prompt()
        project_context = self._format_context(retrieved_chunks)
        
        # Following logical structure from 17.12
        final_prompt = f"""
{system_instructions}

--- USER QUESTION ---
{user_question}

{project_context}

--- OUTPUT FORMAT & CITATION RULES ---
- Format response clearly using markdown.
- You MUST cite the CHUNK_ID (e.g. [CHUNK_ID: xyz-123]) for every factual claim.
- If context is insufficient, state exactly: 'I cannot answer this question confidently based on the retrieved project documentation.'

--- END ---
"""
        return final_prompt.strip()
