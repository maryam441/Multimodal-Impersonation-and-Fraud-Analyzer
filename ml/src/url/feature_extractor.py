"""
Lexical and host feature extractor for URL analysis.
Aligned with the PhiUSIIL Phishing URL Dataset benchmark.
"""

import math
import re
from typing import Dict, Any, List
from urllib.parse import urlparse


SUSPICIOUS_TLDS = {
    "xyz", "top", "tk", "ml", "ga", "cf", "gq", "buzz", "club",
    "work", "icu", "loan", "vip", "live", "support", "online",
    "site", "website", "racing", "kim", "country", "science"
}

FINANCIAL_AND_BRAND_KEYWORDS = {
    "easypaisa", "jazzcash", "hbl", "ubl", "mcb", "meezan", "alfalah",
    "allied", "bank", "banking", "ebank", "login", "signin", "verify", "verification",
    "update", "security", "secure", "account", "wallet", "otp", "pin",
    "password", "bonus", "prize", "lottery", "ehsaas", "bisp", "fbr",
    "nadra", "pakistan", "reward", "claim", "free", "urgent", "phish",
    "phishing", "fake", "alert", "auth", "portal", "confirm"
}

IP_REGEX = re.compile(r"^(\d{1,3}\.){3}\d{1,3}$")


def defang_url(raw_url: str) -> str:
    """Safely defangs a URL to prevent accidental clicks or client auto-linking."""
    defanged = raw_url.strip()
    defanged = re.sub(r"^https?://", lambda m: "hxxps://" if "https" in m.group(0) else "hxxp://", defanged, flags=re.I)
    if not (defanged.startswith("hxxp://") or defanged.startswith("hxxps://")):
        defanged = "hxxp://" + defanged
    defanged = defanged.replace(".", "[.]")
    return defanged


def refang_url(defanged_url: str) -> str:
    """Normalizes a defanged URL back into a standard URL for feature extraction."""
    normalized = defanged_url.strip()
    normalized = re.sub(r"^hxxps://", "https://", normalized, flags=re.I)
    normalized = re.sub(r"^hxxp://", "http://", normalized, flags=re.I)
    normalized = normalized.replace("[.]", ".")
    if not (normalized.startswith("http://") or normalized.startswith("https://")):
        normalized = "http://" + normalized
    return normalized


def calculate_shannon_entropy(text: str) -> float:
    """Calculates Shannon entropy in bits for the input string."""
    if not text:
        return 0.0
    entropy = 0.0
    length = len(text)
    char_counts = {}
    for char in text:
        char_counts[char] = char_counts.get(char, 0) + 1
    for count in char_counts.values():
        p = count / length
        entropy -= p * math.log2(p)
    return round(entropy, 4)


class URLFeatureExtractor:
    """Extracts 24+ lexical, host, and behavioral security features from a URL."""

    def extract_features(self, raw_url: str) -> Dict[str, Any]:
        refanged = refang_url(raw_url)
        parsed = urlparse(refanged)

        hostname = (parsed.hostname or "").lower()
        path = parsed.path or ""
        query = parsed.query or ""
        full_url = refanged.lower()

        # Basic lengths
        url_len = len(full_url)
        host_len = len(hostname)
        path_len = len(path)
        query_len = len(query)

        # Character counts
        num_dots = full_url.count(".")
        num_hyphens = full_url.count("-")
        num_slashes = full_url.count("/")
        num_question = full_url.count("?")
        num_equals = full_url.count("=")
        num_at = full_url.count("@")
        num_percent = full_url.count("%")
        num_digits = sum(c.isdigit() for c in full_url)
        num_letters = sum(c.isalpha() for c in full_url)

        digit_ratio = round(num_digits / max(1, url_len), 4)

        # Entropies
        url_entropy = calculate_shannon_entropy(full_url)
        domain_entropy = calculate_shannon_entropy(hostname)

        # Host checks
        is_ip_literal = bool(IP_REGEX.match(hostname))
        
        # Subdomains and TLD
        host_parts = hostname.split(".") if hostname else []
        tld = host_parts[-1] if host_parts else ""
        subdomain_depth = max(0, len(host_parts) - 2)

        has_suspicious_tld = tld in SUSPICIOUS_TLDS

        # Keywords search in domain and path
        matched_keywords = []
        for kw in FINANCIAL_AND_BRAND_KEYWORDS:
            if kw in hostname or kw in path:
                matched_keywords.append(kw)

        # Obfuscation checks
        has_at_symbol = num_at > 0
        has_hex_encoding = num_percent > 0

        return {
            "url_len": url_len,
            "host_len": host_len,
            "path_len": path_len,
            "query_len": query_len,
            "num_dots": num_dots,
            "num_hyphens": num_hyphens,
            "num_slashes": num_slashes,
            "num_digits": num_digits,
            "digit_ratio": digit_ratio,
            "url_entropy": url_entropy,
            "domain_entropy": domain_entropy,
            "is_ip_literal": is_ip_literal,
            "hostname": hostname,
            "tld": tld,
            "subdomain_depth": subdomain_depth,
            "has_suspicious_tld": has_suspicious_tld,
            "matched_keywords": matched_keywords,
            "has_at_symbol": has_at_symbol,
            "has_hex_encoding": has_hex_encoding,
        }
