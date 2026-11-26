"""
Unit and integration tests for the Multimodal Fusion Engine and Risk Framework.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from backend.app.services.fusion_service import FusionEngine, ModalityScoreInput


def test_missingness_neutrality():
    engine = FusionEngine()

    # Case 1: Voice (80) and Message (80) available. URL, Phone, Conversation missing.
    # Should fuse to 80.0, NOT dilute down to ~44 by imputing 0 for missing modalities.
    inputs = [
        ModalityScoreInput(modality="voice", status="analyzed", risk_score=80.0, confidence=0.9),
        ModalityScoreInput(modality="message", status="analyzed", risk_score=80.0, confidence=0.85),
    ]
    res = engine.evaluate_fusion(inputs)

    assert res["status"] == "evaluated"
    assert res["fused_score"] == 80.0
    assert res["risk_category"] == "high"
    assert set(res["missing_modalities"]) == {"url", "phone", "conversation", "email"}


def test_exact_boundary_thresholds():
    engine = FusionEngine()

    # Exact boundary 30.0 -> Low
    res_low = engine.evaluate_fusion([
        ModalityScoreInput(modality="message", status="analyzed", risk_score=30.0, confidence=0.9)
    ])
    assert res_low["risk_category"] == "low"

    # Exact boundary 30.1 -> Medium
    res_med = engine.evaluate_fusion([
        ModalityScoreInput(modality="message", status="analyzed", risk_score=30.1, confidence=0.9)
    ])
    assert res_med["risk_category"] == "medium"

    # Exact boundary 60.0 -> Medium
    res_med60 = engine.evaluate_fusion([
        ModalityScoreInput(modality="message", status="analyzed", risk_score=60.0, confidence=0.9)
    ])
    assert res_med60["risk_category"] == "medium"

    # Exact boundary 60.1 -> High
    res_high = engine.evaluate_fusion([
        ModalityScoreInput(modality="message", status="analyzed", risk_score=60.1, confidence=0.9)
    ])
    assert res_high["risk_category"] == "high"


def test_inconclusive_when_zero_verified_scores():
    engine = FusionEngine()
    # Phone returns insufficient_data (risk_score = None)
    inputs = [
        ModalityScoreInput(modality="phone", status="insufficient_data", risk_score=None, confidence=0.0)
    ]
    res = engine.evaluate_fusion(inputs)

    assert res["status"] == "inconclusive"
    assert res["fused_score"] is None
    assert res["risk_category"] == "inconclusive"


def test_deduplication_discount():
    engine = FusionEngine()

    inputs_undiscounted = [
        ModalityScoreInput(modality="message", status="analyzed", risk_score=80.0, confidence=0.9),
        ModalityScoreInput(modality="url", status="analyzed", risk_score=50.0, confidence=0.9, is_extracted_from_text=False),
    ]
    res_undiscounted = engine.evaluate_fusion(inputs_undiscounted)

    inputs_discounted = [
        ModalityScoreInput(modality="message", status="analyzed", risk_score=80.0, confidence=0.9),
        ModalityScoreInput(modality="url", status="analyzed", risk_score=50.0, confidence=0.9, is_extracted_from_text=True),
    ]
    res_discounted = engine.evaluate_fusion(inputs_discounted)

    assert "CORRELATION_DISCOUNT_APPLIED" in res_discounted["flags"]
    assert res_discounted["weights_used"]["url"] < res_undiscounted["weights_used"]["url"]


def test_ablation_study_calculation():
    engine = FusionEngine()
    inputs = [
        ModalityScoreInput(modality="voice", status="analyzed", risk_score=90.0, confidence=0.9),
        ModalityScoreInput(modality="message", status="analyzed", risk_score=40.0, confidence=0.8),
    ]
    res = engine.evaluate_fusion(inputs)

    ablation = res["ablation_comparison"]
    assert "voice" in ablation
    assert "message" in ablation
    # Removing voice should drop the risk significantly
    assert ablation["voice"]["score_without_modality"] == 40.0
    assert ablation["voice"]["delta"] > 0


def test_cross_modality_divergence():
    engine = FusionEngine()
    # Voice 95 (deepfake detected) vs Message 15 (polite greeting)
    inputs = [
        ModalityScoreInput(modality="voice", status="analyzed", risk_score=95.0, confidence=0.9),
        ModalityScoreInput(modality="message", status="analyzed", risk_score=15.0, confidence=0.9),
    ]
    res = engine.evaluate_fusion(inputs)

    assert res["cross_modality_divergence"] is True
    assert "CROSS_MODALITY_DIVERGENCE" in res["flags"]


@pytest.mark.asyncio
async def test_case_report_api_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        case_res = await ac.post("/api/v1/cases", json={"title": "Fusion Report Test Case"})
        case_id = case_res.json()["case_id"]

        # 1. Analyze Message (High Risk)
        await ac.post(f"/api/v1/cases/{case_id}/message", json={"text": "URGENT! Your HBL account is blocked! Transfer PKR 50000 now to avoid arrest!"})

        # 2. Analyze Phone (Insufficient Data)
        await ac.post(f"/api/v1/cases/{case_id}/phone", json={"phone_number": "03001234567"})

        # 3. Fetch Forensic Report
        report_res = await ac.get(f"/api/v1/cases/{case_id}/report")
        assert report_res.status_code == 200
        data = report_res.json()

        fusion = data["fusion_assessment"]
        assert fusion["status"] == "evaluated"
        assert fusion["fused_score"] > 60.0
        assert fusion["risk_category"] == "high"
        assert "message" in fusion["active_modalities"]
        assert "phone" in fusion["active_modalities"]
        # Phone had insufficient_data so it wasn't given a non-zero normalized weight
        assert "message" in fusion["weights_used"]
