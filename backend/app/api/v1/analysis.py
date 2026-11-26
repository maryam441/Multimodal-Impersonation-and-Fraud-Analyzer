import os
import shutil
from datetime import datetime, timezone
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.core.config import settings
from backend.app.db.session import get_db
from backend.app.db.models import Case, EvidenceItem, ModalityResult, FusionAssessment
from backend.app.schemas.inputs import (
    PhoneAnalysisRequest, MessageAnalysisRequest, ConversationAnalysisRequest, URLAnalysisRequest, EmailAnalysisRequest
)
from backend.app.schemas.modality import ModalityResultResponse
from backend.app.services.job_manager import job_telemetry
from backend.app.services.default_analyzers import (
    phone_analyzer, message_analyzer, url_analyzer, conversation_analyzer, voice_analyzer
)
from backend.app.services.email_service import EmailServiceAnalyzer

email_analyzer = EmailServiceAnalyzer()

router = APIRouter()

async def get_valid_case(case_id: str, db: AsyncSession) -> Case:
    stmt = select(Case).where(Case.id == case_id)
    result = await db.execute(stmt)
    case_obj = result.scalar_one_or_none()
    if not case_obj:
        raise HTTPException(status_code=404, detail="Case not found or already purged.")
    return case_obj

async def save_modality_result(case_id: str, res: ModalityResultResponse, db: AsyncSession):
    # Check if modality already evaluated, update or insert
    stmt = select(ModalityResult).where(ModalityResult.case_id == case_id, ModalityResult.modality == res.modality)
    existing = (await db.execute(stmt)).scalar_one_or_none()

    signals_dict = [s.model_dump() for s in res.signals]

    if existing:
        existing.status = res.status
        existing.risk_score = res.risk_score
        existing.risk_label = res.risk_label
        existing.confidence = res.confidence
        existing.signals = signals_dict
        existing.metrics = res.metrics
        existing.model_info = res.model
        existing.limitations = res.limitations
        existing.processing_ms = res.processing_ms
    else:
        new_result = ModalityResult(
            case_id=case_id,
            modality=res.modality,
            status=res.status,
            risk_score=res.risk_score,
            risk_label=res.risk_label,
            confidence=res.confidence,
            signals=signals_dict,
            metrics=res.metrics,
            model_info=res.model,
            limitations=res.limitations,
            processing_ms=res.processing_ms
        )
        db.add(new_result)
    await db.commit()

@router.post("/cases/{case_id}/phone", response_model=ModalityResultResponse, tags=["Modality Analysis"])
async def analyze_phone(case_id: str, payload: PhoneAnalysisRequest, db: AsyncSession = Depends(get_db)):
    await get_valid_case(case_id, db)
    job_telemetry.update_stage(case_id, "phone", "preprocessing", 25)
    job_telemetry.update_stage(case_id, "phone", "inference", 75)
    result = await phone_analyzer.execute_safe(case_id, payload)
    await save_modality_result(case_id, result, db)
    job_telemetry.update_stage(case_id, "phone", "completed", 100)
    return result

@router.post("/cases/{case_id}/message", response_model=ModalityResultResponse, tags=["Modality Analysis"])
async def analyze_message(case_id: str, payload: MessageAnalysisRequest, db: AsyncSession = Depends(get_db)):
    await get_valid_case(case_id, db)
    job_telemetry.update_stage(case_id, "message", "preprocessing", 20)
    job_telemetry.update_stage(case_id, "message", "inference", 80)
    result = await message_analyzer.execute_safe(case_id, payload)
    await save_modality_result(case_id, result, db)
    job_telemetry.update_stage(case_id, "message", "completed", 100)
    return result

@router.post("/cases/{case_id}/url", response_model=ModalityResultResponse, tags=["Modality Analysis"])
async def analyze_url(case_id: str, payload: URLAnalysisRequest, db: AsyncSession = Depends(get_db)):
    await get_valid_case(case_id, db)
    job_telemetry.update_stage(case_id, "url", "preprocessing", 30)
    job_telemetry.update_stage(case_id, "url", "inference", 80)
    result = await url_analyzer.execute_safe(case_id, payload)
    await save_modality_result(case_id, result, db)
    job_telemetry.update_stage(case_id, "url", "completed", 100)
    return result

