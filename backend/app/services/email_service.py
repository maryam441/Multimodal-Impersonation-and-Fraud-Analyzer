"""
Email Header & Phishing Body Analyzer Service (6th Modality).
Evaluates RFC header authenticity (SPF, DKIM, DMARC), display-name spoofing,
embedded deceptive hyperlinks, and coercive social engineering pretexts.
"""

import re
import time
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from backend.app.services.base_analyzer import BaseModalityAnalyzer
from backend.app.schemas.modality import ModalityResultResponse, EvidenceSignal, EvidenceSpan
from backend.app.schemas.inputs import EmailAnalysisRequest
from backend.app.services.extractor import extract_entities, defang_url

TRUSTED_BRAND_KEYWORDS = [
    ("state bank", "sbp.org.pk"),
    ("hbl", "hbl.com"),
    ("meezan", "meezanbank.com"),
    ("bank alfalah", "bankalfalah.com"),
    ("ubl", "ubldigital.com"),
    ("mcb", "mcb.com.pk"),
    ("easypaisa", "easypaisa.com.pk"),
    ("jazzcash", "jazzcash.com.pk"),
    ("fia", "fia.gov.pk"),
    ("pta", "pta.gov.pk"),
    ("fbr", "fbr.gov.pk"),
    ("nadra", "nadra.gov.pk"),
    ("google", "google.com"),
    ("microsoft", "microsoft.com"),
    ("apple", "apple.com"),
    ("paypal", "paypal.com"),
    ("binance", "binance.com")
]

FREE_MAIL_PROVIDERS = [
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "proton.me", "protonmail.com"
]

EMAIL_URGENCY_PATTERNS = [
    (r'\b(?:suspended|blocked|frozen|deactivated|terminated|closed)\b', 'ACCOUNT_SUSPENSION_PRETEXT', 'Threatens immediate service or account suspension to induce panic.', 'critical'),
    (r'\b(?:court|arrest|police|fir|warrant|legal notice|subpoena|investigation)\b', 'LEGAL_THREAT_COERCION', 'Claims pending criminal arrest or court warrant to compel compliance.', 'critical'),
    (r'\b(?:urgent|immediately|within 24 hours|within 12 hours|right now|action required|final warning)\b', 'ARTIFICIAL_URGENCY', 'Imposes strict artificial deadline to bypass rational verification.', 'high'),
    (r'\b(?:invoice|payment overdue|wire transfer|remittance|crypto|tax penalty)\b', 'FINANCIAL_SOLICITATION', 'Demands urgent settlement of fraudulent invoice or financial transfer.', 'high'),
    (r'\b(?:password expired|reset credentials|verify identity|confirm otp|security update)\b', 'CREDENTIAL_HARVESTING_PRETEXT', 'Pretext directing recipient to enter sensitive authentication credentials.', 'critical'),
]


