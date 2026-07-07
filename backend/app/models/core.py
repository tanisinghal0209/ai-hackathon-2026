from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Float, JSON
from sqlalchemy.orm import relationship, backref
from pgvector.sqlalchemy import Vector
from datetime import datetime
import uuid

from app.database.session import Base

def generate_uuid():
    return str(uuid.uuid4())


class AuditMixin:
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    version = Column(Integer, default=1)
    is_deleted = Column(Integer, default=0)


class Project(AuditMixin, Base):
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    client_org = Column(String)
    location = Column(String)
    lifecycle_stage = Column(String)

class Document(AuditMixin, Base):
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    filename = Column(String, nullable=False)
    storage_path = Column(String, nullable=False)
    upload_timestamp = Column(DateTime, default=datetime.utcnow)
    uploader_id = Column(String) # For future auth integration
    category = Column(String)
    processing_status = Column(String, default="Pending")
    page_count = Column(Integer)
    language = Column(String, default="en")
    file_size = Column(Integer)
    checksum = Column(String)
    parser_version = Column(String)

    project = relationship("Project")

class Page(Base):
    __tablename__ = "pages"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    page_number = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    
    document = relationship("Document")

class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(String, primary_key=True, default=generate_uuid)
    page_id = Column(String, ForeignKey("pages.id"), nullable=False)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    text = Column(Text, nullable=False)
    chunk_order = Column(Integer, nullable=False)
    token_count = Column(Integer)
    # 20.24: Rich chunk metadata
    section_heading = Column(String)          # parent section title
    clause_identifier = Column(String)        # e.g. "4.2.1"
    semantic_role = Column(String)            # Mandatory Requirement / Recommendation / etc.
    engineering_discipline = Column(String)   # Electrical, Mechanical, Civil…
    equipment_category = Column(String)       # UPS, Generator, Switchgear…
    parser_confidence = Column(Float, default=1.0)
    chunk_version = Column(Integer, default=1)
    # 20.23: Parent-Child relationships
    parent_chunk_id = Column(String, ForeignKey("chunks.id"), nullable=True)
    previous_chunk_id = Column(String, nullable=True)
    next_chunk_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    page = relationship("Page")
    document = relationship("Document")
    children = relationship("Chunk", backref=backref("parent", remote_side="Chunk.id"), primaryjoin="Chunk.id == Chunk.parent_chunk_id", foreign_keys="Chunk.parent_chunk_id")


# 20.25: Engineering entity extracted from a chunk
class EngineeringEntity(Base):
    __tablename__ = "engineering_entities"

    id = Column(String, primary_key=True, default=generate_uuid)
    chunk_id = Column(String, ForeignKey("chunks.id"), nullable=False)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    entity_type = Column(String, nullable=False)   # EQUIPMENT / STANDARD / RATING / MODEL / CABLE_TYPE
    entity_value = Column(String, nullable=False)  # e.g. "Galaxy VX", "IEC 62040", "415V"
    canonical_name = Column(String)                # mapped via ontology (20.26)
    created_at = Column(DateTime, default=datetime.utcnow)

    chunk = relationship("Chunk", backref="entities")
    document = relationship("Document")


# 20.26: Ontology synonym mapping
class OntologyEntry(Base):
    __tablename__ = "ontology_entries"

    id = Column(String, primary_key=True, default=generate_uuid)
    canonical_name = Column(String, nullable=False, unique=True)  # e.g. "Battery Runtime"
    synonyms = Column(JSON, default=list)                          # ["Battery Autonomy", "Hold-Up Time"]
    engineering_discipline = Column(String)
    equipment_category = Column(String)
    measurement_unit = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Embedding(Base):
    __tablename__ = "embeddings"

    id = Column(String, primary_key=True, default=generate_uuid)
    chunk_id = Column(String, ForeignKey("chunks.id"), nullable=False)
    model = Column(String, nullable=False)
    # 20.29: Embedding versioning
    model_version = Column(String)            # e.g. "text-embedding-3-small-v1"
    pipeline_version = Column(String)         # the ingestion pipeline version
    chunk_version = Column(Integer, default=1)
    vector_dimension = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Integer, default=1)    # 1 = active, 0 = archived (superseded)

    # pgvector: text-embedding-3-small = 1536 dims
    vector = Column(Vector(1536))

    chunk = relationship("Chunk")


