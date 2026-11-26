from fastapi import APIRouter
from datetime import datetime, timezone
from backend.app.core.config import settings

router = APIRouter()

@router.get("/health", tags=["System Telemetry"])
async def get_health():
    """System health check and active telemetry status."""
    return {
        "status": "online",
        "service": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "modalities": {
            "voice": settings.ENABLE_VOICE_MODALITY,
            "message": settings.ENABLE_MESSAGE_MODALITY,
            "conversation": settings.ENABLE_CONVERSATION_MODALITY,
            "url": settings.ENABLE_URL_MODALITY,
            "phone": settings.ENABLE_PHONE_MODALITY,
        },
        "hitl_gate_enabled": True
    }

@router.get("/models", tags=["System Telemetry"])
async def get_model_status():
    """Metadata describing active models and version provenance."""
    return {
        "system": settings.APP_NAME,
        "active_models": [
            {
                "modality": "voice",
                "name": "acoustic-telecom-fraud-detector",
                "architecture": "Random Forest + 35 Acoustic Metrics (MFCC/Jitter/Shimmer)",
                "version": "1.0",
                "status": "ready"
            },
            {
                "modality": "message",
                "name": "roman-urdu-english-sms-classifier",
                "architecture": "TF-IDF + Linear Support Vector Machine with Token Attribution",
                "version": "1.0",
                "status": "ready"
            },
            {
                "modality": "conversation",
                "name": "multiturn-tactic-tagger",
                "architecture": "Turn Parser + Social Engineering Escalation Engine",
                "version": "1.0",
                "status": "ready"
            },
            {
                "modality": "url",
                "name": "lexical-host-phishing-detector",
                "architecture": "PhiUSIIL 24-Feature Lexical/Host ML Classifier",
                "version": "1.0",
                "status": "ready"
            },
            {
                "modality": "phone",
                "name": "e164-structural-metadata-adapter",
                "architecture": "Google Libphonenumber + Transparent Provider Interface",
                "version": "1.0",
                "status": "ready"
            }
        ]
    }

@router.get("/providers/status", tags=["System Telemetry"])
async def get_provider_status():
    """Status of external reputation lookup adapters and HITL approval states."""
    return {
        "external_phone_lookup": {
            "enabled": settings.ENABLE_EXTERNAL_PHONE_LOOKUP,
            "status": "unconfigured_or_offline",
            "policy": "Requires explicit interactive confirmation modal before lookup"
        },
        "live_url_fetching": {
            "enabled": settings.ENABLE_LIVE_URL_FETCHING,
            "status": "disabled_by_default",
            "policy": "Safe defanged offline lexical/host evaluation active"
        }
    }
