import json
from typing import List, Dict, Any

from app.ai.claude_service import ClaudeService
from app.llm.response_validator import StructuredOutputValidator
from app.prompts.registry import PromptRegistry
from app.services.schedule_analyzer import ScheduleAnalyzer

class ScheduleRiskAgentService:
    """
    Chapter 19 - Predictive Schedule Risk Engine (AI Layer)
    Takes the deterministic graph outputs (Float, Critical Path) and combines them
    with Procurement/RFI constraints to generate semantic risk mitigations via Claude.
    """
    def __init__(
        self,
        claude_service: ClaudeService,
        prompt_registry: PromptRegistry | None = None,
        prompt_version: str = "v1.0",
    ):
        self.claude_service = claude_service
        self.prompt_registry = prompt_registry or PromptRegistry()
        self.prompt_version = prompt_version

        # Output schema for AI Risk Mitigation
        self.tools = [
            {
                "name": "flag_schedule_risk",
                "description": "Records an identified schedule risk and proposes mitigations.",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "activity_id": {"type": "string"},
                        "activity_name": {"type": "string"},
                        "risk_driver": {
                            "type": "string",
                            "enum": ["Procurement Delay", "Open RFI", "Compliance Finding", "Critical Path Dependency"]
                        },
                        "impact_analysis": {"type": "string", "description": "How this delay cascades downstream."},
                        "mitigation_strategy": {"type": "string", "description": "Actionable engineering recommendation."}
                    },
                    "required": ["activity_id", "activity_name", "risk_driver", "impact_analysis", "mitigation_strategy"]
                }
            }
        ]

    async def analyze_schedule_risks(self, activities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        19.4 High-Level Workflow: Deterministic math -> Claude Analysis
        """
        # 1. Deterministic Graph Math
        analyzer = ScheduleAnalyzer(activities)
        cpm_results = analyzer.calculate_cpm()
        
        # 2. Filter data to send to Claude (only items with external constraints or critical float)
        # 19.13 Procurement, 19.14 RFI, 19.15 Compliance Integration
        risk_candidates = []
        for act in cpm_results["activities"]:
            has_constraint = act.get("procurement_status") == "Delayed" or \
                             act.get("open_rfis", 0) > 0 or \
                             act.get("compliance_issues", 0) > 0
                             
            if has_constraint or act["is_critical"]:
                risk_candidates.append(act)

        # 3. AI Reasoning
        prompt = self.prompt_registry.get(
            "schedule_risk_reasoning",
            self.prompt_version,
        )
        system_prompt = prompt.system_instructions
        
        user_prompt = f"SCHEDULE GRAPH DATA:\n{json.dumps(risk_candidates, indent=2)}"
        
        response = await self.claude_service.create_message(
            max_tokens=2048,
            temperature=0.0,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
            tools=self.tools
        )
        
        ai_risks = []
        for block in response.content:
            if block.type == "tool_use" and block.name == "flag_schedule_risk":
                StructuredOutputValidator.validate_tool_payload(
                    block.input,
                    required_fields=[
                        "activity_id",
                        "activity_name",
                        "risk_driver",
                        "impact_analysis",
                        "mitigation_strategy",
                    ],
                    enum_fields={
                        "risk_driver": [
                            "Procurement Delay",
                            "Open RFI",
                            "Compliance Finding",
                            "Critical Path Dependency",
                        ],
                    },
                )
                ai_risks.append(block.input)
                
        # Merge deterministic outputs with AI reasoning
        return {
            "project_duration": cpm_results["project_duration"],
            "critical_path": cpm_results["critical_path"],
            "activities": cpm_results["activities"], # Full enriched DAG
            "ai_risk_mitigations": ai_risks
        }
