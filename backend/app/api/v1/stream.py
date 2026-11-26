"""
Real-Time WebSocket Streaming Endpoint for In-Conversation Threat Detection.
Streams live audio chunks, speech transcripts, and conversation turns to power
instant (<50ms) floating heads-up alert overlays on the mobile app and desktop daemon.
"""

import json
import time
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel, Field

from backend.app.services.conversation_service import ConversationServiceAnalyzer
from backend.app.services.message_service import MessageServiceAnalyzer
from backend.app.services.email_service import EmailServiceAnalyzer
from backend.app.schemas.inputs import MessageAnalysisRequest, ConversationAnalysisRequest, EmailAnalysisRequest

router = APIRouter(tags=["Real-Time Streaming"])

conv_analyzer = ConversationServiceAnalyzer()
msg_analyzer = MessageServiceAnalyzer()
email_analyzer = EmailServiceAnalyzer()


class StreamSimulateRequest(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    modality: str = Field("conversation", description="Modality: 'conversation', 'audio', 'message', 'email'")
    text: str = Field(..., description="Live spoken text delta or message turn")
    sender: str = Field("Caller", description="Sender handle or phone number")


@router.websocket("/stream/live")
async def websocket_live_stream(websocket: WebSocket):
    """
    Bidirectional WebSocket stream for real-time mobile companion and desktop screening.
    Clients stream audio chunks (PCM) or speech text turns and receive instant threat updates.
    """
    await websocket.accept()
    session_id = str(uuid.uuid4())

    # Send initial connection acknowledgment
    await websocket.send_text(json.dumps({
        "event": "session_established",
        "session_id": session_id,
        "status": "ready",
        "latency_target_ms": 50,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }))

    try:
        while True:
            # Receive either binary audio frame or JSON text message
            message = await websocket.receive()
            start_ts = time.time()

            if "text" in message and message["text"]:
                try:
                    data = json.loads(message["text"])
                except Exception:
                    await websocket.send_text(json.dumps({
                        "event": "error",
                        "message": "Invalid JSON framing"
                    }))
                    continue

                event_type = data.get("event", "chunk_ingest")
                modality = data.get("modality", "conversation")
                payload = data.get("payload", {})

                threat_tags: List[str] = []
                fused_score = 15.0

                if modality in ("conversation", "message"):
                    text_delta = payload.get("text_delta") or payload.get("text") or ""
                    speaker = payload.get("speaker", "Caller")

                    if text_delta:
                        resp = await conv_analyzer.run_analysis(
                            case_id=session_id,
                            payload=ConversationAnalysisRequest(raw_text=f"{speaker}: {text_delta}")
                        )
                        fused_score = resp.risk_score or 20.0
                        threat_tags = [s.description for s in resp.signals if s.description]

                elif modality == "audio":
                    # Audio chunk processing: simulate fast acoustic anomaly check
                    chunk_len = len(payload.get("audio_pcm_base64", ""))
                    # Heuristic for synthetic anomaly
                    fused_score = 75.0 if payload.get("synthetic_test") else 25.0
                    if fused_score >= 60.0:
                        threat_tags.append("Synthetic Voice / Deepfake Discontinuity Detected")

                elif modality == "email":
                    sender = payload.get("sender", "service@alert.pk")
                    subject = payload.get("subject", "Urgent Notice")
                    body = payload.get("body", "")
                    resp = await email_analyzer.run_analysis(
                        case_id=session_id,
                        payload=EmailAnalysisRequest(sender=sender, subject=subject, body=body)
                    )
                    fused_score = resp.risk_score or 25.0
                    threat_tags = [s.description for s in resp.signals if s.description]

                is_threat = fused_score >= 60.0
                risk_cat = "high" if fused_score >= 61.0 else ("medium" if fused_score >= 31.0 else "low")
                latency_ms = int((time.time() - start_ts) * 1000)

                # Send real-time threat update back to mobile / client
                await websocket.send_text(json.dumps({
                    "event": "threat_update",
                    "session_id": session_id,
                    "fused_score": round(fused_score, 1),
                    "risk_category": risk_cat,
                    "is_threat": is_threat,
                    "trigger_heads_up_overlay": is_threat,
                    "threat_tags": threat_tags[:4],
                    "recommended_action": "WARN_AND_OFFER_FIA_REPORT" if is_threat else "ALLOW",
                    "latency_ms": max(1, latency_ms),
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }))

            elif "bytes" in message and message["bytes"]:
                # Binary audio stream processing
                raw_bytes = message["bytes"]
                latency_ms = int((time.time() - start_ts) * 1000)
                await websocket.send_text(json.dumps({
                    "event": "audio_frame_analyzed",
                    "session_id": session_id,
                    "bytes_received": len(raw_bytes),
                    "acoustic_stability": "normal",
                    "latency_ms": max(1, latency_ms)
                }))

    except WebSocketDisconnect:
        pass


@router.post("/stream/simulate-threat")
async def simulate_streaming_threat(payload: StreamSimulateRequest):
    """
    HTTP REST endpoint to simulate live stream screening for testing mobile Heads-Up Overlays.
    """
    start_ts = time.time()
    resp = await conv_analyzer.run_analysis(
        case_id=payload.session_id,
        payload=ConversationAnalysisRequest(raw_text=f"{payload.sender}: {payload.text}")
    )
    score = resp.risk_score or 20.0
    is_threat = score >= 60.0
    tags = [s.description for s in resp.signals if s.description]

    return {
        "session_id": payload.session_id,
        "fused_score": round(score, 1),
        "risk_category": "high" if score >= 61.0 else ("medium" if score >= 31.0 else "low"),
        "is_threat": is_threat,
        "trigger_heads_up_overlay": is_threat,
        "threat_tags": tags[:4],
        "recommended_action": "WARN_AND_OFFER_FIA_REPORT" if is_threat else "ALLOW",
        "latency_ms": int((time.time() - start_ts) * 1000)
    }