@router.post("/cases/{case_id}/conversation", response_model=ModalityResultResponse, tags=["Modality Analysis"])
async def analyze_conversation(case_id: str, payload: ConversationAnalysisRequest, db: AsyncSession = Depends(get_db)):
    await get_valid_case(case_id, db)
    job_telemetry.update_stage(case_id, "conversation", "preprocessing", 30)
    job_telemetry.update_stage(case_id, "conversation", "inference", 80)
    result = await conversation_analyzer.execute_safe(case_id, payload)
    await save_modality_result(case_id, result, db)
    job_telemetry.update_stage(case_id, "conversation", "completed", 100)
    return result

@router.post("/cases/{case_id}/voice", response_model=ModalityResultResponse, tags=["Modality Analysis"])
async def analyze_voice(case_id: str, file: UploadFile = File(None), preset_file: str = Form(None), db: AsyncSession = Depends(get_db)):
    await get_valid_case(case_id, db)
    job_telemetry.update_stage(case_id, "voice", "preprocessing", 30)

    # Save audio ephemerally if uploaded
    if file and file.filename:
        case_dir = os.path.join(settings.EVIDENCE_UPLOAD_DIR, case_id)
        os.makedirs(case_dir, exist_ok=True)
        file_path = os.path.join(case_dir, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    job_telemetry.update_stage(case_id, "voice", "inference", 80)
    result = await voice_analyzer.execute_safe(case_id, None)
    await save_modality_result(case_id, result, db)
    job_telemetry.update_stage(case_id, "voice", "completed", 100)
    return result

@router.post("/cases/{case_id}/email", response_model=ModalityResultResponse, tags=["Modality Analysis"])
async def analyze_email(case_id: str, payload: EmailAnalysisRequest, db: AsyncSession = Depends(get_db)):
    await get_valid_case(case_id, db)
    job_telemetry.update_stage(case_id, "email", "preprocessing", 30)
    job_telemetry.update_stage(case_id, "email", "inference", 80)
    result = await email_analyzer.execute_safe(case_id, payload)
    await save_modality_result(case_id, result, db)
    job_telemetry.update_stage(case_id, "email", "completed", 100)
    return result

@router.get("/cases/{case_id}/status", tags=["Case Lifecycle"])
async def get_pipeline_status(case_id: str, db: AsyncSession = Depends(get_db)):
    """Live pipeline telemetry tracker showing per-modality progress stages."""
    await get_valid_case(case_id, db)
    telemetry = job_telemetry.get_telemetry(case_id)
    return {
        "case_id": case_id,
        "pipeline_stages": telemetry,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.get("/cases/{case_id}/report", tags=["Case Dossier"])
async def get_forensic_report(case_id: str, db: AsyncSession = Depends(get_db)):
    """Compile all active modality findings into an explainable forensic dossier."""
    case_obj = await get_valid_case(case_id, db)

    stmt = select(ModalityResult).where(ModalityResult.case_id == case_id)
    results = (await db.execute(stmt)).scalars().all()

    from backend.app.services.fusion_service import FusionEngine, ModalityScoreInput

    fusion_engine = FusionEngine()
    modality_inputs = [
        ModalityScoreInput(
            modality=r.modality,
            status=r.status,
            risk_score=r.risk_score,
            confidence=r.confidence,
            is_extracted_from_text=bool(r.metrics.get("extracted_from_text", False)) if r.metrics else False
        )
        for r in results
    ]

    fusion_assessment = fusion_engine.evaluate_fusion(modality_inputs)

    return {
        "case_id": case_id,
        "status": "completed" if results else "created",
        "created_at": case_obj.created_at.isoformat(),
        "expires_at": case_obj.expires_at.isoformat(),
        "fusion_assessment": fusion_assessment,
        "modality_results": [
            {
                "modality": r.modality,
                "status": r.status,
                "risk_score": r.risk_score,
                "risk_label": r.risk_label,
                "confidence": r.confidence,
                "signals": r.signals,
                "metrics": r.metrics,
                "model": r.model_info,
                "limitations": r.limitations,
                "processing_ms": r.processing_ms
            }
            for r in results
        ]
    }
