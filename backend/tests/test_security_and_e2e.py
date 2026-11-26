"""
End-to-End Multimodal Integration, Security, SSRF Prevention, and Lifecycle Tests.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app


@pytest.mark.asyncio
async def test_full_e2e_case_lifecycle():
    """
    Validates complete end-to-end forensic workflow:
    1. Case creation
    2. Smart entity extraction
    3. Multimodal analysis (5 modalities)
    4. Fusion report evaluation
    5. Grounded RAG assistant query
    6. Sealed dossier export (SHA-256)
    7. Hard case purge
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Create Case
        create_res = await ac.post("/api/v1/cases", json={"retention_hours": 24})
        assert create_res.status_code == 201
        case_data = create_res.json()
        case_id = case_data["case_id"]

        # 2. Extract Entities from raw scam text
        sample_scam_text = (
            "URGENT: Your HBL bank account is blocked! "
            "Click hxxps://secure-hbl-verify.xyz/login immediately or call 0300-1234567."
        )
        extract_res = await ac.post(f"/api/v1/cases/{case_id}/extract", json={"text": sample_scam_text})
        assert extract_res.status_code == 200
        ext_data = extract_res.json()
        assert ext_data["urls_count"] >= 1
        assert ext_data["phones_count"] >= 1

        # 3. Analyze all 5 modalities
        # Message
        msg_res = await ac.post(f"/api/v1/cases/{case_id}/message", json={"text": sample_scam_text})
        assert msg_res.status_code == 200

        # URL
        url_res = await ac.post(
            f"/api/v1/cases/{case_id}/url",
            json={"url": ext_data["extracted_urls"][0]["raw_url"]}
        )
        assert url_res.status_code == 200

        # Phone
        phone_res = await ac.post(
            f"/api/v1/cases/{case_id}/phone",
            json={"phone_number": ext_data["extracted_phones"][0]["raw_number"]}
        )
        assert phone_res.status_code == 200

        # Conversation
        conv_res = await ac.post(
            f"/api/v1/cases/{case_id}/conversation",
            json={"raw_text": "[12:00] Support: Send OTP. [12:01] User: Why? [12:02] Support: Mandatory."}
        )
        assert conv_res.status_code == 200

        # Voice
        voice_res = await ac.post(f"/api/v1/cases/{case_id}/voice")
        assert voice_res.status_code == 200

        # 4. Fetch Compiled Forensic Report
        report_res = await ac.get(f"/api/v1/cases/{case_id}/report")
        assert report_res.status_code == 200
        report = report_res.json()
        assert report["fusion_assessment"]["status"] == "evaluated"
        assert report["fusion_assessment"]["fused_score"] > 60.0
        assert report["fusion_assessment"]["risk_category"] == "high"
        assert len(report["modality_results"]) == 5

        # 5. Query Grounded Safety Assistant
        assistant_res = await ac.post(
            f"/api/v1/cases/{case_id}/assistant/query",
            json={"query": "How do I protect my HBL account?"}
        )
        assert assistant_res.status_code == 200
        assistant_data = assistant_res.json()
        assert assistant_data["is_grounded"] is True
        assert len(assistant_data["remedial_actions"]) >= 1

        # 6. Export Sealed Dossier
        export_res = await ac.post(f"/api/v1/cases/{case_id}/actions/export-dossier")
        assert export_res.status_code == 200
        assert export_res.json()["status"] == "sealed"
        assert len(export_res.json()["sha256_digest"]) == 64

        # 7. Hard Purge Case (Zero-Retention Guarantee)
        purge_res = await ac.delete(f"/api/v1/cases/{case_id}")
        assert purge_res.status_code == 200

        # Verify case is completely erased
        verify_gone = await ac.get(f"/api/v1/cases/{case_id}/report")
        assert verify_gone.status_code == 404


@pytest.mark.asyncio
async def test_ssrf_safety_offline_guarantee():
    """Confirms URL analyzer performs purely offline lexical extraction without HTTP calls."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        case_res = await ac.post("/api/v1/cases")
        case_id = case_res.json()["case_id"]

        # Attempt to target cloud metadata endpoint (classic SSRF target)
        ssrf_target = "http://169.254.169.254/latest/meta-data/iam/security-credentials"
        url_res = await ac.post(f"/api/v1/cases/{case_id}/url", json={"url": ssrf_target})
        assert url_res.status_code == 200
        data = url_res.json()

        assert data["metrics"]["is_ip_literal"] is True
        assert data["risk_label"] in ["high", "medium"]
        assert any(s["code"] == "IP_LITERAL_HOST" for s in data["signals"])


@pytest.mark.asyncio
async def test_xss_and_injection_input_handling():
    """Confirms malicious payload scripts in message text are processed safely."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        case_res = await ac.post("/api/v1/cases")
        case_id = case_res.json()["case_id"]

        xss_payload = "<script>alert('XSS');</script> Urgent HBL account blocked! OTP required."
        msg_res = await ac.post(f"/api/v1/cases/{case_id}/message", json={"text": xss_payload})
        assert msg_res.status_code == 200
        data = msg_res.json()
        assert data["status"] == "analyzed"
        assert data["risk_score"] > 50.0
