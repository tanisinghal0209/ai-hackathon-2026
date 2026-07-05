from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict
from uuid import uuid4


@dataclass(frozen=True)
class DomainEvent:
    """Completed business milestone emitted by orchestrated workflows."""

    event_type: str
    correlation_id: str
    payload: Dict[str, Any]
    event_id: str = field(default_factory=lambda: str(uuid4()))
    occurred_at: datetime = field(default_factory=datetime.utcnow)


def document_event(
    event_type: str,
    *,
    document_id: str,
    correlation_id: str,
    **payload: Any,
) -> DomainEvent:
    return DomainEvent(
        event_type=event_type,
        correlation_id=correlation_id,
        payload={"document_id": document_id, **payload},
    )

