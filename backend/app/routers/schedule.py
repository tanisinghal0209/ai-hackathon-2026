from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
from app.schemas.common import APIResponse, StatusInfo, ProcessingMetadata
from app.llm.schedule_agent import ScheduleRiskAgentService
import time

router = APIRouter()

class SchedulePayload(BaseModel):
    activities: List[Dict[str, Any]]

@router.post("/analyze", response_model=APIResponse[dict])
async def analyze_schedule(payload: SchedulePayload):
    """
    Predictive Schedule Risk Engine (Chapter 19)
    Performs deterministic CPM/Float calculation and uses Claude for semantic risk mitigation.
    """
    start_time = time.time()
    
    agent = ScheduleRiskAgentService()
    report = await agent.analyze_schedule_risks(payload.activities)
    
    processing_time = int((time.time() - start_time) * 1000)
    
    return APIResponse(
        data=report,
        status=StatusInfo(success=True, code=200, message="Schedule analysis complete."),
        metadata=ProcessingMetadata(processing_time_ms=processing_time)
    )
