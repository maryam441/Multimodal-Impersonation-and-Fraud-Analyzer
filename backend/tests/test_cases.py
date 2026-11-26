import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app

@pytest.mark.asyncio
async def test_case_lifecycle():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Create Case
        create_res = await ac.post("/api/v1/cases", json={"retention_hours": 12})
        assert create_res.status_code == 201
        data = create_res.json()
        assert "case_id" in data
        assert "client_token" in data
        assert data["status"] == "created"
        case_id = data["case_id"]

        # 2. Get Case
        get_res = await ac.get(f"/api/v1/cases/{case_id}")
        assert get_res.status_code == 200
        summary = get_res.json()
        assert summary["case_id"] == case_id
        assert summary["status"] == "created"
        assert summary["active_modalities"] == []
        assert summary["is_expired"] is False

        # 3. Smart Entity Extraction
        sample_text = (
            "Dear customer, your bank account is suspended! Please visit http://secure-hbl.phish.pk/verify "
            "or contact Officer Asad at 0300-1234567 immediately to avoid permanent block."
        )
        extract_res = await ac.post(f"/api/v1/cases/{case_id}/extract", json={"text": sample_text})
        assert extract_res.status_code == 200
        extract_data = extract_res.json()
        assert extract_data["urls_count"] >= 1
        assert extract_data["phones_count"] >= 1

        # Verify URL is safely defanged
        first_url = extract_data["extracted_urls"][0]
        assert "hxxp" in first_url["defanged_url"]
        assert "[.]" in first_url["defanged_url"]

        # Verify Pakistani carrier detection
        first_phone = extract_data["extracted_phones"][0]
        assert first_phone["carrier_guess"] == "Jazz / Mobilink"
        assert first_phone["country_code"] == "PK"

        # 4. Purge Case (Hard Deletion)
        purge_res = await ac.delete(f"/api/v1/cases/{case_id}")
        assert purge_res.status_code == 200
        purge_data = purge_res.json()
        assert purge_data["status"] == "purged"

        # 5. Verify 404 after Purge
        subsequent_get = await ac.get(f"/api/v1/cases/{case_id}")
        assert subsequent_get.status_code == 404
