import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Float, Integer, JSON, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base

class Case(Base):
    __tablename__ = "cases"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    client_token: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="created")  # created, processing, completed, failed
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    evidence_items = relationship("EvidenceItem", back_populates="case", cascade="all, delete-orphan")
    modality_results = relationship("ModalityResult", back_populates="case", cascade="all, delete-orphan")
    fusion_assessment = relationship("FusionAssessment", back_populates="case", uselist=False, cascade="all, delete-orphan")
    audit_events = relationship("AuditEvent", back_populates="case", cascade="all, delete-orphan")
    fia_reports = relationship("FIAIncidentReport", back_populates="case", cascade="all, delete-orphan")
    ambient_scans = relationship("AmbientScanLog", back_populates="case", cascade="all, delete-orphan")

class EvidenceItem(Base):
    __tablename__ = "evidence_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id: Mapped[str] = mapped_column(String(36), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    modality: Mapped[str] = mapped_column(String(32), nullable=False)  # voice, message, conversation, url, phone
    raw_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    storage_path: Mapped[str] = mapped_column(String(255), nullable=True)
    is_purged: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    case = relationship("Case", back_populates="evidence_items")

class ModalityResult(Base):
    __tablename__ = "modality_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id: Mapped[str] = mapped_column(String(36), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    modality: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="analyzed")  # analyzed, inconclusive, failed, insufficient_data
    risk_score: Mapped[float] = mapped_column(Float, nullable=True)  # 0.0 - 100.0
    risk_label: Mapped[str] = mapped_column(String(32), nullable=True)  # low, medium, high, inconclusive
    confidence: Mapped[float] = mapped_column(Float, nullable=True)
    signals: Mapped[list] = mapped_column(JSON, default=list)
    metrics: Mapped[dict] = mapped_column(JSON, default=dict)
    model_info: Mapped[dict] = mapped_column(JSON, default=dict)
    limitations: Mapped[list] = mapped_column(JSON, default=list)
    processing_ms: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    case = relationship("Case", back_populates="modality_results")

class FusionAssessment(Base):
    __tablename__ = "fusion_assessments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id: Mapped[str] = mapped_column(String(36), ForeignKey("cases.id", ondelete="CASCADE"), unique=True, nullable=False)
    fused_score: Mapped[float] = mapped_column(Float, nullable=True)
    risk_category: Mapped[str] = mapped_column(String(32), nullable=True)  # low, medium, high, inconclusive
    status: Mapped[str] = mapped_column(String(32), default="evaluated")
    active_modalities: Mapped[list] = mapped_column(JSON, default=list)
    missing_modalities: Mapped[list] = mapped_column(JSON, default=list)
    weights_applied: Mapped[dict] = mapped_column(JSON, default=dict)
    rationale: Mapped[str] = mapped_column(String(2048), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    case = relationship("Case", back_populates="fusion_assessment")

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id: Mapped[str] = mapped_column(String(36), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    action: Mapped[str] = mapped_column(String(64), nullable=False)
    details: Mapped[dict] = mapped_column(JSON, default=dict)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    case = relationship("Case", back_populates="audit_events")

class FIAIncidentReport(Base):
    __tablename__ = "fia_incident_reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id: Mapped[str] = mapped_column(String(36), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    reference_no: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    accused_identifier: Mapped[str] = mapped_column(String(255), nullable=True)
    platform_source: Mapped[str] = mapped_column(String(64), default="web")
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    risk_category: Mapped[str] = mapped_column(String(32), default="high")
    statutory_sections: Mapped[list] = mapped_column(JSON, default=list)
    evidence_summary: Mapped[dict] = mapped_column(JSON, default=dict)
    complaint_text: Mapped[str] = mapped_column(String(8192), default="")
    sha256_digest: Mapped[str] = mapped_column(String(64), nullable=True)
    operator_notes: Mapped[str] = mapped_column(String(1024), default="")
    status: Mapped[str] = mapped_column(String(32), default="REGISTERED")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    case = relationship("Case", back_populates="fia_reports")

class AmbientScanLog(Base):
    __tablename__ = "ambient_scan_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id: Mapped[str] = mapped_column(String(36), ForeignKey("cases.id", ondelete="CASCADE"), nullable=True)
    source: Mapped[str] = mapped_column(String(64), default="ambient")
    sender_info: Mapped[str] = mapped_column(String(255), nullable=True)
    preview_snippet: Mapped[str] = mapped_column(String(512), default="")
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    is_threat: Mapped[bool] = mapped_column(default=False)
    threat_tags: Mapped[list] = mapped_column(JSON, default=list)
    target_phone: Mapped[str] = mapped_column(String(64), nullable=True)
    target_url: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    case = relationship("Case", back_populates="ambient_scans")
