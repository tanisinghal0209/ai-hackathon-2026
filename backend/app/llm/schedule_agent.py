"""
Chapter 19 - Predictive Schedule Risk Engine (AI Layer)
Takes deterministic CPM graph outputs and generates semantic risk mitigations via Claude.
Falls back to rich deterministic mock when Anthropic API key is not configured.
"""
import json
import os
from typing import Any, Dict, List

from app.ai.claude_service import ClaudeService
from app.llm.response_validator import StructuredOutputValidator
from app.prompts.registry import PromptRegistry
from app.services.schedule_analyzer import ScheduleAnalyzer


class ScheduleRiskAgentService:

    def __init__(
        self,
        claude_service: ClaudeService,
        prompt_registry: PromptRegistry | None = None,
        prompt_version: str = "v1.0",
    ):
        self.claude_service = claude_service
        self.prompt_registry = prompt_registry or PromptRegistry()
        self.prompt_version = prompt_version

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
                            "enum": ["Procurement Delay", "Open RFI", "Compliance Finding", "Critical Path Dependency"],
                        },
                        "impact_analysis": {"type": "string"},
                        "mitigation_strategy": {"type": "string"},
                    },
                    "required": ["activity_id", "activity_name", "risk_driver", "impact_analysis", "mitigation_strategy"],
                },
            }
        ]

    # ── helpers ──────────────────────────────────────────────────────────────

    def _is_mock_mode(self) -> bool:
        from app.config.config import settings
        key = getattr(settings, "ANTHROPIC_API_KEY", "") or ""
        return (
            not key
            or "your" in key.lower()
            or os.getenv("MOCK_LLM", "true").lower() == "true"
        )

    def _mock_mitigations(self, risk_candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Deterministic mock mitigations for demo mode.
        Produces realistic risk text based on activity attributes.
        """
        mitigations = []
        for act in risk_candidates:
            aid = act.get("id", "?")
            name = act.get("name", "Unknown Activity")

            if act.get("procurement_status") == "Delayed":
                mitigations.append({
                    "activity_id": aid,
                    "activity_name": name,
                    "risk_driver": "Procurement Delay",
                    "impact_analysis": (
                        f"A procurement delay on '{name}' (ID: {aid}) propagates directly to all downstream "
                        "activities on the critical path. Based on current float calculations, a 3-week delay "
                        "extends project duration by approximately 21 days, risking the Q-milestone deadline "
                        "and triggering potential liquidated damages clauses."
                    ),
                    "mitigation_strategy": (
                        "1. Engage licensed customs agent (CHA) for priority port clearance. "
                        "2. Issue formal expedite notice to vendor within 48 hours. "
                        "3. Pre-position any available materials at bonded warehouse to allow parallel installation. "
                        "4. Explore split-shipment with partial delivery of long-lead items first. "
                        "5. Update programme float analysis with revised ETA and circulate to client."
                    ),
                })
            elif act.get("open_rfis", 0) > 0:
                mitigations.append({
                    "activity_id": aid,
                    "activity_name": name,
                    "risk_driver": "Open RFI",
                    "impact_analysis": (
                        f"'{name}' (ID: {aid}) has {act.get('open_rfis', 1)} unresolved RFI(s). "
                        "Without resolution, installation cannot commence, blocking successor activities. "
                        "Each week of RFI delay consumes available float, eventually converting float to delay "
                        "and adding directly to project duration."
                    ),
                    "mitigation_strategy": (
                        "1. Escalate open RFI to consultant and client for 48-hour turnaround. "
                        "2. Prepare a 'worst case' and 'best case' technical solution to accelerate decision. "
                        "3. If RFI cannot be resolved within 3 days, raise it to weekly progress meeting agenda. "
                        "4. Adjust procurement order to reflect most likely RFI outcome to avoid re-procurement."
                    ),
                })
            elif act.get("compliance_issues", 0) > 0:
                mitigations.append({
                    "activity_id": aid,
                    "activity_name": name,
                    "risk_driver": "Compliance Finding",
                    "impact_analysis": (
                        f"'{name}' (ID: {aid}) has {act.get('compliance_issues', 1)} open compliance deviation(s). "
                        "If the deviation requires re-procurement or re-specification, a 2–4 week loop is likely "
                        "before installation can begin, consuming all available float and entering the critical path."
                    ),
                    "mitigation_strategy": (
                        "1. Issue NCR to vendor formally within 24 hours of finding. "
                        "2. Request corrective action plan with timeline within 5 business days. "
                        "3. Evaluate whether interim workaround allows partial installation to continue. "
                        "4. Engage QA manager and client representative for joint resolution workshop."
                    ),
                })
            elif act.get("is_critical"):
                mitigations.append({
                    "activity_id": aid,
                    "activity_name": name,
                    "risk_driver": "Critical Path Dependency",
                    "impact_analysis": (
                        f"'{name}' (ID: {aid}) is on the critical path with zero float. "
                        "Any delay directly extends overall project duration 1:1. "
                        "Predecessor dependencies must be resolved on time to prevent cascade."
                    ),
                    "mitigation_strategy": (
                        "1. Assign dedicated resource for daily progress tracking. "
                        "2. Hold 15-min stand-up with responsible contractor each morning. "
                        "3. Pre-identify parallel activities that can be resource-shifted if needed. "
                        "4. Confirm all prerequisite sign-offs and hold-point releases are scheduled in advance."
                    ),
                })
        return mitigations

    # ── main entry point ─────────────────────────────────────────────────────

    async def analyze_schedule_risks(self, activities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        19.4 High-Level Workflow: Deterministic CPM math → AI semantic risk reasoning.
        Falls back to mock mitigations when API key is absent.
        """
        # 1. Deterministic Graph Math (always runs)
        analyzer = ScheduleAnalyzer(activities)
        cpm_results = analyzer.calculate_cpm()

        # 2. Filter candidates with external constraints or critical float
        risk_candidates = [
            act for act in cpm_results["activities"]
            if (
                act.get("procurement_status") == "Delayed"
                or act.get("open_rfis", 0) > 0
                or act.get("compliance_issues", 0) > 0
                or act["is_critical"]
            )
        ]

        # 3. AI Reasoning (or mock)
        if self._is_mock_mode():
            ai_risks = self._mock_mitigations(risk_candidates)
        else:
            prompt = self.prompt_registry.get("schedule_risk_reasoning", self.prompt_version)
            system_prompt = prompt.system_instructions
            user_prompt = f"SCHEDULE GRAPH DATA:\n{json.dumps(risk_candidates, indent=2)}"

            try:
                response = await self.claude_service.create_message(
                    max_tokens=2048,
                    temperature=0.0,
                    system=system_prompt,
                    messages=[{"role": "user", "content": user_prompt}],
                    tools=self.tools,
                )
                ai_risks = []
                for block in response.content:
                    if block.type == "tool_use" and block.name == "flag_schedule_risk":
                        StructuredOutputValidator.validate_tool_payload(
                            block.input,
                            required_fields=["activity_id", "activity_name", "risk_driver",
                                             "impact_analysis", "mitigation_strategy"],
                            enum_fields={
                                "risk_driver": ["Procurement Delay", "Open RFI",
                                                "Compliance Finding", "Critical Path Dependency"],
                            },
                        )
                        ai_risks.append(block.input)
            except Exception:
                ai_risks = self._mock_mitigations(risk_candidates)

        return {
            "project_duration": cpm_results["project_duration"],
            "critical_path": cpm_results["critical_path"],
            "activities": cpm_results["activities"],
            "ai_risk_mitigations": ai_risks,
        }
