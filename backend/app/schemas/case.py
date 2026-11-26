from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class CaseCreateRequest(BaseModel):
    retention_hours: Optional[int] = Field(24, ge=1, le=168, description="TTL in hours before auto-purge (1 to 168 hours)")

class CaseResponse(BaseModel):
    case_id: str
    client_token: str
    status: str
    created_at: datetime
    expires_at: datetime
    active_modalities: List[str] = []
    message: str = "Case initialized successfully. Retain client_token for authorization."

class CaseSummary(BaseModel):
    case_id: str
    status: str
    created_at: datetime
    expires_at: datetime
    active_modalities: List[str]
    is_expired: bool
