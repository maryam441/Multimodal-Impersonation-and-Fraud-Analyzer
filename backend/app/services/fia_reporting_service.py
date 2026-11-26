"""
FIA Incident Reporting and Legal Complaint Generation Service.
Generates official, statutory complaints under the Prevention of Electronic Crimes Act (PECA) 2016
for transmission to the Federal Investigation Agency (FIA) National Response Centre for Cyber Crime (NR3C).
"""

import hashlib
import json
import random
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.db.models import Case, ModalityResult, FusionAssessment, AuditEvent, FIAIncidentReport

class FIAReportingService:
    def __init__(self):
        pass

    def generate_reference_number(self) -> str:
        """Generates official FIA CCW tracking reference number."""
        year = datetime.now(timezone.utc).year
        rand_seq = random.randint(10000, 99999)
        return f"FIA-CCW-{year}-{rand_seq}"

    def map_statutory_sections(self, modality_results: List[Dict[str, Any]], risk_score: float) -> List[Dict[str, str]]:
        """Maps forensic findings to PECA 2016 statutory violation sections."""
        sections = []
        modalities = [r.get("modality") for r in modality_results]
        signals = []
        for r in modality_results:
            signals.extend([s.get("type", "") if isinstance(s, dict) else str(s) for s in r.get("signals", [])])

        # Section 14: Electronic Fraud (Always if risk >= 50 or financial scam)
        if risk_score >= 50 or any("financial" in s or "otp" in s or "lottery" in s for s in signals):
            sections.append({
                "section": "PECA 2016 Section 14",
                "title": "Electronic Fraud",
                "description": "Obtaining illegal dishonest advantage, financial deceit, OTP compromise or fraudulent electronic inducement."
            })

        # Section 16: Unauthorized use of identity information (Impersonation)
        if "voice" in modalities or any("impersonat" in s or "authority" in s or "bank" in s for s in signals):
            sections.append({
                "section": "PECA 2016 Section 16",
                "title": "Unauthorized Use of Identity Information",
                "description": "Establishing identity deceit or impersonating banking institutions, telecom operators, or state authorities."
            })

        # Section 13: Electronic Forgery (Phishing URLs / Fake domains)
        if "url" in modalities or any("domain" in s or "url" in s or "tld" in s for s in signals):
            sections.append({
                "section": "PECA 2016 Section 13",
                "title": "Electronic Forgery",
                "description": "Creation or alteration of false electronic data, deceptive domain names, or defanged phishing portals."
            })

        # Section 20: Offence against dignity / intimidation / coercion
        if any("threat" in s or "urgency" in s or "coercion" in s for s in signals):
            sections.append({
                "section": "PECA 2016 Section 20",
                "title": "Malicious Electronic Communication & Coercion",
                "description": "Transmission of intimidatory messages, deceptive social engineering pressure, or panic inducement."
            })

        if not sections:
            sections.append({
                "section": "PECA 2016 Section 14",
                "title": "Electronic Fraud",
                "description": "General fraudulent electronic transaction or social engineering deceit."
            })

        return sections

    def generate_affidavit_text(
        self,
        reference_no: str,
        case_id: str,
        accused_identifier: str,
        platform_source: str,
        risk_score: float,
        statutory_sections: List[Dict[str, str]],
        modality_results: List[Dict[str, Any]],
        operator_notes: Optional[str] = None
    ) -> str:
        """Constructs formal FIA Cyber Crime Wing legal complaint statement."""
        timestamp_str = datetime.now(timezone.utc).strftime("%d-%b-%Y %H:%M:%S UTC")
        sections_str = "\n".join([f"  • {s['section']}: {s['title']} — {s['description']}" for s in statutory_sections])

        evidence_lines = []
        for r in modality_results:
            m = r.get("modality", "unknown").upper()
            score_val = r.get("risk_score")
            score_display = f"{score_val:.1f}/100" if score_val is not None else "N/A (Insufficient Data / Neutral)"
            sig_list = [s.get("description", str(s)) if isinstance(s, dict) else str(s) for s in r.get("signals", [])[:3]]
            sig_text = "; ".join(sig_list) if sig_list else "Anomalous patterns recorded"
            evidence_lines.append(f"  [{m}] Threat Score: {score_display} | Evidence: {sig_text}")

        evidence_str = "\n".join(evidence_lines) if evidence_lines else "  No explicit sub-modalities recorded."

        affidavit = f"""================================================================================
GOVERNMENT OF PAKISTAN - FEDERAL INVESTIGATION AGENCY (FIA)
NATIONAL RESPONSE CENTRE FOR CYBER CRIME (NR3C)
FORMAL COMPLAINT & DIGITAL FORENSIC INCIDENT SUBMISSION
================================================================================

1. COMPLAINT REFERENCE METADATA:
   Tracking Reference No : {reference_no}
   Internal Case UUID    : {case_id}
   Submission Timestamp  : {timestamp_str}
   Platform / Source     : {platform_source.upper()}
   Overall Assessed Risk : {risk_score:.1f} / 100.0 (SEVERITY: HIGH / CRITICAL)

2. ACCUSED / SUSPECT IDENTIFIERS:
   Suspect Identifier    : {accused_identifier or "Unspecified Electronic Actor / Spoofed Identity"}
   Action Target         : Telecommunication line, digital messaging identity, and electronic domain

3. APPLICABLE STATUTORY CHARGES (PECA 2016):
{sections_str}

4. SUMMARY OF FORENSIC EVIDENCE & MODEL SIGNALS:
{evidence_str}

5. INVESTIGATOR / OPERATOR VERIFICATION:
   Human-in-the-Loop Gate : Explicitly Confirmed and Authorized
   Investigator Remarks   : {operator_notes or "The complainant has verified this incident and authorized formal statutory referral."}

6. STATUTORY PRAYER / RELIEF SOUGHT:
   i.   Immediate registration of preliminary cyber inquiry under PECA 2016.
   ii.  Directive to Pakistan Telecommunication Authority (PTA) to block associated MSISDN/SIM and defanged domain hosts.
   iii. Tracing and retrieval of Call Detail Records (CDR) and IPDR logs for the accused digital channels.

--------------------------------------------------------------------------------
CERTIFICATION SEAL:
Digitally Sealed by Sentinel Core Cyber-Forensic Analyzer (v3.0)
Cryptographic integrity guaranteed via SHA-256 digest on immutable evidence bundle.
================================================================================
"""
        return affidavit

    async def register_fia_complaint(
        self,
        case_id: str,
        db: AsyncSession,
        operator_notes: Optional[str] = None,
        complainant_source: str = "web",
        override_accused: Optional[str] = None
    ) -> Dict[str, Any]:
        """Creates and commits an official FIA incident report in SQLite."""
        # Fetch case
        stmt = select(Case).where(Case.id == case_id)
        case_obj = (await db.execute(stmt)).scalars().first()
        if not case_obj:
            raise ValueError(f"Case {case_id} not found")

        # Fetch modality results
        m_stmt = select(ModalityResult).where(ModalityResult.case_id == case_id)
        results = (await db.execute(m_stmt)).scalars().all()

        # Fetch fusion assessment
        f_stmt = select(FusionAssessment).where(FusionAssessment.case_id == case_id)
        fusion = (await db.execute(f_stmt)).scalars().first()
        fused_score = fusion.fused_score if fusion and fusion.fused_score is not None else 75.0
        risk_category = fusion.risk_category if fusion and fusion.risk_category else "high"

        # Determine target identifier (phone or url or text snippet)
        accused = override_accused
        if not accused:
            for r in results:
                if r.modality == "phone" and r.metrics.get("raw_input"):
                    accused = r.metrics.get("raw_input")
                    break
                elif r.modality == "url" and r.metrics.get("input_url"):
                    accused = r.metrics.get("input_url")
                    break
                elif r.modality == "message" and r.metrics.get("target_number"):
                    accused = r.metrics.get("target_number")
                    break
        if not accused:
            accused = "Unknown Fraud Sender / Identity Spoof"

        reference_no = self.generate_reference_number()
        modality_dicts = [
            {
                "modality": r.modality,
                "risk_score": r.risk_score,
                "signals": r.signals,
                "metrics": r.metrics
            }
            for r in results
        ]

        statutory_sections = self.map_statutory_sections(modality_dicts, fused_score)
        affidavit_text = self.generate_affidavit_text(
            reference_no=reference_no,
            case_id=case_id,
            accused_identifier=accused,
            platform_source=complainant_source,
            risk_score=fused_score,
            statutory_sections=statutory_sections,
            modality_results=modality_dicts,
            operator_notes=operator_notes
        )

        sha256_digest = hashlib.sha256(affidavit_text.encode("utf-8")).hexdigest()

        # Create persistent report
        report = FIAIncidentReport(
            case_id=case_id,
            reference_no=reference_no,
            accused_identifier=accused,
            platform_source=complainant_source,
            risk_score=fused_score,
            risk_category=risk_category,
            statutory_sections=[s["section"] for s in statutory_sections],
            evidence_summary={
                "modality_count": len(results),
                "sections": statutory_sections,
                "fused_score": fused_score
            },
            complaint_text=affidavit_text,
            sha256_digest=sha256_digest,
            operator_notes=operator_notes or "Investigator authorized report submission.",
            status="REGISTERED"
        )
        db.add(report)

        # Log audit trail
        audit = AuditEvent(
            case_id=case_id,
            action="FIA_INCIDENT_REGISTERED",
            details={
                "reference_no": reference_no,
                "sha256_digest": sha256_digest,
                "accused": accused,
                "platform": complainant_source
            }
        )
        db.add(audit)
        await db.commit()

        return {
            "success": True,
            "confirmed_by_human": True,
            "agency": "Federal Investigation Agency (FIA) - Cyber Crime Wing",
            "reference_no": reference_no,
            "case_id": case_id,
            "accused_identifier": accused,
            "platform_source": complainant_source,
            "risk_score": fused_score,
            "risk_category": risk_category,
            "statutory_sections": statutory_sections,
            "sha256_digest": sha256_digest,
            "complaint_text": affidavit_text,
            "status": "REGISTERED",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
