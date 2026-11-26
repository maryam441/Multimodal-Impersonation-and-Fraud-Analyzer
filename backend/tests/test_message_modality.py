import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from ml.src.message.attribution import extract_phrase_attributions

def test_roman_urdu_phrase_attribution():
    text = "Apka HBL account blocked hai biometric verify na hone ki waja se. Fori OTP share krain."
    attrs = extract_phrase_attributions(text)

    assert len(attrs) >= 3
    codes = [a["code"] for a in attrs]
    assert "ACCOUNT_BLOCK_THREAT" in codes
    assert "OTP_SOLICITATION" in codes
    assert "FINANCIAL_INSTITUTION_IMPERSONATION" in codes

    # Verify character spans accurately match substrings
    for a in attrs:
        extracted = text[a["start"]:a["end"]].lower()
        assert extracted == a["snippet"].lower()

@pytest.mark.asyncio
async def test_message_api_scam_detection():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        create_res = await ac.post("/api/v1/cases")
        case_id = create_res.json()["case_id"]

        # 1. High-risk Roman Urdu Scam
        res = await ac.post(f"/api/v1/cases/{case_id}/message", json={
            "text": "Apka JazzCash account blocked hai. Fori apna secret OTP code btayn ta k account chalu ho."
        })
        assert res.status_code == 200
        data = res.json()
        assert data["modality"] == "message"
        assert data["status"] == "analyzed"
        assert data["risk_score"] >= 61.0
        assert data["risk_label"] == "high"
        assert len(data["signals"]) >= 2

        # 2. Benign Roman Urdu Message
        benign_res = await ac.post(f"/api/v1/cases/{case_id}/message", json={
            "text": "Salam bhai, kal university kitne bje ana hai? Assignments submit karwani hain."
        })
        assert benign_res.status_code == 200
        benign_data = benign_res.json()
        assert benign_data["risk_score"] <= 30.0
        assert benign_data["risk_label"] == "low"
        assert len(benign_data["signals"]) == 0
