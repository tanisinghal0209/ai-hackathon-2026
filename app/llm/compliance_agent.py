import os
import json
from anthropic import AsyncAnthropic
from typing import List, Dict, Any

class ComplianceAgentService:
    """
    Chapter 18 - Specification Compliance Agent
    Performs requirement-level semantic comparison between specifications and vendor submittals.
    """
    def __init__(self):
        self.client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        
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
        system_prompt = (
            "You are a Data Centre EPC Compliance Agent. "
            "Compare the provided Vendor Submittal against the Specification Requirements. "
            "If you detect ANY deviation, you MUST invoke the `flag_deviation` tool. "
            "Do not output conversational text, only invoke tools for deviations."
        )
        
        user_prompt = f"SPECIFICATION:\n{spec_text}\n\nVENDOR SUBMITTAL:\n{vendor_text}"
        
        # 18.11 Semantic Validation via Claude
        response = await self.client.messages.create(
            model="claude-haiku-4-5-20251001",
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
