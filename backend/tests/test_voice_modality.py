import os
import pytest
import numpy as np
from httpx import AsyncClient, ASGITransport
from backend.app.main import app
from ml.src.voice.feature_extractor import extract_35_acoustic_features, detect_temporal_anomaly_spans

def test_feature_extractor_35_metrics():
    # Generate 2 seconds of synthetic audio
    sr = 16000
    t = np.linspace(0, 2, sr * 2, endpoint=False)
    y = 0.5 * np.sin(2 * np.pi * 300 * t) + 0.1 * np.random.randn(len(t))
    feats = extract_35_acoustic_features(y.astype(np.float32), sr)

    assert len(feats) == 35
    assert "rms_energy" in feats
    assert "pitch_f0" in feats
    assert "jitter" in feats
    assert "shimmer" in feats
    assert "spectral_centroid" in feats
    assert "mfcc_1_mean" in feats
    assert "mfcc_13_std" in feats

def test_temporal_anomaly_spans():
    sr = 16000
    t = np.linspace(0, 3, sr * 3, endpoint=False)
    # Inject high-jitter anomaly in middle second
    y = 0.5 * np.sin(2 * np.pi * 350 * t)
    y[sr:sr*2] += 0.3 * np.random.randn(sr)
    spans = detect_temporal_anomaly_spans(y.astype(np.float32), sr)
    assert isinstance(spans, list)
    if spans:
        assert "timestamp_start_sec" in spans[0]
        assert "timestamp_end_sec" in spans[0]
        assert spans[0]["timestamp_start_sec"] < spans[0]["timestamp_end_sec"]

@pytest.mark.asyncio
async def test_voice_api_inference():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        create_res = await ac.post("/api/v1/cases")
        case_id = create_res.json()["case_id"]

        # Run voice analysis
        voice_res = await ac.post(f"/api/v1/cases/{case_id}/voice")
        assert voice_res.status_code == 200
        data = voice_res.json()

        assert data["modality"] == "voice"
        assert data["status"] == "analyzed"
        assert data["risk_score"] is not None
        assert data["risk_label"] in ["low", "medium", "high"]
        assert "pitch_f0_hz" in data["metrics"]
        assert "jitter" in data["metrics"]
        assert "duration_sec" in data["metrics"]
        assert len(data["signals"]) >= 1
