from dataclasses import dataclass
from typing import Set

from fastapi import Depends, Request

from app.config.config import settings


CAPABILITY_MAP = {
    "Project Administrator": {
        "query_knowledge",
        "run_compliance_analysis",
        "run_schedule_analysis",
        "upload_documents",
        "approve_compliance_findings",
    },
    "Project Manager": {
        "query_knowledge",
        "run_schedule_analysis",
        "upload_documents",
    },
    "Quality Engineer": {
        "query_knowledge",
        "run_compliance_analysis",
        "upload_documents",
        "approve_compliance_findings",
    },
    "Planning Engineer": {
        "query_knowledge",
        "run_schedule_analysis",
    },
    "Auditor": {
        "query_knowledge",
    },
}


@dataclass(frozen=True)
class UserContext:
    user_id: str
    role: str
    capabilities: Set[str]

    def can(self, capability: str) -> bool:
        return capability in self.capabilities


def get_current_user(request: Request) -> UserContext:
    """
    Demo authentication context.

    Future providers can replace this dependency without changing business
    services or routers.
    """
    user_id = request.headers.get("X-Demo-User-ID", settings.DEMO_USER_ID)
    role = request.headers.get("X-Demo-User-Role", settings.DEMO_USER_ROLE)
    capabilities = CAPABILITY_MAP.get(role, CAPABILITY_MAP["Auditor"])
    return UserContext(user_id=user_id, role=role, capabilities=set(capabilities))


def require_capability(capability: str):
    def dependency(user: UserContext = Depends(get_current_user)) -> UserContext:
        if not user.can(capability):
            from app.core.exceptions import AuthorizationError

            raise AuthorizationError(capability)
        return user

    return dependency

