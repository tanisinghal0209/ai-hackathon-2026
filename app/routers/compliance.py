from fastapi import APIRouter
from pydantic import BaseModel
from app.schemas.common import APIResponse, StatusInfo, ProcessingMetadata
from app.llm.compliance_agent import ComplianceAgentService
import time

router = APIRouter()

class ComplianceRequest(BaseModel):
    specification_text: str
    vendor_text: str

@router.post("/analyze", response_model=APIResponse[dict])
async def analyze_compliance(request: ComplianceRequest):
    """
    Compliance Analysis Service (Chapter 16.8 and 18)
    Extracts specification requirements and compares against vendor submittals.
    """
    start_time = time.time()
    
    agent = ComplianceAgentService()
    report = await agent.analyze_compliance(request.specification_text, request.vendor_text)
    
    processing_time = int((time.time() - start_time) * 1000)
    
    return APIResponse(
        data=report,
        status=StatusInfo(success=True, code=200, message="Compliance analysis complete."),
        metadata=ProcessingMetadata(processing_time_ms=processing_time)
    )
