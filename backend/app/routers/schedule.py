from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Dict, Any
from app.schemas.common import APIResponse, StatusInfo, ProcessingMetadata
from app.dependencies import get_schedule_risk_service
from app.services.schedule_risk_service import ScheduleRiskService
import time

router = APIRouter()

class SchedulePayload(BaseModel):
    activities: List[Dict[str, Any]]

@router.post("/analyze", response_model=APIResponse[dict])
async def analyze_schedule(
    payload: SchedulePayload,
    schedule_service: ScheduleRiskService = Depends(get_schedule_risk_service),
):
    """
    Predictive Schedule Risk Engine (Chapter 19)
    Performs deterministic CPM/Float calculation and uses Claude for semantic risk mitigation.
    """
    start_time = time.time()
    
    report = await schedule_service.analyse_schedule(payload.activities)
    
    processing_time = int((time.time() - start_time) * 1000)
    
    return APIResponse(
        data=report,
        status=StatusInfo(success=True, code=200, message="Schedule analysis complete."),
        metadata=ProcessingMetadata(processing_time_ms=processing_time)
    )
