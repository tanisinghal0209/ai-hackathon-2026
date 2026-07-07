from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.llm.copilot import KnowledgeCopilotService
from app.ai.claude_service import ClaudeService
from app.dependencies import get_claude_service
from app.security.audit import AuditLogger

router = APIRouter()

class CopilotQuery(BaseModel):
    project_id: str
    question: str

@router.post("/query")
async def copilot_query(
    query: CopilotQuery,
    db: Session = Depends(get_db),
    claude_service: ClaudeService = Depends(get_claude_service),
):
    """
    Knowledge Copilot Query Service (Chapter 16.6)
    Returns Server-Sent Events (SSE) stream (Chapter 16.7).
    """
    # Chapter 23.19 - Audit Logging & Multi-Project Isolation
    AuditLogger.log_event(
        action="COPILOT_QUERY",
        user_id="system_user", # In a real app, this comes from JWT/Auth context
        project_id=query.project_id,
        resource="knowledge_base",
        result="SUCCESS",
        metadata={"question_length": len(query.question)}
    )

    copilot_service = KnowledgeCopilotService(db, claude_service)
    
    # We return an EventSourceResponse which handles SSE streaming automatically
    return EventSourceResponse(
        copilot_service.stream_answer(query.project_id, query.question)
    )
