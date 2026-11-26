"""
Tests for Ambient Real-Time Threat Protection and FIA Cybercrime Reporting Pipeline.
Verifies low-latency ambient scanning, PECA 2016 legal charge generation,
and strict Human-in-the-Loop authorization enforcement.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app

@pytest.mark.asyncio
async def test_ambient_scan_detects_threat_and_returns_case_id():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "content": "Urgent: Bank Account blocked. Call +923001234567 or verify at http://fake-bank-login.pk",
            "source": "whatsapp",
            "sender": "+923001234567"
        }
        res = await client.post("/api/v1/ambient/scan", json=payload)
        assert res.status_code == 200
        data = res.json()

        assert data["is_threat"] is True
        assert data["risk_score"] > 30.0
        assert data["can_report_fia"] is True
        assert "case_id" in data
        assert data["source"] == "whatsapp"
        assert len(data["threat_tags"]) > 0


@pytest.mark.asyncio
async def test_ambient_scan_safe_text():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "content": "Assalam-o-Alaikum, are we meeting for lunch today at 1pm?",
            "source": "whatsapp",
            "sender": "Friend"
        }
        res = await client.post("/api/v1/ambient/scan", json=payload)
        assert res.status_code == 200
        data = res.json()

        assert data["is_threat"] is False
        assert data["risk_score"] <= 30.0
        assert data["recommended_action"] == "ALLOW"


@pytest.mark.asyncio
async def test_human_gate_blocks_unauthorized_fia_report():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Generate an ambient case
        scan_res = await client.post("/api/v1/ambient/scan", json={
            "content": "Your account is frozen. Send OTP immediately.",
            "source": "sms"
        })
        case_id = scan_res.json()["case_id"]

        # 2. Attempt dispatch with user_confirmed=False
        report_res = await client.post("/api/v1/incidents/direct-report", json={
            "case_id": case_id,
            "user_confirmed": False,
            "source": "sms"
        })
        assert report_res.status_code == 400
        assert "Human verification required" in report_res.json()["detail"]


@pytest.mark.asyncio
async def test_direct_fia_report_registers_peca_charges_and_sha256():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Scan high-risk scam
        scan_res = await client.post("/api/v1/ambient/scan", json={
            "content": "FIA Warning: Warrant issued against your CNIC. Pay fine at http://easypaisa-secure.pk",
            "source": "whatsapp",
            "sender": "+923121112233"
        })
        case_id = scan_res.json()["case_id"]

        # 2. Confirm and dispatch with Human Authorization
        report_res = await client.post("/api/v1/incidents/direct-report", json={
            "case_id": case_id,
            "user_confirmed": True,
            "operator_notes": "Victim verified fake police extortion message",
            "source": "whatsapp",
            "accused_identifier": "+923121112233"
        })
        assert report_res.status_code == 200
        rep = report_res.json()

        assert rep["success"] is True
        assert rep["reference_no"].startswith("FIA-CCW-")
        assert len(rep["sha256_digest"]) == 64
        assert rep["status"] == "REGISTERED"
        assert len(rep["statutory_sections"]) > 0

        # Check that PECA charges include fraud or impersonation
        section_titles = [s["title"] for s in rep["statutory_sections"]]
        assert any("Fraud" in t or "Forgery" in t or "Identity" in t for t in section_titles)

        # 3. Download Affidavit
        ref = rep["reference_no"]
        down_res = await client.get(f"/api/v1/incidents/{ref}/download")
        assert down_res.status_code == 200
        assert "GOVERNMENT OF PAKISTAN" in down_res.text
        assert ref in down_res.text
        assert "PECA 2016" in down_res.text


@pytest.mark.asyncio
async def test_ambient_history_feed():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/v1/ambient/history")
        assert res.status_code == 200
        items = res.json()
        assert isinstance(items, list)
        assert len(items) > 0
