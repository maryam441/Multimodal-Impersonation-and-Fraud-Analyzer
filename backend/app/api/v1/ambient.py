"""
Ambient Real-Time Threat Scanning Router.
Provides ultra-low-latency real-time threat scanning for browser extensions (WhatsApp Web, Gmail, Chrome/Edge)
and desktop background watchers with instant threat classification and FIA reporting readiness.
"""

from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.db.session import get_db
from backend.app.db.models import Case, ModalityResult, FusionAssessment, AmbientScanLog
from backend.app.services.extractor import extract_entities
from backend.app.services.message_service import MessageServiceAnalyzer
from backend.app.services.conversation_service import ConversationServiceAnalyzer
from backend.app.services.url_service import URLServiceAnalyzer
from backend.app.services.phone_service import PhoneServiceAnalyzer
from backend.app.schemas.inputs import MessageAnalysisRequest, ConversationAnalysisRequest, URLAnalysisRequest, PhoneAnalysisRequest
from backend.app.services.fusion_service import FusionEngine, ModalityScoreInput

router = APIRouter(tags=["Ambient Protection"])

message_analyzer = MessageServiceAnalyzer()
conversation_analyzer = ConversationServiceAnalyzer()
url_analyzer = URLServiceAnalyzer()
phone_analyzer = PhoneServiceAnalyzer()
fusion_engine = FusionEngine()


class AmbientScanRequest(BaseModel):
    content: str = Field(..., description="Text content (chat message, email, clipboard, or page snippet)")
    source: str = Field("ambient", description="Source of content: 'whatsapp', 'gmail', 'web', 'sms', 'clipboard'")
    sender: Optional[str] = Field(None, description="Sender name, email, or phone number if available")
    url: Optional[str] = Field(None, description="Explicit URL if available")
    phone: Optional[str] = Field(None, description="Explicit phone number if available")


