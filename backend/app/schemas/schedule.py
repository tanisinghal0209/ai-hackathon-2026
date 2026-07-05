from typing import Any, Dict, List

from pydantic import BaseModel, Field


class ScheduleActivitySchema(BaseModel):
    id: str
    name: str
    duration: int = Field(ge=0)
    predecessors: List[str] = Field(default_factory=list)
    procurement_status: str | None = None
    open_rfis: int = Field(default=0, ge=0)
    compliance_issues: int = Field(default=0, ge=0)


class ScheduleAnalyzeRequest(BaseModel):
    activities: List[ScheduleActivitySchema]

    def as_activity_dicts(self) -> List[Dict[str, Any]]:
        return [activity.model_dump() for activity in self.activities]