# 20.37: Citation Graph — links every AI response statement to its source evidence
class CitationRecord(Base):
    __tablename__ = "citation_records"

    id = Column(String, primary_key=True, default=generate_uuid)
    # The AI response this citation belongs to (e.g. copilot session or compliance run)
    response_session_id = Column(String, nullable=False, index=True)
    chunk_id = Column(String, ForeignKey("chunks.id"), nullable=False)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    # Exact text excerpt cited
    cited_text = Column(Text)
    # Position in the response where this citation was used
    citation_order = Column(Integer, default=0)
    retrieval_score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    chunk = relationship("Chunk")
    document = relationship("Document")


class SpecificationRequirement(AuditMixin, Base):
    __tablename__ = "specification_requirements"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    document_id = Column(String, ForeignKey("documents.id"))
    requirement_code = Column(String, nullable=False)
    requirement_text = Column(Text, nullable=False)
    discipline = Column(String)
    equipment_category = Column(String)
    severity = Column(String)


class VendorSubmittal(AuditMixin, Base):
    __tablename__ = "vendor_submittals"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    vendor_name = Column(String, nullable=False)
    package_name = Column(String, nullable=False)
    document_id = Column(String, ForeignKey("documents.id"))
    review_status = Column(String, default="Pending")


class RFI(AuditMixin, Base):
    __tablename__ = "rfis"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    rfi_number = Column(String, nullable=False)
    discipline = Column(String)
    equipment = Column(String)
    question = Column(Text, nullable=False)
    response_summary = Column(Text)
    status = Column(String, default="Open")


class Schedule(AuditMixin, Base):
    __tablename__ = "schedules"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    name = Column(String, nullable=False)
    baseline_version = Column(String)
    status = Column(String, default="Draft")


class ScheduleTask(AuditMixin, Base):
    __tablename__ = "schedule_tasks"

    id = Column(String, primary_key=True, default=generate_uuid)
    schedule_id = Column(String, ForeignKey("schedules.id"), nullable=False)
    external_task_id = Column(String, nullable=False)
    name = Column(String, nullable=False)
    duration_days = Column(Integer, nullable=False)
    procurement_status = Column(String)
    open_rfis = Column(Integer, default=0)
    compliance_issues = Column(Integer, default=0)


class TaskDependency(AuditMixin, Base):
    __tablename__ = "task_dependencies"

    id = Column(String, primary_key=True, default=generate_uuid)
    schedule_id = Column(String, ForeignKey("schedules.id"), nullable=False)
    predecessor_task_id = Column(String, ForeignKey("schedule_tasks.id"), nullable=False)
    successor_task_id = Column(String, ForeignKey("schedule_tasks.id"), nullable=False)


class ProcurementItem(AuditMixin, Base):
    __tablename__ = "procurement_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    package_id = Column(String, nullable=False)
    equipment = Column(String, nullable=False)
    vendor = Column(String)
    status = Column(String, default="Pending")
    risk_reason = Column(Text)
    linked_activity_id = Column(String)


class ComplianceFinding(AuditMixin, Base):
    __tablename__ = "compliance_findings"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    requirement_id = Column(String)
    vendor_submittal_id = Column(String, ForeignKey("vendor_submittals.id"))
    compliance_status = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    confidence = Column(Float)
    explanation = Column(Text)
    recommendation = Column(Text)
    review_status = Column(String, default="Open")


class RiskAssessment(AuditMixin, Base):
    __tablename__ = "risk_assessments"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    risk_type = Column(String, nullable=False)
    source_ref = Column(String)
    severity = Column(String)
    probability = Column(Float)
    impact = Column(Text)
    mitigation = Column(Text)
    status = Column(String, default="Open")


class PromptVersion(AuditMixin, Base):
    __tablename__ = "prompt_versions"

    id = Column(String, primary_key=True, default=generate_uuid)
    prompt_id = Column(String, nullable=False)
    version_label = Column(String, nullable=False)
    agent = Column(String, nullable=False)
    system_instructions = Column(Text, nullable=False)
    developer_instructions = Column(Text)
    expected_output_schema = Column(JSON)
    tool_definitions = Column(JSON, default=list)
    owner = Column(String)
