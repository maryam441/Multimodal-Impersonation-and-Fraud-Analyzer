from typing import List, Optional
from pydantic import BaseModel, Field

class ExtractionRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000, description="Pasted SMS or conversation text to scan for links and phone numbers")

class ExtractedURL(BaseModel):
    raw_url: str
    defanged_url: str
    domain: str
    span: List[int]  # [start, end]

class ExtractedPhone(BaseModel):
    raw_number: str
    normalized_e164: Optional[str] = None
    country_code: Optional[str] = None
    carrier_guess: Optional[str] = None
    span: List[int]

class ExtractionResponse(BaseModel):
    extracted_urls: List[ExtractedURL]
    extracted_phones: List[ExtractedPhone]
    urls_count: int
    phones_count: int
