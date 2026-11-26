from typing import Optional, List, Dict
from pydantic import BaseModel, Field

class PhoneAnalysisRequest(BaseModel):
    phone_number: str = Field(..., min_length=3, max_length=32, description="Target phone number (e.g., +923001234567)")
    country_code: Optional[str] = Field("PK", description="Two-letter ISO country code default (e.g. PK)")

class MessageAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000, description="SMS or message text")

class ConversationTurnInput(BaseModel):
    speaker: str = Field("Caller", description="Speaker role: Caller, User, etc.")
    text: str = Field(..., min_length=1, max_length=5000)

class ConversationAnalysisRequest(BaseModel):
    turns: Optional[List[ConversationTurnInput]] = None
    raw_text: Optional[str] = None

class URLAnalysisRequest(BaseModel):
    url: str = Field(..., min_length=3, max_length=2048, description="Target URL string to inspect")

class EmailAnalysisRequest(BaseModel):
    sender: str = Field(..., min_length=3, max_length=255, description="Sender header (e.g. 'HBL Support <service@hbl-alert.pk>')")
    subject: str = Field(..., min_length=1, max_length=500, description="Email subject line")
    body: str = Field(..., min_length=5, max_length=20000, description="Plaintext or sanitized HTML email body")
    reply_to: Optional[str] = Field(None, max_length=255, description="Optional Reply-To header")
    headers: Optional[Dict[str, str]] = Field(default_factory=dict, description="Raw or parsed RFC headers (SPF, DKIM, DMARC)")
