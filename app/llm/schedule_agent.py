import os
import json
from anthropic import AsyncAnthropic
from typing import List, Dict, Any
from app.services.schedule_analyzer import ScheduleAnalyzer

class ScheduleRiskAgentService:
    """
    Chapter 19 - Predictive Schedule Risk Engine (AI Layer)
    Takes the deterministic graph outputs (Float, Critical Path) and combines them
    with Procurement/RFI constraints to generate semantic risk mitigations via Claude.
    """
    def __init__(self):
        self.client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        
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
        system_prompt = (
            "You are a Data Centre EPC Schedule Risk Engine. "
            "You have been provided with deterministic Critical Path calculations. "
            "Analyze the activities that have Procurement Delays, Open RFIs, or zero float (Critical). "
            "Use the `flag_schedule_risk` tool to flag major risks and provide cascading impact analysis."
        )
        
        user_prompt = f"SCHEDULE GRAPH DATA:\n{json.dumps(risk_candidates, indent=2)}"
        
        response = await self.client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=2048,
            temperature=0.0,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
            tools=self.tools
        )
        
        ai_risks = []
        for block in response.content:
            if block.type == "tool_use" and block.name == "flag_schedule_risk":
                ai_risks.append(block.input)
                
        # Merge deterministic outputs with AI reasoning
        return {
            "project_duration": cpm_results["project_duration"],
            "critical_path": cpm_results["critical_path"],
            "activities": cpm_results["activities"], # Full enriched DAG
            "ai_risk_mitigations": ai_risks
        }
