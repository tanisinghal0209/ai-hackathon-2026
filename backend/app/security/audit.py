import logging
from datetime import datetime
from typing import Optional, Dict, Any
import uuid

# Chapter 23.19 - Audit Logging

logger = logging.getLogger("epc_audit")
logger.setLevel(logging.INFO)
# In a real environment, this would go to a secure, append-only store like CloudWatch or an ELK stack.
handler = logging.StreamHandler()
formatter = logging.Formatter('AUDIT_TRAIL - %(asctime)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

class AuditLogger:
    @staticmethod
    def log_event(
        action: str,
        user_id: str,
        project_id: str,
        resource: str,
        result: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Logs an immutable audit event conforming to Section 23.19.
        """
        correlation_id = str(uuid.uuid4())
        
        event = {
            "timestamp": datetime.utcnow().isoformat(),
            "user": user_id,
            "project": project_id,
            "action": action,
            "resource": resource,
            "result": result,
            "correlation_id": correlation_id,
            "metadata": metadata or {}
        }
        
        # Log as a JSON string for easy ingestion by log aggregators
        import json
        logger.info(json.dumps(event))
