import os
import shutil
import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.core.config import settings
from backend.app.db.session import get_db
from backend.app.db.models import Case, EvidenceItem, ModalityResult, FusionAssessment, AuditEvent
from backend.app.schemas.case import CaseCreateRequest, CaseResponse, CaseSummary
from backend.app.schemas.extract import ExtractionRequest, ExtractionResponse
from backend.app.services.extractor import extract_entities

router = APIRouter()

@router.post("/cases", response_model=CaseResponse, status_code=status.HTTP_201_CREATED, tags=["Case Lifecycle"])
async def create_case(payload: CaseCreateRequest = CaseCreateRequest(), db: AsyncSession = Depends(get_db)):
    """Initialize a new forensic case with an ephemeral client retention token."""
    token = secrets.token_urlsafe(32)
    ttl = timedelta(hours=payload.retention_hours or settings.EVIDENCE_RETENTION_HOURS)
    now = datetime.now(timezone.utc)
    expires = now + ttl

    new_case = Case(
        client_token=token,
        status="created",
        created_at=now,
        expires_at=expires
    )
    db.add(new_case)
    await db.flush()

    audit = AuditEvent(
        case_id=new_case.id,
        action="case_created",
        details={"retention_hours": payload.retention_hours, "expires_at": expires.isoformat()}
    )
    db.add(audit)
    await db.commit()

    return CaseResponse(
        case_id=new_case.id,
        client_token=token,
        status=new_case.status,
        created_at=new_case.created_at,
        expires_at=new_case.expires_at,
        active_modalities=[]
    )

@router.get("/cases/{case_id}", response_model=CaseSummary, tags=["Case Lifecycle"])
async def get_case(case_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve case status and active modality telemetry."""
    stmt = select(Case).where(Case.id == case_id)
    result = await db.execute(stmt)
    case_obj = result.scalar_one_or_none()

    if not case_obj:
        raise HTTPException(status_code=404, detail="Forensic case not found or already purged.")

    # Check expiration
    now = datetime.now(timezone.utc)
    is_expired = now > case_obj.expires_at.replace(tzinfo=timezone.utc) if case_obj.expires_at.tzinfo is None else now > case_obj.expires_at

    # Fetch active modalities
    mod_stmt = select(ModalityResult.modality).where(ModalityResult.case_id == case_id)
    mod_result = await db.execute(mod_stmt)
    modalities = list(mod_result.scalars().all())

    return CaseSummary(
        case_id=case_obj.id,
        status=case_obj.status,
        created_at=case_obj.created_at,
        expires_at=case_obj.expires_at,
        active_modalities=modalities,
        is_expired=is_expired
    )

@router.delete("/cases/{case_id}", tags=["Case Lifecycle"])
async def purge_case(case_id: str, db: AsyncSession = Depends(get_db)):
    """Cryptographic/Hard Purge: Instantly delete case, evidence, database records, and temporary files."""
    stmt = select(Case).where(Case.id == case_id)
    result = await db.execute(stmt)
    case_obj = result.scalar_one_or_none()

    if not case_obj:
        raise HTTPException(status_code=404, detail="Case already purged or not found.")

    # Purge uploads folder for this case if exists
    case_upload_dir = os.path.join(settings.EVIDENCE_UPLOAD_DIR, case_id)
    if os.path.exists(case_upload_dir):
        shutil.rmtree(case_upload_dir, ignore_errors=True)

    await db.delete(case_obj)
    await db.commit()

    return {
        "status": "purged",
        "case_id": case_id,
        "message": "Case, modality results, and all ephemeral files have been permanently deleted.",
        "purged_at": datetime.now(timezone.utc).isoformat()
    }

@router.post("/cases/{case_id}/extract", response_model=ExtractionResponse, tags=["Cross-Modality Intelligence"])
async def extract_cross_modality(case_id: str, payload: ExtractionRequest, db: AsyncSession = Depends(get_db)):
    """Smart Extraction: Automatically discover URLs and phone numbers embedded in pasted text."""
    # Verify case exists
    stmt = select(Case).where(Case.id == case_id)
    result = await db.execute(stmt)
    case_obj = result.scalar_one_or_none()

    if not case_obj:
        raise HTTPException(status_code=404, detail="Case not found.")

    extracted = extract_entities(payload.text)
    return extracted
