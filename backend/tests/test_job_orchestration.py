import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app

@pytest.mark.asyncio
async def test_full_job_orchestration_all_modalities():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Create a Case
        create_res = await ac.post("/api/v1/cases")
        assert create_res.status_code == 201
        case_id = create_res.json()["case_id"]

        # 2. Analyze Phone
        phone_res = await ac.post(f"/api/v1/cases/{case_id}/phone", json={"phone_number": "+923001234567"})
        assert phone_res.status_code == 200
        phone_data = phone_res.json()
        assert phone_data["modality"] == "phone"
        assert phone_data["status"] == "insufficient_data"  # SRS §15.5 mandate

        # 3. Analyze Message
        msg_res = await ac.post(f"/api/v1/cases/{case_id}/message", json={"text": "Your HBL account is blocked! Urgent OTP required."})
        assert msg_res.status_code == 200
        msg_data = msg_res.json()
        assert msg_data["modality"] == "message"
        assert msg_data["status"] == "analyzed"
        assert msg_data["risk_score"] > 60.0
        assert msg_data["risk_label"] == "high"
        assert len(msg_data["signals"]) >= 2

        # 4. Analyze URL
        url_res = await ac.post(f"/api/v1/cases/{case_id}/url", json={"url": "http://phish-secure-hbl.pk/login"})
        assert url_res.status_code == 200
        url_data = url_res.json()
        assert url_data["modality"] == "url"
        assert url_data["status"] == "analyzed"
        assert url_data["risk_score"] >= 65.0
        assert url_data["risk_label"] == "high"

        # 5. Analyze Conversation
        conv_res = await ac.post(f"/api/v1/cases/{case_id}/conversation", json={
            "turns": [
                {"speaker": "Caller", "text": "Officer Tariq from Police. Your son is in custody."},
                {"speaker": "Caller", "text": "Transfer money immediately or he will be detained!"}
            ]
        })
        assert conv_res.status_code == 200
        conv_data = conv_res.json()
        assert conv_data["modality"] == "conversation"
        assert conv_data["status"] == "analyzed"
        assert conv_data["risk_label"] == "high"

        # 6. Analyze Voice
        voice_res = await ac.post(f"/api/v1/cases/{case_id}/voice")
        assert voice_res.status_code == 200
        voice_data = voice_res.json()
        assert voice_data["modality"] == "voice"
        assert voice_data["status"] == "analyzed"
        assert voice_data["metrics"]["pitch_f0_hz"] == 400.0

        # 7. Analyze Email
        email_res = await ac.post(f"/api/v1/cases/{case_id}/email", json={
            "sender": "Security Team <security@fbl-verify.com>",
            "subject": "Urgent: Verify your account immediately",
            "body": "Dear customer, your card is blocked. Click http://fbl-verify.com/login",
            "headers": {"Authentication-Results": "spf=fail dkim=fail"}
        })
        assert email_res.status_code == 200
        email_data = email_res.json()
        assert email_data["modality"] == "email"
        assert email_data["status"] == "analyzed"

        # 8. Check Pipeline Status Telemetry
        status_res = await ac.get(f"/api/v1/cases/{case_id}/status")
        assert status_res.status_code == 200
        stages = status_res.json()["pipeline_stages"]
        assert "phone" in stages
        assert "message" in stages
        assert "url" in stages
        assert "conversation" in stages
        assert "voice" in stages
        assert "email" in stages
        assert stages["message"]["stage"] == "completed"

        # 9. Check Compiled Forensic Report
        report_res = await ac.get(f"/api/v1/cases/{case_id}/report")
        assert report_res.status_code == 200
        report = report_res.json()
        assert report["case_id"] == case_id
        assert report["status"] == "completed"
        assert len(report["modality_results"]) == 6
        fusion = report["fusion_assessment"]
        assert fusion["status"] == "evaluated"
        assert fusion["fused_score"] > 60.0
        assert fusion["risk_category"] == "high"
        assert len(fusion["missing_modalities"]) == 0

@pytest.mark.asyncio
async def test_fault_isolation():
    """Verify that an isolated failure in one modality does not crash other tasks."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        create_res = await ac.post("/api/v1/cases")
        case_id = create_res.json()["case_id"]

        # Run URL normally
        url_res = await ac.post(f"/api/v1/cases/{case_id}/url", json={"url": "https://google.com"})
        assert url_res.status_code == 200
        assert url_res.json()["status"] == "analyzed"

        # Report should work even with single modality
        report_res = await ac.get(f"/api/v1/cases/{case_id}/report")
        assert report_res.status_code == 200
        report = report_res.json()
        assert len(report["fusion_assessment"]["missing_modalities"]) == 5
        assert "phone" in report["fusion_assessment"]["missing_modalities"]
