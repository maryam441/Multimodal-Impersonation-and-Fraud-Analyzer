"""
Phone number normalization, E.164 standardization, and PTA carrier resolution.
"""

import re
from typing import Dict, Any, Optional

PAKISTAN_MOBILE_PREFIXES = {
    "0300": "Jazz (Mobilink)", "0301": "Jazz (Mobilink)", "0302": "Jazz (Mobilink)",
    "0303": "Jazz (Mobilink)", "0304": "Jazz (Mobilink)", "0305": "Jazz (Mobilink)",
    "0306": "Jazz (Mobilink)", "0307": "Jazz (Mobilink)", "0308": "Jazz (Mobilink)",
    "0309": "Jazz (Mobilink)", "0320": "Jazz (Warid)", "0321": "Jazz (Warid)",
    "0322": "Jazz (Warid)", "0323": "Jazz (Warid)", "0324": "Jazz (Warid)",
    "0325": "Jazz (Warid)", "0310": "Zong (CMPak)", "0311": "Zong (CMPak)",
    "0312": "Zong (CMPak)", "0313": "Zong (CMPak)", "0314": "Zong (CMPak)",
    "0315": "Zong (CMPak)", "0316": "Zong (CMPak)", "0317": "Zong (CMPak)",
    "0318": "Zong (CMPak)", "0330": "Ufone (PTCL)", "0331": "Ufone (PTCL)",
    "0332": "Ufone (PTCL)", "0333": "Ufone (PTCL)", "0334": "Ufone (PTCL)",
    "0335": "Ufone (PTCL)", "0336": "Ufone (PTCL)", "0337": "Ufone (PTCL)",
    "0340": "Telenor Pakistan", "0341": "Telenor Pakistan", "0342": "Telenor Pakistan",
    "0343": "Telenor Pakistan", "0344": "Telenor Pakistan", "0345": "Telenor Pakistan",
    "0346": "Telenor Pakistan", "0347": "Telenor Pakistan", "0348": "Telenor Pakistan",
    "0349": "Telenor Pakistan", "0355": "SCOM (Special Communications Organization)",
}

PAKISTAN_LANDLINE_AREA_CODES = {
    "021": "Karachi", "042": "Lahore", "051": "Islamabad / Rawalpindi",
    "091": "Peshawar", "081": "Quetta", "061": "Multan", "041": "Faisalabad",
    "055": "Gujranwala", "053": "Gujrat", "052": "Sialkot", "022": "Hyderabad"
}


def normalize_phone_number(raw_phone: str, default_country: str = "PK") -> Dict[str, Any]:
    """
    Standardizes phone numbers to E.164 format and resolves carrier / line-type heuristics.
    """
    cleaned = re.sub(r"[\s\-\(\)\.]", "", raw_phone)
    if not cleaned:
        return {
            "valid": False,
            "raw": raw_phone,
            "e164": None,
            "local_format": None,
            "country": default_country,
            "carrier": "Unknown",
            "line_type": "unknown",
            "region": "Unknown"
        }

    # Handle shortcodes (4-5 digits)
    if len(cleaned) in [4, 5] and cleaned.isdigit():
        return {
            "valid": True,
            "raw": raw_phone,
            "e164": cleaned,
            "local_format": cleaned,
            "country": "PK",
            "carrier": "PTA Shortcode Gateway",
            "line_type": "shortcode",
            "region": "National"
        }

    # Normalize international prefix
    if cleaned.startswith("00"):
        cleaned = "+" + cleaned[2:]
    elif not cleaned.startswith("+"):
        if cleaned.startswith("92") and len(cleaned) in [12, 13]:
            cleaned = "+" + cleaned
        elif cleaned.startswith("03") and len(cleaned) == 11:
            cleaned = "+92" + cleaned[1:]
        elif cleaned.startswith("0") and len(cleaned) in [10, 11]:
            cleaned = "+92" + cleaned[1:]

    # Check for Pakistani E.164 (+92...)
    if cleaned.startswith("+92"):
        national_digits = cleaned[3:]
        local_with_zero = "0" + national_digits

        # Check mobile (03xx)
        if len(local_with_zero) == 11 and local_with_zero.startswith("03"):
            prefix = local_with_zero[:4]
            carrier = PAKISTAN_MOBILE_PREFIXES.get(prefix, "Pakistani Mobile Operator")
            return {
                "valid": True,
                "raw": raw_phone,
                "e164": cleaned,
                "local_format": f"{local_with_zero[:4]}-{local_with_zero[4:]}",
                "country": "PK",
                "carrier": carrier,
                "line_type": "mobile",
                "region": "Pakistan National"
            }

        # Check landline (021, 042, etc.)
        for code, city in PAKISTAN_LANDLINE_AREA_CODES.items():
            if local_with_zero.startswith(code):
                return {
                    "valid": True,
                    "raw": raw_phone,
                    "e164": cleaned,
                    "local_format": f"{code}-{local_with_zero[len(code):]}",
                    "country": "PK",
                    "carrier": "PTCL / Landline",
                    "line_type": "fixed_line",
                    "region": city
                }

        # Toll-free / Premium
        if local_with_zero.startswith("0800"):
            return {
                "valid": True,
                "raw": raw_phone,
                "e164": cleaned,
                "local_format": local_with_zero,
                "country": "PK",
                "carrier": "Toll-Free National Service",
                "line_type": "toll_free",
                "region": "Pakistan National"
            }
        elif local_with_zero.startswith("0900"):
            return {
                "valid": True,
                "raw": raw_phone,
                "e164": cleaned,
                "local_format": local_with_zero,
                "country": "PK",
                "carrier": "Premium Rate Telecom Service",
                "line_type": "premium_rate",
                "region": "Pakistan National"
            }

        return {
            "valid": True,
            "raw": raw_phone,
            "e164": cleaned,
            "local_format": local_with_zero,
            "country": "PK",
            "carrier": "Pakistani Fixed / Virtual",
            "line_type": "voip_or_virtual",
            "region": "Pakistan"
        }

    # International number general normalization
    return {
        "valid": bool(re.match(r"^\+[1-9]\d{6,14}$", cleaned)),
        "raw": raw_phone,
        "e164": cleaned if cleaned.startswith("+") else ("+" + cleaned),
        "local_format": cleaned,
        "country": "International",
        "carrier": "International Operator",
        "line_type": "international",
        "region": "Global"
    }
