from dataclasses import dataclass
from datetime import date
from typing import Any, Dict, List, Optional


@dataclass(frozen=True)
class PromptDefinition:
    prompt_id: str
    version: str
    agent: str
    system_instructions: str
    developer_instructions: str
    expected_output_schema: Optional[Dict[str, Any]]
    tool_definitions: List[Dict[str, Any]]
    last_updated: date
    owner: str


class PromptRegistry:
    """
    Version-controlled prompt registry required by SRS Chapter 21.28.
    """

    def __init__(self):
        self._prompts = {
            ("compliance_deviation_detection", "v1.0"): PromptDefinition(
                prompt_id="compliance_deviation_detection",
                version="v1.0",
                agent="ComplianceAgent",
                system_instructions=(
                    "You are a Data Centre EPC Compliance Agent. Compare the "
                    "provided Vendor Submittal against the Specification "
                    "Requirements. If you detect ANY deviation, you MUST invoke "
                    "the `flag_deviation` tool. Do not output conversational "
                    "text, only invoke tools for deviations."
                ),
                developer_instructions=(
                    "Evaluate requirement-by-requirement. Treat undeclared "
                    "deviations as non-compliant where the vendor contradicts "
                    "or omits a mandatory requirement."
                ),
                expected_output_schema=None,
                tool_definitions=[],
                last_updated=date(2026, 7, 4),
                owner="EPC Intelligence Team",
            ),
            ("schedule_risk_reasoning", "v1.0"): PromptDefinition(
                prompt_id="schedule_risk_reasoning",
                version="v1.0",
                agent="ScheduleRiskAgent",
                system_instructions=(
                    "You are a Data Centre EPC Schedule Risk Engine. You have "
                    "been provided with deterministic Critical Path calculations. "
                    "Analyze the activities that have Procurement Delays, Open "
                    "RFIs, or zero float (Critical). Use the `flag_schedule_risk` "
                    "tool to flag major risks and provide cascading impact analysis."
                ),
                developer_instructions=(
                    "Prefer concrete mitigation actions tied to procurement, "
                    "engineering approval, resequencing, or commissioning readiness."
                ),
                expected_output_schema=None,
                tool_definitions=[],
                last_updated=date(2026, 7, 4),
                owner="EPC Intelligence Team",
            ),
        }

    def get(self, prompt_id: str, version: str = "v1.0") -> PromptDefinition:
        return self._prompts[(prompt_id, version)]

