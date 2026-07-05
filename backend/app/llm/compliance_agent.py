from typing import Any, Dict

from app.ai.claude_service import ClaudeService
from app.llm.response_validator import StructuredOutputValidator
from app.prompts.registry import PromptRegistry

class ComplianceAgentService:
    """
    Chapter 18 - Specification Compliance Agent
    Performs requirement-level semantic comparison between specifications and vendor submittals.
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

        # EDR 18-C: Claude produces structured JSON rather than narrative reports
        self.tools = [
            {
                "name": "flag_deviation",
                "description": "Records a compliance deviation between the project specification and vendor submittal.",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "requirement_id": {"type": "string", "description": "The specification requirement ID"},
                        "requirement_description": {"type": "string", "description": "The original spec requirement"},
                        "vendor_value": {"type": "string", "description": "What the vendor actually proposed"},
                        "compliance_status": {
                            "type": "string", 
                            "enum": ["Equivalent", "Partial Match", "Missing", "Contradictory", "Unknown"]
                        },
                        "severity": {
                            "type": "string",
                            "enum": ["Critical", "Major", "Minor", "Informational"]
                        },
                        "confidence": {"type": "number", "description": "Confidence score from 0.0 to 1.0"},
                        "explanation": {"type": "string", "description": "Why this conclusion was reached"},
                        "recommendation": {"type": "string", "description": "Recommended action"}
                    },
                    "required": ["requirement_id", "requirement_description", "vendor_value", "compliance_status", "severity", "explanation", "confidence"]
                }
            }
        ]

    def _calculate_severity_score(self, severity: str) -> int:
        weights = {
            "Critical": 40,
            "Major": 15,
            "Minor": 5,
            "Informational": 0
        }
        return weights.get(severity, 0)

    async def analyze_compliance(self, spec_text: str, vendor_text: str) -> Dict[str, Any]:
        """
        Executes semantic reasoning by invoking Claude with tools.
        Returns a structured compliance report.
        """
        prompt = self.prompt_registry.get(
            "compliance_deviation_detection",
            self.prompt_version,
        )
        system_prompt = prompt.system_instructions
        
        user_prompt = f"SPECIFICATION:\n{spec_text}\n\nVENDOR SUBMITTAL:\n{vendor_text}"
        
        # 18.11 Semantic Validation via Claude
        response = await self.claude_service.create_message(
            max_tokens=2048,
            temperature=0.0,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
            tools=self.tools
        )
        
        findings = []
        total_penalty = 0
        
        # Parse Tool Calls
        for block in response.content:
            if block.type == "tool_use" and block.name == "flag_deviation":
                finding = block.input
                StructuredOutputValidator.validate_tool_payload(
                    finding,
                    required_fields=[
                        "requirement_id",
                        "requirement_description",
                        "vendor_value",
                        "compliance_status",
                        "severity",
                        "explanation",
                        "confidence",
                    ],
                    enum_fields={
                        "compliance_status": [
                            "Equivalent",
                            "Partial Match",
                            "Missing",
                            "Contradictory",
                            "Unknown",
                        ],
                        "severity": [
                            "Critical",
                            "Major",
                            "Minor",
                            "Informational",
                        ],
                    },
                    confidence_field="confidence",
                )
                findings.append(finding)
                total_penalty += self._calculate_severity_score(finding.get("severity", "Informational"))
                
        # Calculate Compliance Score (100 - penalty)
        score = max(0, 100 - total_penalty)
        
        # Compile Report
        return {
            "overall_score": score,
            "total_findings": len(findings),
            "findings": findings,
            "recommendation": "Reject" if score < 70 else "Approve with comments"
        }
