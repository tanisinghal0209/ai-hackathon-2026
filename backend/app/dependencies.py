from app.ai.claude_service import ClaudeService
from app.llm.compliance_agent import ComplianceAgentService
from app.llm.schedule_agent import ScheduleRiskAgentService
from app.prompts.registry import PromptRegistry
from app.services.compliance_service import ComplianceService
from app.services.schedule_risk_service import ScheduleRiskService


def get_claude_service() -> ClaudeService:
    return ClaudeService()


def get_prompt_registry() -> PromptRegistry:
    return PromptRegistry()


def get_compliance_service() -> ComplianceService:
    return ComplianceService(
        compliance_agent=ComplianceAgentService(
            claude_service=get_claude_service(),
            prompt_registry=get_prompt_registry(),
        )
    )


def get_schedule_risk_service() -> ScheduleRiskService:
    return ScheduleRiskService(
        schedule_agent=ScheduleRiskAgentService(
            claude_service=get_claude_service(),
            prompt_registry=get_prompt_registry(),
        )
    )
