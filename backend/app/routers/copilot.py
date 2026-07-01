from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.llm.copilot import KnowledgeCopilotService

router = APIRouter()

class CopilotQuery(BaseModel):
    project_id: str
    question: str

@router.post("/query")
async def copilot_query(query: CopilotQuery, db: Session = Depends(get_db)):
    """
    Knowledge Copilot Query Service (Chapter 16.6)
    Returns Server-Sent Events (SSE) stream (Chapter 16.7).
    """
    copilot_service = KnowledgeCopilotService(db)
    
    # We return an EventSourceResponse which handles SSE streaming automatically
    return EventSourceResponse(
        copilot_service.stream_answer(query.project_id, query.question)
    )
