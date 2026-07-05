from pydantic import BaseModel, Field


class CopilotQuerySchema(BaseModel):
    project_id: str = Field(min_length=1)
    question: str = Field(min_length=1)
