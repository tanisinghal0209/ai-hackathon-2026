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

