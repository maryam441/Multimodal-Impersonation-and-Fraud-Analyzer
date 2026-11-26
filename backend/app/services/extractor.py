import re
from typing import List
try:
    import phonenumbers
    HAVE_PHONENUMBERS = True
except ImportError:
    phonenumbers = None
    HAVE_PHONENUMBERS = False
from backend.app.schemas.extract import ExtractedURL, ExtractedPhone, ExtractionResponse

URL_REGEX = re.compile(
    r'(?:(?:https?|ftp|hxxps?):\/\/|www\.)[^\s/$.?#].[^\s]*|'
    r'\b(?:[a-zA-Z0-9-]+\.)+(?:com|org|net|pk|edu|gov|io|xyz|info|top|cc|me|app|live|site|biz|link|tk|ga|ml|cf|gq)\b(?:\/[^\s]*)?',
    re.IGNORECASE
)

# Common Pakistani telecom prefixes: 0300, 0301, 0312, 0321, 0333, 0345, etc.
PHONE_REGEX = re.compile(
    r'(?:\+?92\s*|0)?3[0-4]\d[\s-]?\d{7}\b|'
    r'\b(?:\+?1[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b',
    re.IGNORECASE
)

def defang_url(url: str) -> str:
    """Transform live URL into safe non-clickable defanged format (hxxp / [.])"""
    clean = re.sub(r'^http', 'hxxp', url, flags=re.IGNORECASE)
    clean = clean.replace('.', '[.]')
    return clean

def extract_entities(text: str) -> ExtractionResponse:
    urls: List[ExtractedURL] = []
    phones: List[ExtractedPhone] = []

    # 1. URL Extraction
    for match in URL_REGEX.finditer(text):
        raw = match.group(0).rstrip('.,;!?:)')
        start, end = match.start(), match.start() + len(raw)
        
        # Extract host/domain
        domain_match = re.search(r'(?:https?:\/\/|hxxps?:\/\/)?(?:www\.)?([^\/\s:]+)', raw, re.IGNORECASE)
        domain = domain_match.group(1) if domain_match else raw

        urls.append(ExtractedURL(
            raw_url=raw,
            defanged_url=defang_url(raw),
            domain=domain,
            span=[start, end]
        ))

    # 2. Phone Extraction
    for match in PHONE_REGEX.finditer(text):
        raw = match.group(0).strip()
        start, end = match.start(), match.end()
        e164 = None
        carrier_guess = None
        region = None

        if HAVE_PHONENUMBERS and phonenumbers:
            try:
                parsed = phonenumbers.parse(raw, "PK")
                if phonenumbers.is_valid_number(parsed) or phonenumbers.is_possible_number(parsed):
                    e164 = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
                    region = phonenumbers.region_code_for_number(parsed)
            except Exception:
                pass

        # Pakistani Carrier Heuristic for +92 3XX
        if raw.startswith("03") or "923" in raw:
            digits = re.sub(r'\D', '', raw)
            if digits.startswith("92"):
                prefix = digits[2:4]
            elif digits.startswith("03"):
                prefix = digits[1:3]
            else:
                prefix = digits[:2]

            carrier_map = {
                "30": "Jazz / Mobilink",
                "31": "Zong",
                "32": "Warid",
                "33": "Ufone",
                "34": "Telenor",
                "35": "Special / SCOM"
            }
            carrier_guess = carrier_map.get(prefix, "Pakistani Mobile Carrier")

        phones.append(ExtractedPhone(
            raw_number=raw,
            normalized_e164=e164,
            country_code=region or "PK",
            carrier_guess=carrier_guess,
            span=[start, end]
        ))

    return ExtractionResponse(
        extracted_urls=urls,
        extracted_phones=phones,
        urls_count=len(urls),
        phones_count=len(phones)
    )
