from typing import List, Optional

from pydantic import BaseModel, Field


class ComplianceAnalyzeRequest(BaseModel):
    specification_text: str = Field(min_length=1)
    vendor_text: str = Field(min_length=1)


class ComplianceFindingSchema(BaseModel):
    requirement_id: str
    requirement_description: str
    vendor_value: str
    compliance_status: str
    severity: str
    confidence: float
    explanation: str
    recommendation: Optional[str] = None


class ComplianceReportSchema(BaseModel):
    overall_score: int
    total_findings: int
    findings: List[ComplianceFindingSchema]
    recommendation: str

