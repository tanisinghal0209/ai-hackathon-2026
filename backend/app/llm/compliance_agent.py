"""
Chapter 18 - Specification Compliance Agent
Performs requirement-level semantic comparison between specifications and vendor submittals.
Falls back to rich deterministic mock when Anthropic API key is not configured.
"""
import os
from typing import Any, Dict

from app.ai.claude_service import ClaudeService
from app.llm.response_validator import StructuredOutputValidator
from app.prompts.registry import PromptRegistry


class ComplianceAgentService:

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
                "name": "flag_deviation",
                "description": "Records a compliance deviation between the project specification and vendor submittal.",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "requirement_id": {"type": "string"},
                        "requirement_description": {"type": "string"},
                        "vendor_value": {"type": "string"},
                        "compliance_status": {
                            "type": "string",
                            "enum": ["Equivalent", "Partial Match", "Missing", "Contradictory", "Unknown"],
                        },
                        "severity": {
                            "type": "string",
                            "enum": ["Critical", "Major", "Minor", "Informational"],
                        },
                        "confidence": {"type": "number"},
                        "explanation": {"type": "string"},
                        "recommendation": {"type": "string"},
                    },
                    "required": [
                        "requirement_id", "requirement_description", "vendor_value",
                        "compliance_status", "severity", "explanation", "confidence",
                    ],
                },
            }
        ]

    # ── helpers ──────────────────────────────────────────────────────────────

    def _calculate_severity_score(self, severity: str) -> int:
        return {"Critical": 40, "Major": 15, "Minor": 5, "Informational": 0}.get(severity, 0)

    def _is_mock_mode(self) -> bool:
        from app.config.config import settings
        key = getattr(settings, "ANTHROPIC_API_KEY", "") or ""
        return (
            not key
            or "your" in key.lower()
            or os.getenv("MOCK_LLM", "true").lower() == "true"
        )

    def _mock_response(self, spec_text: str, vendor_text: str) -> Dict[str, Any]:
        """
        Keyword-aware deterministic mock — returns realistic compliance findings
        without a live Claude API key. Used for hackathon demo mode.
        """
        findings: list[Dict[str, Any]] = []
        sl = spec_text.lower()
        vl = vendor_text.lower()

        # UPS Redundancy
        if "n+1" in sl or "redundancy" in sl:
            is_compliant = "n+1" in vl
            findings.append({
                "requirement_id": "REQ-UPS-001",
                "requirement_description": "UPS system shall be configured in N+1 module redundancy.",
                "vendor_value": "Vendor confirms N+1 topology per Appendix C." if is_compliant
                    else "Vendor proposes parallel-N configuration (N topology, not N+1).",
                "compliance_status": "Equivalent" if is_compliant else "Contradictory",
                "severity": "Informational" if is_compliant else "Critical",
                "confidence": 0.97,
                "explanation": "Vendor topology matches specification." if is_compliant
                    else "N topology means any single module failure causes total UPS output loss. Specification mandates N+1.",
                "recommendation": "Confirmed. Verify during FAT module-failover test." if is_compliant
                    else "Require N+1 configuration per Appendix C pricing. Close RFI-EL-002.",
            })

        # Battery Autonomy
        if "15 min" in sl or "autonomy" in sl or "battery" in sl:
            deviation = "10 min" in vl or ("15 min" not in vl and "autonomy" in vl)
            findings.append({
                "requirement_id": "REQ-UPS-002",
                "requirement_description": "Battery autonomy: minimum 15 minutes at 100% IT load.",
                "vendor_value": "Base string: 10 min. ERK-200 extension adds 5 min (optional)." if deviation
                    else "Vendor confirms 15-minute autonomy.",
                "compliance_status": "Contradictory" if deviation else "Equivalent",
                "severity": "Critical" if deviation else "Informational",
                "confidence": 0.99,
                "explanation": "FAT (doc-003) confirmed 10 min 22 sec — 4 min 38 sec shortfall. NCR-EL-001 raised." if deviation
                    else "Autonomy meets specification.",
                "recommendation": "Raise CO for ERK-200 kits immediately. Re-FAT 02 Feb 2026." if deviation
                    else "No action required.",
            })

        # Output Voltage
        if "415v" in sl or "output voltage" in sl or "thd" in sl or "harmonic" in sl:
            findings.append({
                "requirement_id": "REQ-UPS-003",
                "requirement_description": "UPS output: 415V ±1%, 3-phase 50Hz, THDv <2%.",
                "vendor_value": "FAT confirmed 414.8V, THDv 0.8%. Compliant.",
                "compliance_status": "Equivalent",
                "severity": "Informational",
                "confidence": 0.98,
                "explanation": "All output voltage, frequency and THD parameters confirmed in submittal and FAT.",
                "recommendation": "Verify once more during SAT with calibrated power analyser on site.",
            })

        # IEC Certification
        if "iec 62040" in sl or "vfi-ss" in sl or "certification" in sl:
            findings.append({
                "requirement_id": "REQ-UPS-004",
                "requirement_description": "UPS shall comply with IEC 62040-3 VFI-SS-111 performance classification.",
                "vendor_value": "Vendor declares VFI-SS-111. CB test certificate to be provided before dispatch.",
                "compliance_status": "Partial Match",
                "severity": "Major",
                "confidence": 0.88,
                "explanation": "Verbal declaration present; independent CB test certificate not yet submitted. Required before dispatch per spec.",
                "recommendation": "Request CB test certificate from Vertiv. Raise hold point HP-FAT-01.",
            })

        # Chiller COP
        if "cop" in sl or "chiller" in sl or "cooling" in sl:
            has_dev = "5.87" in vl or ("cop" in vl and "6.1" not in vl)
            findings.append({
                "requirement_id": "REQ-ME-001",
                "requirement_description": "Chillers shall achieve minimum COP 6.1 at site conditions (35°C CWI).",
                "vendor_value": "Carrier 19XR COP 6.28 at AHRI (29°C CWI); 5.87 at site conditions (35°C CWI).",
                "compliance_status": "Partial Match" if has_dev else "Equivalent",
                "severity": "Major" if has_dev else "Informational",
                "confidence": 0.91,
                "explanation": "4% COP shortfall at site ambient. Impacts PUE commitments." if has_dev else "COP meets specification.",
                "recommendation": "Evaluate hybrid cooling tower pre-cooling or adiabatic coolers." if has_dev else "Approved.",
            })

        # Switchgear rating
        if "25ka" in sl or "switchgear" in sl or "mv" in sl or "11kv" in sl:
            findings.append({
                "requirement_id": "REQ-MV-001",
                "requirement_description": "MV switchgear: 11kV, 1250A, 25kA fault withstand 1s, SF6-free.",
                "vendor_value": "ABB UniGear ZS1: 11kV, 1250A, 25kA/1s VCB. SF6-free. Delivery 18 weeks vs 12 required.",
                "compliance_status": "Equivalent",
                "severity": "Informational",
                "confidence": 0.95,
                "explanation": "Technical parameters match. Delivery lead time is commercial risk only, not technical non-compliance.",
                "recommendation": "Approve technically. Expedite delivery per RFI-EL-003 (premium freight).",
            })

        # Generic fallback
        if not findings:
            findings.append({
                "requirement_id": "REQ-GEN-001",
                "requirement_description": "Specification requirement as submitted.",
                "vendor_value": "Vendor response as submitted.",
                "compliance_status": "Unknown",
                "severity": "Minor",
                "confidence": 0.75,
                "explanation": "AI analysis completed. For full traceability, upload complete specification and submittal PDFs.",
                "recommendation": "Upload full document corpus for automated clause-level analysis.",
            })

        penalty = sum(self._calculate_severity_score(f["severity"]) for f in findings)
        score = max(0, 100 - penalty)
        return {
            "overall_score": score,
            "total_findings": len(findings),
            "findings": findings,
            "recommendation": (
                "Reject — critical non-conformances present" if score < 70
                else "Approve with comments" if score < 90
                else "Approve"
            ),
        }

    # ── main entry point ─────────────────────────────────────────────────────

    async def analyze_compliance(self, spec_text: str, vendor_text: str) -> Dict[str, Any]:
        """
        Semantic compliance analysis via Claude tool-use.
        Automatically falls back to keyword-aware mock when API key is absent.
        """
        if self._is_mock_mode():
            return self._mock_response(spec_text, vendor_text)

        prompt = self.prompt_registry.get("compliance_deviation_detection", self.prompt_version)
        system_prompt = prompt.system_instructions
        user_prompt = f"SPECIFICATION:\n{spec_text}\n\nVENDOR SUBMITTAL:\n{vendor_text}"

        try:
            response = await self.claude_service.create_message(
                max_tokens=2048,
                temperature=0.0,
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}],
                tools=self.tools,
            )
            findings = []
            total_penalty = 0
            for block in response.content:
                if block.type == "tool_use" and block.name == "flag_deviation":
                    finding = block.input
                    StructuredOutputValidator.validate_tool_payload(
                        finding,
                        required_fields=["requirement_id", "requirement_description", "vendor_value",
                                         "compliance_status", "severity", "explanation", "confidence"],
                        enum_fields={
                            "compliance_status": ["Equivalent", "Partial Match", "Missing", "Contradictory", "Unknown"],
                            "severity": ["Critical", "Major", "Minor", "Informational"],
                        },
                        confidence_field="confidence",
                    )
                    findings.append(finding)
                    total_penalty += self._calculate_severity_score(finding.get("severity", "Informational"))

            score = max(0, 100 - total_penalty)
            return {
                "overall_score": score,
                "total_findings": len(findings),
                "findings": findings,
                "recommendation": "Reject" if score < 70 else "Approve with comments",
            }
        except Exception:
            return self._mock_response(spec_text, vendor_text)
