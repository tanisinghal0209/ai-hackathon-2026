import logging

from app.events import DomainEvent


logger = logging.getLogger(__name__)


class EventPublisher:
    """
    Lightweight domain-event publisher.

    Today this records workflow milestones in logs. It can later publish to
    Redis streams, Kafka, or another event bus without changing orchestrators.
    """

    def publish(self, event: DomainEvent) -> None:
        logger.info(
            "domain_event",
            extra={
                "event_id": event.event_id,
                "event_type": event.event_type,
                "correlation_id": event.correlation_id,
                "payload": event.payload,
                "occurred_at": event.occurred_at.isoformat(),
            },
        )