class EmailServiceAnalyzer(BaseModalityAnalyzer):
    modality_name = "email"
    model_name = "rfc-header-phishing-body-classifier"
    model_version = "1.0"

    def parse_sender(self, raw_sender: str) -> Dict[str, str]:
        """Parses 'Display Name <user@domain.com>' or raw email."""
        match = re.match(r'^(.*?)\s*<([^>]+)>$', raw_sender.strip())
        if match:
            display_name = match.group(1).strip().strip('"\'')
            email_addr = match.group(2).strip().lower()
        else:
            display_name = ""
            email_addr = raw_sender.strip().lower()

        domain = email_addr.split("@")[-1] if "@" in email_addr else ""
        return {
            "display_name": display_name,
            "email_address": email_addr,
            "domain": domain
        }

    async def run_analysis(self, case_id: str, payload: EmailAnalysisRequest) -> ModalityResultResponse:
        start_time = time.time()
        signals: List[EvidenceSignal] = []
        metrics: Dict[str, Any] = {}
        base_score = 10.0

        sender_info = self.parse_sender(payload.sender)
        display_name = sender_info["display_name"].lower()
        sender_domain = sender_info["domain"].lower()

        metrics["sender_display_name"] = sender_info["display_name"]
        metrics["sender_email"] = sender_info["email_address"]
        metrics["sender_domain"] = sender_domain

        # 1. Display-Name Impersonation & Spoofing Check
        is_spoofed_brand = False
        for brand, official_domain in TRUSTED_BRAND_KEYWORDS:
            if brand in display_name:
                if official_domain not in sender_domain:
                    is_spoofed_brand = True
                    base_score += 40.0
                    signals.append(EvidenceSignal(
                        code="DISPLAY_NAME_BRAND_SPOOF",
                        category="Impersonation",
                        description=f"Sender display name mimics '{brand.upper()}' but email domain is '{sender_domain}', not official '{official_domain}'.",
                        evidence=f"Display: '{sender_info['display_name']}' vs Domain: '{sender_domain}'",
                        severity="critical"
                    ))
                    break

        # Check if trusted institution from free webmail
        if any(brand in display_name for brand, _ in TRUSTED_BRAND_KEYWORDS) and sender_domain in FREE_MAIL_PROVIDERS:
            base_score += 25.0
            signals.append(EvidenceSignal(
                code="FREE_WEBMAIL_INSTITUTION_SPOOF",
                category="Header Analysis",
                description=f"Institutional identity claimed from public free webmail provider ({sender_domain}).",
                evidence=f"Sender domain is generic '{sender_domain}'",
                severity="high"
            ))

        # 2. Header Authentication Verification (SPF, DKIM, DMARC)
        headers = payload.headers or {}
        spf = headers.get("spf", headers.get("Received-SPF", "")).lower()
        dkim = headers.get("dkim", "").lower()
        dmarc = headers.get("dmarc", "").lower()

        metrics["auth_headers"] = {"spf": spf or "none", "dkim": dkim or "none", "dmarc": dmarc or "none"}

        if "fail" in spf:
            base_score += 25.0
            signals.append(EvidenceSignal(
                code="SPF_AUTHENTICATION_FAILED",
                category="Header Security",
                description="SPF record check failed. The sending server is not authorized to send mail for this domain.",
                evidence=f"SPF header: {spf}",
                severity="high"
            ))
        if "fail" in dkim:
            base_score += 20.0
            signals.append(EvidenceSignal(
                code="DKIM_SIGNATURE_INVALID",
                category="Header Security",
                description="DKIM cryptographic signature verification failed or is mismatched.",
                evidence=f"DKIM header: {dkim}",
                severity="medium"
            ))
        if "fail" in dmarc or "reject" in dmarc:
            base_score += 25.0
            signals.append(EvidenceSignal(
                code="DMARC_POLICY_REJECT",
                category="Header Security",
                description="DMARC policy failed alignment. The email envelope sender is deceptive.",
                evidence=f"DMARC header: {dmarc}",
                severity="high"
            ))

        # 3. Content Phishing & Urgency Scan (Subject + Body)
        full_text = f"{payload.subject}\n{payload.body}".lower()
        detected_tactics = []

        for pattern, code, desc, severity in EMAIL_URGENCY_PATTERNS:
            matches = list(re.finditer(pattern, full_text, re.IGNORECASE))
            if matches:
                detected_tactics.append(code)
                weight = 30.0 if severity == "critical" else 18.0
                base_score += weight
                matched_snippet = matches[0].group(0)
                signals.append(EvidenceSignal(
                    code=code,
                    category="Social Engineering",
                    description=desc,
                    evidence=f"Matched term: '{matched_snippet}'",
                    severity=severity
                ))

        metrics["tactics_detected"] = detected_tactics

        # 4. Embedded URL Extraction & Defanging
        extracted = extract_entities(payload.body)
        metrics["embedded_urls_count"] = len(extracted.extracted_urls)
        metrics["extracted_urls"] = [u.defanged_url for u in extracted.extracted_urls]

        if extracted.extracted_urls:
            base_score += 15.0
            signals.append(EvidenceSignal(
                code="EMBEDDED_HYPERLINKS_DETECTED",
                category="Link Inspection",
                description=f"Email contains {len(extracted.extracted_urls)} embedded hyperlinks requiring inspection.",
                evidence=f"Top link: {extracted.extracted_urls[0].defanged_url}",
                severity="medium"
            ))

        # Final Score Calibration
        final_score = round(min(100.0, max(5.0, base_score)), 1)
        risk_label = "high" if final_score >= 61.0 else ("medium" if final_score >= 31.0 else "low")
        confidence = 0.92 if signals else 0.85

        processing_ms = int((time.time() - start_time) * 1000)

        return ModalityResultResponse(
            analysis_id=f"email-{case_id[:8]}",
            modality="email",
            status="analyzed",
            risk_score=final_score,
            risk_label=risk_label,
            confidence=confidence,
            signals=signals,
            metrics=metrics,
            model={
                "name": self.model_name,
                "version": self.model_version,
                "architecture": "Static RFC Header Alignment & Lexical Phishing Classifier"
            },
            limitations=[
                "Static email evaluation only; does not execute attachments or dynamic sandbox payloads.",
                "Simulated SPF/DKIM headers are used when raw SMTP envelope transmission data is absent."
            ],
            processing_ms=processing_ms,
            created_at=datetime.now(timezone.utc)
        )
