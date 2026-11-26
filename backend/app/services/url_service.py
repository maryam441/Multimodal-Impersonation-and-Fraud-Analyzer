"""
URL Analysis Service implementing lexical, host, and domain reputation analysis.
"""

from typing import Dict, Any, List
from datetime import datetime, timezone
import uuid

from backend.app.services.base_analyzer import BaseModalityAnalyzer
from backend.app.schemas.modality import ModalityResultResponse, EvidenceSignal, EvidenceSpan
from backend.app.schemas.inputs import URLAnalysisRequest
from ml.src.url.feature_extractor import URLFeatureExtractor, defang_url, refang_url


class URLServiceAnalyzer(BaseModalityAnalyzer):
    """
    Analyzes URLs for phishing, brand impersonation, credential harvesting,
    and deceptive obfuscation without active web crawling.
    """
    modality_name = "url"
    model_name = "phiusiil-lexical-host-classifier"
    model_version = "1.0"

    def __init__(self):
        self.extractor = URLFeatureExtractor()

    async def run_analysis(self, case_id: str, payload: URLAnalysisRequest) -> ModalityResultResponse:
        raw_url = payload.url.strip()

        if not raw_url:
            return ModalityResultResponse(
                analysis_id=str(uuid.uuid4()),
                modality="url",
                status="insufficient_data",
                risk_score=0.0,
                risk_label="inconclusive",
                confidence=0.1,
                confidence_note="No URL provided for analysis.",
                signals=[],
                metrics={"error": "empty_url"},
                model={"name": self.model_name, "version": self.model_version},
                limitations=["No input URL provided"],
                processing_ms=1,
                created_at=datetime.now(timezone.utc)
            )

        defanged = defang_url(raw_url)
        features = self.extractor.extract_features(raw_url)

        # Base benign probability
        score = 10.0
        signals: List[EvidenceSignal] = []

        if features["is_ip_literal"]:
            score += 45.0
            signals.append(EvidenceSignal(
                code="IP_LITERAL_HOST",
                category="host_anomaly",
                description="Target hostname uses raw numerical IP address rather than legitimate registered domain.",
                evidence=features["hostname"],
                severity="critical"
            ))

        if features["has_suspicious_tld"]:
            score += 30.0
            signals.append(EvidenceSignal(
                code="SUSPICIOUS_TLD",
                category="domain_reputation",
                description=f"Domain utilizes high-risk TLD (.{features['tld']}) frequently abused in phishing campaigns.",
                evidence=f".{features['tld']}",
                severity="high"
            ))

        if features["has_at_symbol"]:
            score += 35.0
            signals.append(EvidenceSignal(
                code="CREDENTIAL_OBFUSCATION_AT_SYMBOL",
                category="uri_structure",
                description="URL authority contains '@' character commonly used to trick users and redirect to malicious hosts.",
                evidence="@ in authority",
                severity="critical"
            ))

        num_kw = len(features["matched_keywords"])
        if num_kw > 0:
            kw_weight = min(55.0, num_kw * 15.0)
            score += kw_weight
            signals.append(EvidenceSignal(
                code="DECEPTIVE_BRAND_TOKENS",
                category="brand_impersonation",
                description="URL contains deceptive financial, banking, or credential solicitation tokens in hostname or path.",
                evidence=", ".join(features["matched_keywords"]),
                severity="high" if num_kw >= 2 else "medium"
            ))

        if features["domain_entropy"] > 3.8:
            score += 20.0
            signals.append(EvidenceSignal(
                code="HIGH_DOMAIN_ENTROPY",
                category="algorithmic_generation",
                description=f"Hostname demonstrates high Shannon randomness ({features['domain_entropy']} bits), indicative of DGA.",
                evidence=f"{features['domain_entropy']} bits",
                severity="medium"
            ))

        if features["subdomain_depth"] >= 3:
            score += 20.0
            signals.append(EvidenceSignal(
                code="EXCESSIVE_SUBDOMAIN_DEPTH",
                category="structural_anomaly",
                description=f"Hostname contains {features['subdomain_depth']} nested subdomain levels.",
                evidence=features["hostname"],
                severity="medium"
            ))

        if features["num_hyphens"] >= 2:
            score += 15.0
            signals.append(EvidenceSignal(
                code="EXCESSIVE_HYPHENS",
                category="typosquatting",
                description=f"URL hostname contains {features['num_hyphens']} hyphens mimicking legitimate brand domains.",
                evidence=f"{features['num_hyphens']} hyphens",
                severity="low"
            ))

        if features["digit_ratio"] > 0.20:
            score += 15.0
            signals.append(EvidenceSignal(
                code="HIGH_DIGIT_RATIO",
                category="lexical_anomaly",
                description=f"URL composition contains unusually high proportion of numeric characters ({features['digit_ratio'] * 100:.1f}%).",
                evidence=f"{features['digit_ratio'] * 100:.1f}% digits",
                severity="low"
            ))

        if features["has_hex_encoding"]:
            score += 15.0
            signals.append(EvidenceSignal(
                code="HEX_PERCENT_ENCODING",
                category="obfuscation",
                description="URL employs hex percent-encoding to evade static regex filters.",
                evidence="% encoding",
                severity="medium"
            ))

        final_risk = min(99.0, max(2.0, score))
        confidence = round(0.78 + min(0.18, len(signals) * 0.04), 2)
        risk_label = "high" if final_risk >= 61.0 else ("medium" if final_risk >= 31.0 else "low")

        return ModalityResultResponse(
            analysis_id=str(uuid.uuid4()),
            modality="url",
            status="analyzed",
            risk_score=round(final_risk, 1),
            risk_label=risk_label,
            confidence=confidence,
            confidence_note="Offline lexical and host structure evaluation. Does not execute HTTP network crawling.",
            signals=signals,
            metrics={
                "defanged_url": defanged,
                "hostname": features["hostname"],
                "tld": features["tld"],
                "domain_entropy": features["domain_entropy"],
                "url_entropy": features["url_entropy"],
                "is_ip_literal": features["is_ip_literal"],
                "subdomain_depth": features["subdomain_depth"],
                "digit_ratio": features["digit_ratio"],
                "matched_keywords": features["matched_keywords"],
                "signal_count": len(signals)
            },
            model={"name": self.model_name, "version": self.model_version},
            limitations=[
                "Evaluates static lexical and host features only.",
                "Zero live HTTP calls made to avoid SSRF and malicious payload triggering.",
                "Newly registered brand domains with clean lexical profiles may require human investigator cross-referencing."
            ],
            processing_ms=2,
            created_at=datetime.now(timezone.utc)
        )
