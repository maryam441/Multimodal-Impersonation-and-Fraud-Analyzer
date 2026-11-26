"""
Unit and integration tests for URL analysis modality.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from ml.src.url.feature_extractor import URLFeatureExtractor, defang_url, refang_url
from backend.app.services.url_service import URLServiceAnalyzer
from backend.app.schemas.inputs import URLAnalysisRequest


def test_defang_and_refang():
    raw = "https://bank-verify.xyz/login?user=123"
    defanged = defang_url(raw)
    assert defanged == "hxxps://bank-verify[.]xyz/login?user=123"

    refanged = refang_url(defanged)
    assert refanged == "https://bank-verify.xyz/login?user=123"


def test_feature_extractor_metrics():
    extractor = URLFeatureExtractor()
    features = extractor.extract_features("http://192.168.1.1/update-account/easypaisa")

    assert features["is_ip_literal"] is True
    assert "easypaisa" in features["matched_keywords"]
    assert features["domain_entropy"] > 0.0
    assert features["digit_ratio"] > 0.0


@pytest.mark.asyncio
async def test_url_service_phishing_detection():
    analyzer = URLServiceAnalyzer()
    
    # Highly suspicious URL with brand keyword, suspicious TLD, and excessive hyphens
    phishing_url = "hxxps://easypaisa-bonus-reward-verify[.]xyz/claim-prize"
    req = URLAnalysisRequest(url=phishing_url)
    result = await analyzer.run_analysis(case_id="case_test_url", payload=req)

    assert result.risk_score >= 61.0
    assert result.risk_label == "high"
    assert "easypaisa" in result.metrics["matched_keywords"]
    assert result.metrics["tld"] == "xyz"
    assert len(result.signals) >= 2


@pytest.mark.asyncio
async def test_url_api_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        case_res = await ac.post("/api/v1/cases", json={"title": "URL Test Case"})
        case_id = case_res.json()["case_id"]

        url_payload = {
            "url": "http://192.168.1.100/login/bank-verify-account.php"
        }
        res = await ac.post(f"/api/v1/cases/{case_id}/url", json=url_payload)
        assert res.status_code == 200
        data = res.json()
        assert data["modality"] == "url"
        assert data["status"] == "analyzed"
        assert data["risk_score"] > 50.0
        assert any(s["code"] == "IP_LITERAL_HOST" for s in data["signals"])