@router.post("/ambient/scan")
async def scan_ambient_content(payload: AmbientScanRequest, db: AsyncSession = Depends(get_db)):
    """
    Scans incoming text/message in real time from WhatsApp Web, Gmail, or system clipboard.
    Returns instant threat verdict, risk score, detected scam tags, and quick FIA action readiness.
    """
    content = payload.content.strip()
    if not content and not payload.url and not payload.phone:
        raise HTTPException(status_code=400, detail="Empty content payload provided for ambient scan")

    # Smart entity extraction
    extracted = extract_entities(content)
    detected_urls = payload.url.split() if payload.url else [u.raw_url for u in extracted.extracted_urls]
    detected_phones = [payload.phone] if payload.phone else [p.raw_number for p in extracted.extracted_phones]

    # Create tracked Case in DB
    now = datetime.now(timezone.utc)
    case_obj = Case(
        client_token="ambient-shield-token",
        status="processing",
        expires_at=now + timedelta(days=7)
    )
    db.add(case_obj)
    await db.flush()
    case_id = case_obj.id

    modality_inputs: List[ModalityScoreInput] = []
    modality_records: List[ModalityResult] = []
    threat_tags: List[str] = []

    # 1. Message Modality Analysis
    if content:
        msg_resp = await message_analyzer.run_analysis(case_id, MessageAnalysisRequest(text=content))
        msg_score = msg_resp.risk_score or 0.0
        msg_signals = [s.model_dump() for s in msg_resp.signals]
        for sig in msg_resp.signals:
            if sig.description:
                threat_tags.append(sig.description)

        modality_inputs.append(
            ModalityScoreInput(
                modality="message",
                status="analyzed",
                risk_score=msg_score,
                confidence=msg_resp.confidence or 0.9,
                is_extracted_from_text=False
            )
        )
        modality_records.append(
            ModalityResult(
                case_id=case_id,
                modality="message",
                status="analyzed",
                risk_score=msg_score,
                confidence=msg_resp.confidence or 0.9,
                signals=msg_signals,
                metrics=msg_resp.metrics
            )
        )

    # 2. Conversation Check if multi-line
    if "\n" in content or "]: " in content or " - " in content:
        conv_resp = await conversation_analyzer.run_analysis(case_id, ConversationAnalysisRequest(raw_text=content))
        conv_score = conv_resp.risk_score or 0.0
        conv_signals = [s.model_dump() for s in conv_resp.signals]
        for sig in conv_resp.signals:
            if sig.description:
                threat_tags.append(sig.description)

        modality_inputs.append(
            ModalityScoreInput(
                modality="conversation",
                status="analyzed",
                risk_score=conv_score,
                confidence=conv_resp.confidence or 0.85,
                is_extracted_from_text=False
            )
        )
        modality_records.append(
            ModalityResult(
                case_id=case_id,
                modality="conversation",
                status="analyzed",
                risk_score=conv_score,
                confidence=conv_resp.confidence or 0.85,
                signals=conv_signals,
                metrics=conv_resp.metrics
            )
        )

    # 3. URL Modality if present
    target_url = detected_urls[0] if detected_urls else None
    if target_url:
        url_resp = await url_analyzer.run_analysis(case_id, URLAnalysisRequest(url=target_url))
        url_score = url_resp.risk_score or 0.0
        url_signals = [s.model_dump() for s in url_resp.signals]
        for sig in url_resp.signals:
            if sig.description:
                threat_tags.append(sig.description)

        modality_inputs.append(
            ModalityScoreInput(
                modality="url",
                status="analyzed",
                risk_score=url_score,
                confidence=url_resp.confidence or 0.92,
                is_extracted_from_text=True
            )
        )
        modality_records.append(
            ModalityResult(
                case_id=case_id,
                modality="url",
                status="analyzed",
                risk_score=url_score,
                confidence=url_resp.confidence or 0.92,
                signals=url_signals,
                metrics=url_resp.metrics
            )
        )

    # 4. Phone Modality if present
    target_phone = detected_phones[0] if detected_phones else payload.sender if (payload.sender and any(c.isdigit() for c in payload.sender)) else None
    if target_phone:
        phone_resp = await phone_analyzer.run_analysis(case_id, PhoneAnalysisRequest(phone_number=target_phone))
        phone_score = phone_resp.risk_score
        phone_signals = [s.model_dump() for s in phone_resp.signals]

        modality_inputs.append(
            ModalityScoreInput(
                modality="phone",
                status=phone_resp.status,
                risk_score=phone_score,
                confidence=phone_resp.confidence,
                is_extracted_from_text=True
            )
        )
        modality_records.append(
            ModalityResult(
                case_id=case_id,
                modality="phone",
                status=phone_resp.status,
                risk_score=phone_score,
                confidence=phone_resp.confidence,
                signals=phone_signals,
                metrics=phone_resp.metrics
            )
        )

    # Add results to DB
    for rec in modality_records:
        db.add(rec)

    # Weighted Late Fusion
    fusion_assessment = fusion_engine.evaluate_fusion(modality_inputs)
    fused_score = fusion_assessment.get("fused_score") or 0.0
    risk_category = fusion_assessment.get("risk_category") or "low"

    # Persist fusion assessment
    db_fusion = FusionAssessment(
        case_id=case_id,
        fused_score=fused_score,
        risk_category=risk_category,
        active_modalities=fusion_assessment.get("active_modalities", []),
        missing_modalities=fusion_assessment.get("missing_modalities", []),
        weights_applied=fusion_assessment.get("weights_applied", {}),
        rationale=fusion_assessment.get("rationale", "")
    )
    db.add(db_fusion)

    case_obj.status = "completed"

    is_threat = fused_score >= 60.0 or any("scam" in t.lower() or "bank" in t.lower() or "otp" in t.lower() for t in threat_tags)
    clean_tags = list(dict.fromkeys(threat_tags))[:5]

    # Save to AmbientScanLog
    scan_log = AmbientScanLog(
        case_id=case_id,
        source=payload.source,
        sender_info=payload.sender or target_phone or "Unknown",
        preview_snippet=(content[:160] + "...") if len(content) > 160 else content,
        risk_score=fused_score,
        is_threat=is_threat,
        threat_tags=clean_tags,
        target_phone=target_phone,
        target_url=target_url
    )
    db.add(scan_log)
    await db.commit()

    # Formulate instant action recommendation
    recommended_action = "ALLOW"
    if fused_score >= 60.0:
        recommended_action = "REPORT_FIA"
    elif fused_score >= 31.0:
        recommended_action = "WARN"

    return {
        "case_id": case_id,
        "is_threat": is_threat,
        "risk_score": round(fused_score, 1),
        "risk_category": risk_category,
        "source": payload.source,
        "sender": payload.sender or target_phone or "Unknown",
        "threat_tags": clean_tags,
        "summary": fusion_assessment.get("rationale") or "Content scanned successfully.",
        "target_phone": target_phone,
        "target_url": target_url,
        "recommended_action": recommended_action,
        "can_report_fia": is_threat,
        "timestamp": now.isoformat()
    }


@router.get("/ambient/history")
async def get_ambient_scan_history(limit: int = 50, db: AsyncSession = Depends(get_db)):
    """Returns real-time scan history captured across WhatsApp Web, Gmail, and Web Browser."""
    stmt = select(AmbientScanLog).order_by(AmbientScanLog.created_at.desc()).limit(limit)
    rows = (await db.execute(stmt)).scalars().all()

    return [
        {
            "id": r.id,
            "case_id": r.case_id,
            "source": r.source,
            "sender_info": r.sender_info,
            "preview_snippet": r.preview_snippet,
            "risk_score": r.risk_score,
            "is_threat": r.is_threat,
            "threat_tags": r.threat_tags,
            "target_phone": r.target_phone,
            "target_url": r.target_url,
            "created_at": r.created_at.isoformat()
        }
        for r in rows
    ]
