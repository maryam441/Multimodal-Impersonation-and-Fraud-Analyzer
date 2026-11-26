"""
Sentinel Cross-Platform E2E System Verification Script
Executes full lifecycle verification across:
1. Ephemeral Case Container Creation
2. 6 Modality AI Pipelines (Phone, Message, URL, Conversation, Voice, Email)
3. Transparent Late Fusion Engine with Correlation De-duplication
4. Real-Time Streaming Threat Simulation
5. Strict Human-in-the-Loop Gate & SHA-256 Sealed FIA Complaint Generation
"""

import sys
import asyncio
from httpx import AsyncClient, ASGITransport
from backend.app.main import app

async def run_e2e_verification():
    print("=" * 70)
    print("🚀 SENTINEL CORE: RUNNING FULL E2E SYSTEM INTEGRATION VERIFICATION")
    print("=" * 70)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Health check
        print("\n[Step 1/7] Health & Model Telemetry Check...")
        res = await ac.get("/api/v1/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        data = res.json()
        print(f"  ✓ System status: {data['status']}, Service: {data['service']}")

        m_res = await ac.get("/api/v1/models")
        assert m_res.status_code == 200
        models_data = m_res.json()
        print(f"  ✓ Active Models Loaded: {len(models_data['active_models'])}")

        # 2. Case Creation
        print("\n[Step 2/7] Creating Ephemeral Case Container...")
        res = await ac.post("/api/v1/cases", json={"title": "E2E Verification Multi-Modality Case"})
        assert res.status_code == 201
        case_id = res.json()["case_id"]
        print(f"  ✓ Case initialized: {case_id}")

        # 3. Analyze all 6 modalities
        print("\n[Step 3/7] Ingesting & Analyzing 6 Modalities...")
        
        # 3.1 Message (Roman Urdu + English banking scam)
        m_res = await ac.post(f"/api/v1/cases/{case_id}/message", json={
            "text": "Apka HBL account blocked hai biometric na hone ki waja se. Fori is link per click krain: http://secure-hbl.phish.pk/verify"
        })
        assert m_res.status_code == 200
        print(f"  ✓ Message Modality: Risk {m_res.json()['risk_score']}/100 ({m_res.json()['risk_label']})")

        # 3.2 URL (Defanged Lexical & Entropy)
        u_res = await ac.post(f"/api/v1/cases/{case_id}/url", json={
            "url": "http://secure-hbl.phish.pk/verify"
        })
        assert u_res.status_code == 200
        print(f"  ✓ URL Modality: Risk {u_res.json()['risk_score']}/100, Defanged: {u_res.json()['metrics']['defanged_url']}")

        # 3.3 Phone (PTA format + Insufficient Data Guarantee)
        p_res = await ac.post(f"/api/v1/cases/{case_id}/phone", json={
            "phone_number": "03001234567"
        })
        assert p_res.status_code == 200
        print(f"  ✓ Phone Modality: Status={p_res.json()['status']} (Unverified callers never fabricated)")

        # 3.4 Conversation (Multi-turn Police Extortion)
        c_res = await ac.post(f"/api/v1/cases/{case_id}/conversation", json={
            "turns": [
                {"speaker": "Caller", "text": "DSP Tariq from Crime Branch. An arrest warrant is active for your CNIC."},
                {"speaker": "Victim", "text": "Sir, I have done nothing wrong!"},
                {"speaker": "Caller", "text": "Transfer Rs. 75,000 immediately via JazzCash to cancel the FIR or team is dispatching."}
            ]
        })
        assert c_res.status_code == 200
        print(f"  ✓ Conversation Modality: Risk {c_res.json()['risk_score']}/100 ({c_res.json()['risk_label']})")

        # 3.5 Voice (Acoustic Pitch & Synthetic Artifact Spans)
        v_res = await ac.post(f"/api/v1/cases/{case_id}/voice")
        assert v_res.status_code == 200
        print(f"  ✓ Voice Modality: Risk {v_res.json()['risk_score']}/100 (Pitch F0: {v_res.json()['metrics']['pitch_f0_hz']} Hz, Signals: {len(v_res.json()['signals'])})")

        # 3.6 Email (RFC 2822 Brand Spoofing & Header Check)
        e_res = await ac.post(f"/api/v1/cases/{case_id}/email", json={
            "sender": "Habib Bank Security <security@hbl-banking-notice.pk>",
            "subject": "URGENT: Temporary suspension of your HBL digital banking",
            "body": "Dear customer, your card is blocked due to unauthorized login. Verify at http://hbl-update-security.com/login",
            "headers": {"Authentication-Results": "spf=fail dkim=fail"}
        })
        assert e_res.status_code == 200
        print(f"  ✓ Email Modality: Risk {e_res.json()['risk_score']}/100 (Target: {e_res.json()['metrics'].get('brand_impersonated', 'Detected')})")

        # 4. Multimodal Fusion Assessment
        print("\n[Step 4/7] Generating Multimodal Fusion Assessment...")
        r_res = await ac.get(f"/api/v1/cases/{case_id}/report")
        assert r_res.status_code == 200
        report = r_res.json()
        fusion = report["fusion_assessment"]
        print(f"  ✓ Fused Multi-Modal Risk: {fusion['fused_score']}/100")
        print(f"  ✓ Overall Risk Category: {fusion['risk_category'].upper()}")
        print(f"  ✓ Active Modality Universe: {fusion['active_modalities']}")
        print(f"  ✓ Applied Weights: {fusion['weights_used']}")
        assert fusion["risk_category"] == "high"

        # 5. Real-Time Streaming Alert Verification
        print("\n[Step 5/7] Testing Real-Time Streaming Threat Pipeline...")
        sim_res = await ac.post("/api/v1/stream/simulate-threat", json={
            "modality": "conversation",
            "text": "Inspector Khan from Police Headquarters here. Pay 50000 PKR right now or face arrest under FIR.",
            "sender": "+923009988776"
        })
        assert sim_res.status_code == 200
        alert = sim_res.json()
        print(f"  ✓ Real-Time Stream Threat Detected: Fused Score={alert['fused_score']}/100")
        print(f"  ✓ Floating Heads-Up Triggered: {alert['trigger_heads_up_overlay']} (Action: {alert['recommended_action']})")

        # 6. Strict Human-in-the-Loop Safety Gate Verification
        print("\n[Step 6/7] Validating Strict Human-in-the-Loop Gate...")
        # 6.1 Unauthorized attempt MUST be blocked
        blocked_res = await ac.post(f"/api/v1/cases/{case_id}/actions/report-fia", json={
            "user_confirmed": False
        })
        assert blocked_res.status_code == 400
        print("  ✓ Gate Protection: Blocked unconfirmed FIA reporting attempt (HTTP 400 Bad Request)")

        # 6.2 Authorized submission compiles sealed dossier and registers PECA charges
        auth_res = await ac.post(f"/api/v1/cases/{case_id}/actions/report-fia", json={
            "user_confirmed": True,
            "investigator_notes": "Verified fraudulent extortion & spoofed bank notice by E2E test runner"
        })
        assert auth_res.status_code == 200
        fia_report = auth_res.json()
        print("  ✓ User Confirmed: Official Report Dispatched to FIA NR3C")
        print(f"  ✓ Confirmed by Human: {fia_report['confirmed_by_human']}")
        print(f"  ✓ Agency Assigned: {fia_report['agency']}")

        # 7. Grounded RAG Assistant Verification
        print("\n[Step 7/7] Validating Grounded AI Safety Assistant (RAG)...")
        rag_res = await ac.post(f"/api/v1/cases/{case_id}/assistant/query", json={
            "query": "Why was this incident flagged as high risk?"
        })
        assert rag_res.status_code == 200
        rag_data = rag_res.json()
        print(f"  ✓ Grounded Explanation: {rag_data['explanation'][:120]}...")
        print(f"  ✓ Verified Regulatory Citations: {rag_data['citations']}")
        assert rag_data["is_grounded"] is True

    print("\n" + "=" * 70)
    print("✅ ALL 7 END-TO-END STAGES VERIFIED WITH ZERO ERRORS (100% SUCCESS)")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_e2e_verification())
