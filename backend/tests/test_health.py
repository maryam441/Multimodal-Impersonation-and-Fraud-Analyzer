import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app

@pytest.mark.asyncio
async def test_root_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "version" in data
    assert data["version"] == "3.0"

@pytest.mark.asyncio
async def test_health_telemetry():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "modalities" in data
    assert data["modalities"]["voice"] is True
    assert data["modalities"]["message"] is True
    assert data["modalities"]["url"] is True
    assert data["modalities"]["phone"] is True
    assert data["modalities"]["conversation"] is True

@pytest.mark.asyncio
async def test_models_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/models")
    assert response.status_code == 200
    data = response.json()
    assert "active_models" in data
    assert len(data["active_models"]) == 5
    modalities = {m["modality"] for m in data["active_models"]}
    assert modalities == {"voice", "message", "conversation", "url", "phone"}

@pytest.mark.asyncio
async def test_providers_status():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/providers/status")
    assert response.status_code == 200
    data = response.json()
    assert "external_phone_lookup" in data
    assert "live_url_fetching" in data
