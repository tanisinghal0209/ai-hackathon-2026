from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class DocumentCreateSchema(BaseModel):
    project_id: str = Field(default="default-project")
    filename: str
    category: Optional[str] = None


class DocumentUpdateSchema(BaseModel):
    category: Optional[str] = None
    processing_status: Optional[str] = None
    is_deleted: Optional[bool] = None


class DocumentSummarySchema(BaseModel):
    id: str
    project_id: str
    filename: str
    processing_status: str
    category: Optional[str] = None
    upload_timestamp: Optional[datetime] = None


class DocumentDetailSchema(DocumentSummarySchema):
    storage_path: str
    page_count: Optional[int] = None
    language: Optional[str] = None
    file_size: Optional[int] = None
    checksum: Optional[str] = None
    parser_version: Optional[str] = None
    version: Optional[int] = None
    is_deleted: Optional[bool] = None

