import json
from sse_starlette.sse import ServerSentEvent
from app.rag.retriever import DocumentRetriever
from app.llm.prompt_builder import PromptAssemblyService
from sqlalchemy.orm import Session
import time
from app.ai.claude_service import ClaudeService

class KnowledgeCopilotService:
    def __init__(self, db_session: Session, claude_service: ClaudeService):
        self.retriever = DocumentRetriever(db_session)
        self.prompt_builder = PromptAssemblyService()
        self.claude_service = claude_service

    async def stream_answer(self, project_id: str, question: str):
        """
        Implements Chapter 16.7 (Streaming Responses) and 17.1 (RAG Engine).
        Yields ServerSentEvent objects — sse_starlette formats them as 'data: {...}\\r\\n\\r\\n'.
        """
        start_time = time.time()
        
        # 1. Retrieve Context (Yield metadata first)
        yield ServerSentEvent(data=json.dumps({'event': 'retrieval_started'}))
        retrieved_chunks = self.retriever.retrieve_context(question, project_id)
        
        if not retrieved_chunks:
            yield ServerSentEvent(data=json.dumps({'event': 'error', 'message': 'Insufficient evidence found.'}))
            return
            
        yield ServerSentEvent(data=json.dumps({'event': 'citations', 'chunks': retrieved_chunks}))
        
        # 2. Assemble Prompt
        full_prompt = self.prompt_builder.assemble_prompt(question, retrieved_chunks)
        
        # 3. Stream Claude Response
        try:
            stream = self.claude_service.stream_message(
                max_tokens=1024,
                temperature=0.0, # Deterministic answers
                messages=[
                    {"role": "user", "content": full_prompt}
                ]
            )
            
            async for chunk in stream:
                if chunk.type == "content_block_delta" and chunk.delta.text:
                    yield ServerSentEvent(data=json.dumps({'event': 'text', 'content': chunk.delta.text}))
            
            # 4. Final Metadata
            processing_time = int((time.time() - start_time) * 1000)
            yield ServerSentEvent(data=json.dumps({'event': 'completed', 'processing_time_ms': processing_time}))
            
        except Exception as e:
            yield ServerSentEvent(data=json.dumps({'event': 'error', 'message': str(e)}))
