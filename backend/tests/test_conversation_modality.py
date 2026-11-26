import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from ml.src.conversation.parser import parse_conversation_turns

def test_turn_parser_regex():
    raw = (
        "Caller: Good morning, this is State Bank fraud cell.\n"
        "User: Yes, what is the matter?\n"
        "Caller: Your account is being frozen. Read the 6-digit OTP code immediately."
    )
    turns = parse_conversation_turns(raw)
    assert len(turns) == 3
    assert turns[0]["speaker"] == "Caller"
    assert turns[1]["speaker"] == "User"
    assert turns[2]["speaker"] == "Caller"
    assert "frozen" in turns[2]["text"]

@pytest.mark.asyncio
async def test_conversation_api_scam_detection():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        create_res = await ac.post("/api/v1/cases")
        case_id = create_res.json()["case_id"]

        # 1. Police Accident Extortion Dialogue
        payload = {
            "turns": [
                {"speaker": "Caller", "text": "I am Sub-Inspector Tariq from City Police Station. Your son is in custody for an accident."},
                {"speaker": "User", "text": "Is he safe? Please let me talk to him."},
                {"speaker": "Caller", "text": "Transfer PKR 50,000 via EasyPaisa immediately right now to avoid an arrest FIR!"}
            ]
        }
        res = await ac.post(f"/api/v1/cases/{case_id}/conversation", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["modality"] == "conversation"
        assert data["status"] == "analyzed"
        assert data["risk_score"] >= 61.0
        assert data["risk_label"] == "high"
        assert data["metrics"]["total_turns"] == 3
        assert data["metrics"]["escalation_detected"] is True
        codes = [s["code"] for s in data["signals"]]
        assert "AUTHORITY_IMPERSONATION" in codes
        assert "ARTIFICIAL_URGENCY" in codes
        assert "FINANCIAL_TRANSFER_DEMAND" in codes

        # 2. Benign Customer Support Dialogue
        benign_payload = {
            "raw_text": (
                "Support: Welcome to Nayatel help desk. How can I assist you?\n"
                "User: My optical fiber router light is red.\n"
                "Support: Please restart the device once while I check the line signal."
            )
        }
        benign_res = await ac.post(f"/api/v1/cases/{case_id}/conversation", json=benign_payload)
        assert benign_res.status_code == 200
        benign_data = benign_res.json()
        assert benign_data["risk_score"] <= 30.0
        assert benign_data["risk_label"] == "low"
        assert len(benign_data["signals"]) == 0
