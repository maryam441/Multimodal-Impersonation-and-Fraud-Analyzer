"""
Tests for 6th Modality (Email Phishing & Header Spoof Analyzer)
and Real-Time WebSocket Streaming Endpoint (/api/v1/stream/live).
"""

import pytest
import json
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.services.email_service import EmailServiceAnalyzer
from backend.app.schemas.inputs import EmailAnalysisRequest
from backend.app.services.fusion_service import FusionEngine, ModalityScoreInput

email_analyzer = EmailServiceAnalyzer()
fusion_engine = FusionEngine()


@pytest.mark.asyncio
async def test_email_analyzer_detects_brand_spoof_and_header_failure():
    payload = EmailAnalysisRequest(
        sender="HBL Fraud Support <fraud-alert@gmail.com>",
        subject="URGENT: Your HBL Account Has Been Suspended Within 24 Hours",
        body="Dear customer, your bank account is frozen. Please verify at http://hbl-verify.pk to restore access.",
        headers={"spf": "Fail", "dmarc": "Fail"}
    )
    res = await email_analyzer.run_analysis(case_id="test-email-case", payload=payload)

    assert res.modality == "email"
    assert res.status == "analyzed"
    assert res.risk_score >= 60.0
    assert res.risk_label == "high"

    codes = [s.code for s in res.signals]
    assert "DISPLAY_NAME_BRAND_SPOOF" in codes
    assert "SPF_AUTHENTICATION_FAILED" in codes
    assert "ACCOUNT_SUSPENSION_PRETEXT" in codes
    assert "EMBEDDED_HYPERLINKS_DETECTED" in codes


@pytest.mark.asyncio
async def test_email_analyzer_benign_case():
    payload = EmailAnalysisRequest(
        sender="HBL Official Notifications <alerts@hbl.com>",
        subject="Monthly Account Statement - November 2026",
        body="Dear customer, please find attached your monthly account e-statement for your review.",
        headers={"spf": "Pass", "dkim": "Pass", "dmarc": "Pass"}
    )
    res = await email_analyzer.run_analysis(case_id="test-email-benign", payload=payload)

    assert res.risk_score <= 30.0
    assert res.risk_label == "low"


@pytest.mark.asyncio
async def test_email_api_endpoint_lifecycle():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Create case
        c_res = await client.post("/api/v1/cases", json={"title": "Email Phishing Test"})
        assert c_res.status_code == 201
        case_id = c_res.json()["case_id"]

        # Submit email
        e_res = await client.post(f"/api/v1/cases/{case_id}/email", json={
            "sender": "State Bank of Pakistan <officer@sbp-online-alert.com>",
            "subject": "CRITICAL: Immediate KYC Update Required",
            "body": "State Bank directive: All bank accounts must verify credentials within 24 hours.",
            "headers": {"spf": "Fail"}
        })
        assert e_res.status_code == 200
        e_data = e_res.json()
        assert e_data["modality"] == "email"
        assert e_data["risk_score"] >= 50.0

        # Retrieve forensic report (verifying 6-modality fusion)
        r_res = await client.get(f"/api/v1/cases/{case_id}/report")
        assert r_res.status_code == 200
        r_data = r_res.json()
        assert "email" in r_data["fusion_assessment"]["active_modalities"]


@pytest.mark.asyncio
async def test_streaming_simulate_threat_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "modality": "conversation",
            "text": "Inspector Khan from Police Headquarters here. Pay 50000 PKR right now or face arrest under FIR.",
            "sender": "+923009988776"
        }
        res = await client.post("/api/v1/stream/simulate-threat", json=payload)
        assert res.status_code == 200
        data = res.json()

        assert data["is_threat"] is True
        assert data["fused_score"] >= 60.0
        assert data["trigger_heads_up_overlay"] is True
        assert "WARN_AND_OFFER_FIA_REPORT" in data["recommended_action"]


def test_six_modality_fusion_engine_normalization():
    inputs = [
        ModalityScoreInput(modality="voice", status="analyzed", risk_score=80.0, confidence=0.9),
        ModalityScoreInput(modality="email", status="analyzed", risk_score=75.0, confidence=0.95),
        ModalityScoreInput(modality="url", status="analyzed", risk_score=60.0, confidence=0.85)
    ]
    res = fusion_engine.evaluate_fusion(inputs)

    assert "voice" in res["active_modalities"]
    assert "email" in res["active_modalities"]
    assert "url" in res["active_modalities"]
    assert "message" in res["missing_modalities"]
    assert res["fused_score"] > 60.0
    assert res["risk_category"] == "high"
