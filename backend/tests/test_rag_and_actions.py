"""
Unit and integration tests for Grounded RAG Assistant and Human-in-the-Loop Gate.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app


@pytest.mark.asyncio
async def test_assistant_query_grounding_and_citations():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        case_res = await ac.post("/api/v1/cases", json={"title": "RAG Assistant Test Case"})
        case_id = case_res.json()["case_id"]

        # 1. Analyze high-risk scam message with OTP & Account threat
        msg_payload = {"text": "Urgent: Your HBL account is blocked! Submit 6-digit OTP code now."}
        await ac.post(f"/api/v1/cases/{case_id}/message", json=msg_payload)

        # 2. Query Grounded Assistant
        query_res = await ac.post(
            f"/api/v1/cases/{case_id}/assistant/query",
            json={"query": "What should I do about this OTP request?"}
        )
        assert query_res.status_code == 200
        data = query_res.json()

        assert data["case_id"] == case_id
        assert data["is_grounded"] is True
        assert data["risk_category"] == "high"
        # Citations must reference SBP or relevant regulatory authority
        assert any("State Bank of Pakistan" in c for c in data["citations"])
        # Remedial actions must provide concrete steps
        assert len(data["remedial_actions"]) >= 1
        assert "OTP" in data["explanation"]


@pytest.mark.asyncio
async def test_export_case_dossier_sha256_seal():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        case_res = await ac.post("/api/v1/cases", json={"title": "Dossier Export Test"})
        case_id = case_res.json()["case_id"]

        # Add an analysis result
        await ac.post(f"/api/v1/cases/{case_id}/phone", json={"phone_number": "03001234567"})

        # Export Dossier
        export_res = await ac.post(f"/api/v1/cases/{case_id}/actions/export-dossier")
        assert export_res.status_code == 200
        data = export_res.json()

        assert data["case_id"] == case_id
        assert data["status"] == "sealed"
        assert len(data["sha256_digest"]) == 64  # valid SHA-256 hex string


@pytest.mark.asyncio
async def test_human_in_the_loop_gate_blocks_unconfirmed_action():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        case_res = await ac.post("/api/v1/cases", json={"title": "Human Gate Test"})
        case_id = case_res.json()["case_id"]

        # Attempt to report without explicit human confirmation
        blocked_res = await ac.post(
            f"/api/v1/cases/{case_id}/actions/report-fia",
            json={"user_confirmed": False, "investigator_notes": "Attempting unconfirmed dispatch"}
        )
        assert blocked_res.status_code == 400
        assert "Human confirmation required" in blocked_res.json()["detail"]

        # Execute with explicit human confirmation
        allowed_res = await ac.post(
            f"/api/v1/cases/{case_id}/actions/report-fia",
            json={"user_confirmed": True, "investigator_notes": "Investigator Maryam authorized dispatch"}
        )
        assert allowed_res.status_code == 200
        allowed_data = allowed_res.json()
        assert allowed_data["confirmed_by_human"] is True
        assert allowed_data["agency"] == "Federal Investigation Agency (FIA) - Cyber Crime Wing"
