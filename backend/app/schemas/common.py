from pydantic import BaseModel, Field
from typing import Generic, TypeVar, Optional, Any
from datetime import datetime

T = TypeVar("T")

class ProcessingMetadata(BaseModel):
    processing_time_ms: Optional[int] = None
    confidence_score: Optional[float] = None
    token_usage: Optional[int] = None

class StatusInfo(BaseModel):
    success: bool
    code: int
    message: str

class APIResponse(BaseModel, Generic[T]):
    """
    Standard API Envelope based on SRS Chapter 16.2.
    """
    data: Optional[T] = None
    metadata: ProcessingMetadata = Field(default_factory=ProcessingMetadata)
    status: StatusInfo
    timestamp: datetime = Field(default_factory=datetime.utcnow)
