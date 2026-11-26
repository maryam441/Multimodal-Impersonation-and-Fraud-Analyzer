from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class EvidenceSpan(BaseModel):
    start: int
    end: int
    text_snippet: Optional[str] = None
    timestamp_start_sec: Optional[float] = None
    timestamp_end_sec: Optional[float] = None

class EvidenceSignal(BaseModel):
    code: str
    category: str
    description: str
    evidence: str
    severity: str = "medium"  # low, medium, high, critical
    span: Optional[EvidenceSpan] = None

class ModalityResultResponse(BaseModel):
    analysis_id: str
    modality: str
    status: str  # analyzed, inconclusive, failed, insufficient_data
    risk_score: Optional[float] = None  # 0.0 - 100.0
    risk_label: Optional[str] = None  # low, medium, high, inconclusive
    confidence: Optional[float] = None
    confidence_note: Optional[str] = "Model confidence score is indicative decision-support and not a calibrated posterior probability."
    signals: List[EvidenceSignal] = []
    metrics: Dict[str, Any] = {}
    model: Dict[str, str] = {}
    limitations: List[str] = []
    processing_ms: int = 0
    created_at: datetime
