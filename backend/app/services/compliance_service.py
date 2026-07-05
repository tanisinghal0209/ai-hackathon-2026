from typing import Any, Dict

from app.llm.compliance_agent import ComplianceAgentService


class ComplianceService:
    """Coordinates vendor-submittal compliance analysis."""

    def __init__(self, compliance_agent: ComplianceAgentService):
        self.compliance_agent = compliance_agent

    async def analyse_vendor_submission(
        self,
        specification_text: str,
        vendor_text: str,
    ) -> Dict[str, Any]:
        return await self.compliance_agent.analyze_compliance(
            specification_text,
            vendor_text,
        )

