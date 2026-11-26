"""
Assistant, Explainability, and Human-in-the-Loop Action Endpoints.
"""

import hashlib
import json
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.db.session import get_db
from backend.app.db.models import Case, ModalityResult, AuditEvent
from backend.app.services.rag_service import GroundedSafetyAssistant
from backend.app.services.fusion_service import FusionEngine, ModalityScoreInput

router = APIRouter()
assistant_service = GroundedSafetyAssistant()
fusion_engine = FusionEngine()


class AssistantQueryRequest(BaseModel):
    query: Optional[str] = Field(None, description="Optional user inquiry for safety assistance")


class HumanGateActionRequest(BaseModel):
    user_confirmed: bool = Field(..., description="Explicit human investigator authorization confirmation flag")
    investigator_notes: Optional[str] = Field(None, description="Optional notes from the human operator")


async def get_valid_case(case_id: str, db: AsyncSession) -> Case:
    stmt = select(Case).where(Case.id == case_id)
    case_obj = (await db.execute(stmt)).scalars().first()
    if not case_obj:
        raise HTTPException(status_code=404, detail="Case not found or expired")
    return case_obj


@router.post("/cases/{case_id}/assistant/query", tags=["Grounded Safety Assistant"])
async def query_assistant(case_id: str, payload: AssistantQueryRequest, db: AsyncSession = Depends(get_db)):
    """
    RAG-grounded safety explanation assistant referencing deterministic case findings
    and official SBP, PTA, and FIA regulatory guidance without score fabrication.
    """
    await get_valid_case(case_id, db)

    stmt = select(ModalityResult).where(ModalityResult.case_id == case_id)
    results = (await db.execute(stmt)).scalars().all()

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

    modality_dicts = [
        {
            "modality": r.modality,
            "status": r.status,
            "risk_score": r.risk_score,
            "confidence": r.confidence,
            "signals": r.signals
        }
        for r in results
    ]

    explanation = assistant_service.generate_explanation(
        case_id=case_id,
        fusion_assessment=fusion_assessment,
        modality_results=modality_dicts,
        user_query=payload.query
    )
    return explanation


@router.post("/cases/{case_id}/actions/export-dossier", tags=["Forensic Actions"])
async def export_case_dossier(case_id: str, db: AsyncSession = Depends(get_db)):
    """Exports full forensic evidence package sealed with SHA-256 cryptographic digest."""
    case_obj = await get_valid_case(case_id, db)

    stmt = select(ModalityResult).where(ModalityResult.case_id == case_id)
    results = (await db.execute(stmt)).scalars().all()

    dossier_data = {
        "case_id": case_id,
        "status": case_obj.status,
        "created_at": case_obj.created_at.isoformat(),
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "modalities_analyzed": [
            {
                "modality": r.modality,
                "status": r.status,
                "risk_score": r.risk_score,
                "signals": r.signals,
                "metrics": r.metrics
            }
            for r in results
        ]
    }

    serialized = json.dumps(dossier_data, sort_keys=True)
    digest = hashlib.sha256(serialized.encode("utf-8")).hexdigest()

    # Log audit event
    audit = AuditEvent(
        case_id=case_id,
        action="DOSSIER_EXPORTED",
        details={"sha256_digest": digest, "actor": "INVESTIGATOR"}
    )
    db.add(audit)
    await db.commit()

    return {
        "case_id": case_id,
        "sha256_digest": digest,
        "dossier": dossier_data,
        "status": "sealed"
    }


@router.post("/cases/{case_id}/actions/report-fia", tags=["Forensic Actions"])
async def report_to_fia(case_id: str, payload: HumanGateActionRequest, db: AsyncSession = Depends(get_db)):
    """
    Prepares formal law enforcement incident report.
    Requires explicit Human-in-the-Loop authorization confirmation.
    """
    await get_valid_case(case_id, db)

    if not payload.user_confirmed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Human confirmation required: Action halted by Human-in-the-Loop safety gate."
        )

    stmt = select(ModalityResult).where(ModalityResult.case_id == case_id)
    results = (await db.execute(stmt)).scalars().all()

    incident_summary = {
        "agency": "Federal Investigation Agency (FIA) - Cyber Crime Wing",
        "legal_basis": "PECA 2016 Sections 13 & 14",
        "case_id": case_id,
        "confirmed_by_human": True,
        "operator_notes": payload.investigator_notes or "Investigator confirmed report dispatch.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "complaint_payload": {
            "evidence_count": len(results),
            "modalities": [r.modality for r in results],
            "action_status": "DISPATCH_READY"
        }
    }

    # Record audit trail
    audit = AuditEvent(
        case_id=case_id,
        action="FIA_DISPATCH_CONFIRMED",
        details={"notes": payload.investigator_notes, "actor": "HUMAN_OPERATOR"}
    )
    db.add(audit)
    await db.commit()

    return incident_summary
