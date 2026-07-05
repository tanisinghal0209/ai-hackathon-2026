from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.schemas.common import APIResponse, StatusInfo, ProcessingMetadata
from app.dependencies import get_compliance_service
from app.services.compliance_service import ComplianceService
import time

router = APIRouter()

class ComplianceRequest(BaseModel):
    specification_text: str
    vendor_text: str

@router.post("/analyze", response_model=APIResponse[dict])
async def analyze_compliance(
    request: ComplianceRequest,
    compliance_service: ComplianceService = Depends(get_compliance_service),
):
    """
    Compliance Analysis Service (Chapter 16.8 and 18)
    Extracts specification requirements and compares against vendor submittals.
    """
    start_time = time.time()

    report = await compliance_service.analyse_vendor_submission(
        request.specification_text,
        request.vendor_text,
    )
    
    processing_time = int((time.time() - start_time) * 1000)
    
    return APIResponse(
        data=report,
        status=StatusInfo(success=True, code=200, message="Compliance analysis complete."),
        metadata=ProcessingMetadata(processing_time_ms=processing_time)
    )
