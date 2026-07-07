from typing import Any, Dict, List, Optional

from app.core.exceptions import AIProviderError


class StructuredOutputValidator:
    """
    Deterministic validation for Claude tool outputs.
    """

    @staticmethod
    def validate_tool_payload(
        payload: Dict[str, Any],
        *,
        required_fields: List[str],
        enum_fields: Optional[Dict[str, List[str]]] = None,
        confidence_field: Optional[str] = None,
    ) -> None:
        missing = [field for field in required_fields if field not in payload]
        if missing:
            raise AIProviderError(
                provider="Claude",
                detail=f"Structured output missing required fields: {missing}",
            )

        for field, allowed_values in (enum_fields or {}).items():
            value = payload.get(field)
            if value is not None and value not in allowed_values:
                raise AIProviderError(
                    provider="Claude",
                    detail=f"Invalid enum value for {field}: {value}",
                )

        if confidence_field and confidence_field in payload:
            confidence = payload[confidence_field]
            if not isinstance(confidence, (int, float)) or not 0 <= confidence <= 1:
                raise AIProviderError(
                    provider="Claude",
                    detail=f"Invalid confidence value: {confidence}",
                )
            
            # Chapter 23.13 - Hallucination Prevention Framework
            # Responses falling below configurable confidence thresholds shall explicitly 
            # communicate uncertainty rather than presenting unsupported conclusions.
            if confidence < 0.6:
                raise AIProviderError(
                    provider="Claude",
                    detail="Confidence threshold not met. Escalating for manual review or falling back to 'insufficient evidence' response."
                )

    @staticmethod
    def enforce_hallucination_prevention(
        payload: Dict[str, Any],
        retrieved_chunks: List[Dict[str, Any]],
        confidence_field: str = "confidence",
        citation_field: str = "citations"
    ) -> None:
        """
        Implements the multi-layer hallucination prevention framework (Chapter 23.13).
        Validates confidence and ensures citations actually map to retrieved chunks.
        """
        # Layer 4: Confidence estimation
        if payload.get(confidence_field, 1.0) < 0.7:
            payload["escalation_required"] = True
            payload["system_note"] = "Insufficient evidence to provide a deterministic engineering conclusion."
            
        # Layer 2: Citation enforcement
        citations = payload.get(citation_field, [])
        valid_chunk_ids = {str(c.get('chunk_id')) for c in retrieved_chunks}
        
        for citation in citations:
            if str(citation) not in valid_chunk_ids:
                raise AIProviderError(
                    provider="Claude",
                    detail=f"Citation Forgery Detected: Chunk ID {citation} was not in retrieved context."
                )

