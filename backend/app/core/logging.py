import logging
import sys

from app.config.config import settings


class StructuredLogFormatter(logging.Formatter):
    """Small structured formatter for machine-readable-ish logs."""

    def format(self, record: logging.LogRecord) -> str:
        base = {
            "level": record.levelname,
            "service": getattr(record, "service", record.name),
            "operation": getattr(record, "operation", record.getMessage()),
            "message": record.getMessage(),
        }
        for key in (
            "correlation_id",
            "request_id",
            "user_id",
            "duration_ms",
            "result_status",
            "error_classification",
        ):
            value = getattr(record, key, None)
            if value is not None:
                base[key] = value
        return " ".join(f"{key}={value}" for key, value in base.items())


def configure_logging() -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(StructuredLogFormatter())

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(settings.LOG_LEVEL.upper())

