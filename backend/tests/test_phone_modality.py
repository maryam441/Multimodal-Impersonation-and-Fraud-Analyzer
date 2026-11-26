"""
Unit and integration tests for phone analysis modality.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from ml.src.phone.normalizer import normalize_phone_number
from backend.app.services.phone_service import PhoneServiceAnalyzer
from backend.app.schemas.inputs import PhoneAnalysisRequest


def test_pakistan_mobile_normalization():
    # Test Jazz
    res = normalize_phone_number("0300 1234567")
    assert res["valid"] is True
    assert res["e164"] == "+923001234567"
    assert "Jazz" in res["carrier"]
    assert res["line_type"] == "mobile"

    # Test Telenor
    res2 = normalize_phone_number("+92-345-7654321")
    assert res2["valid"] is True
    assert res2["e164"] == "+923457654321"
    assert "Telenor" in res2["carrier"]


def test_pakistan_landline_and_shortcodes():
    # Karachi landline
    res = normalize_phone_number("021-34567890")
    assert res["valid"] is True
    assert res["line_type"] == "fixed_line"
    assert res["region"] == "Karachi"

    # Shortcode
    res_sc = normalize_phone_number("8888")
    assert res_sc["valid"] is True
    assert res_sc["line_type"] == "shortcode"


@pytest.mark.asyncio
async def test_phone_unverified_returns_insufficient_data():
    analyzer = PhoneServiceAnalyzer()
    req = PhoneAnalysisRequest(phone_number="+923019876543")
    result = await analyzer.run_analysis(case_id="case_phone_test", payload=req)

    assert result.status == "insufficient_data"
    assert result.risk_score is None
    assert result.risk_label == "inconclusive"
    assert result.metrics["normalized_e164"] == "+923019876543"
    assert "Jazz" in result.metrics["carrier"]


@pytest.mark.asyncio
async def test_phone_synthetic_fraud_benchmark():
    analyzer = PhoneServiceAnalyzer()
    req = PhoneAnalysisRequest(phone_number="+923000000000")
    result = await analyzer.run_analysis(case_id="case_phone_test", payload=req)

    assert result.status == "analyzed"
    assert result.risk_score >= 90.0
    assert result.risk_label == "high"
    assert any(s.code == "REPORTED_FRAUD_RECORD" for s in result.signals)


@pytest.mark.asyncio
async def test_phone_api_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        case_res = await ac.post("/api/v1/cases", json={"title": "Phone Test Case"})
        case_id = case_res.json()["case_id"]

        phone_payload = {
            "phone_number": "0312-3456789"
        }
        res = await ac.post(f"/api/v1/cases/{case_id}/phone", json=phone_payload)
        assert res.status_code == 200
        data = res.json()
        assert data["modality"] == "phone"
        assert data["status"] == "insufficient_data"
        assert data["metrics"]["normalized_e164"] == "+923123456789"
        assert "Zong" in data["metrics"]["carrier"]
