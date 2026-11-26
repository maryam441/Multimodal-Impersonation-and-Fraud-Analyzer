import re

def normalize_text(text: str) -> str:
    """Normalize text for Roman Urdu and English fraud classification."""
    # Mask URLs
    t = re.sub(r'https?://\S+|www\.\S+', ' <URL> ', text, flags=re.IGNORECASE)
    # Mask Phone Numbers
    t = re.sub(r'(?:\+?92\s*|0)?3\d{2}[\s-]?\d{7}', ' <PHONE> ', t)
    # Mask large amounts / numeric values
    t = re.sub(r'\b\d{4,}\b', ' <NUM> ', t)
    # Normalize whitespaces
    t = re.sub(r'\s+', ' ', t).strip()
    return t
