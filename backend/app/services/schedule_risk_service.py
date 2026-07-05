from typing import Any, Dict, List

from app.llm.schedule_agent import ScheduleRiskAgentService


class ScheduleRiskService:
    """Coordinates schedule graph analysis and AI mitigation reasoning."""

    def __init__(self, schedule_agent: ScheduleRiskAgentService):
        self.schedule_agent = schedule_agent

    async def analyse_schedule(self, activities: List[Dict[str, Any]]) -> Dict[str, Any]:
        return await self.schedule_agent.analyze_schedule_risks(activities)

