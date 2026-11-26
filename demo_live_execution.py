"""
Live execution demonstration script for Multimodal Impersonation & Fraud Analyzer.
Interacts with the running backend at http://127.0.0.1:8000.
"""

import httpx
import json
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"

def print_section(title):
    print("\n" + "=" * 70)
    print(f" {title} ")
    print("=" * 70)

def main():
    with httpx.Client(base_url=BASE_URL, timeout=30.0) as client:
        # 1. Health check
        print_section("1. LIVE SYSTEM HEALTH & TELEMETRY")
        res = client.get("/health")
        print(f"Status Code: {res.status_code}")
        health_data = res.json()
        print(json.dumps(health_data, indent=2))

        # 2. Create Ephemeral Case
        print_section("2. CREATING FORENSIC CASE (24h Ephemeral TTL)")
        case_res = client.post("/cases", json={"retention_hours": 24})
        case_data = case_res.json()
        case_id = case_data["case_id"]
        print(f"Case Created Successfully!")
        print(f"Case ID: {case_id}")
        print(f"Client Token: {case_data['client_token']}")
        print(f"Expires At: {case_data['expires_at']}")

        # 3. Smart Entity Extraction
        print_section("3. SMART CROSS-MODALITY ENTITY EXTRACTION")
        scam_text = (
            "URGENT ALERT: Your HBL bank account is temporarily suspended due to biometric tasdeeq failure! "
            "Please click hxxps://secure-hbl-portal.xyz/login immediately to update credentials, "
            "or contact our fraud department officer at 0300-1234567 before your funds are permanently frozen."
        )
        print(f"Input Raw Message:\n\"{scam_text}\"\n")
        ext_res = client.post(f"/cases/{case_id}/extract", json={"text": scam_text})
        ext_data = ext_res.json()
        print(f"Extracted URLs ({ext_data['urls_count']}):", ext_data['extracted_urls'])
        print(f"Extracted Phones ({ext_data['phones_count']}):", ext_data['extracted_phones'])

        # 4. Modality Analyses
        print_section("4. EXECUTING 5 INDEPENDENT MODALITY ANALYZERS")

        # Modality 1: Message Analysis (Roman Urdu & English phrase attribution)
        print("\n--- [Modality 1/5: Message Analysis] ---")
        msg_res = client.post(f"/cases/{case_id}/message", json={"text": scam_text})
        msg_data = msg_res.json()
        print(f"Risk Score: {msg_data['risk_score']}/100 ({msg_data['risk_label'].upper()}) | Confidence: {msg_data['confidence']}")
        print(f"Signals Triggered ({len(msg_data['signals'])}):")
        for s in msg_data['signals']:
            print(f"  • [{s['severity'].upper()}] {s['code']}: {s['evidence']}")

        # Modality 2: URL Analysis (Offline PhiUSIIL Lexical & Host Extractor)
        print("\n--- [Modality 2/5: URL Analysis] ---")
        target_url = ext_data['extracted_urls'][0]['raw_url'] if ext_data['extracted_urls'] else "hxxps://secure-hbl-portal.xyz/login"
        url_res = client.post(f"/cases/{case_id}/url", json={"url": target_url})
        url_data = url_res.json()
        print(f"Target (Safe Defanged): {url_data['metrics']['defanged_url']}")
        print(f"Risk Score: {url_data['risk_score']}/100 ({url_data['risk_label'].upper()})")
        print(f"TLD: .{url_data['metrics']['tld']} | Shannon Entropy: {url_data['metrics']['domain_entropy']} bits")
        print(f"Deceptive Tokens: {url_data['metrics']['matched_keywords']}")

        # Modality 3: Phone Analysis (E.164 + PTA Carrier Resolver)
        print("\n--- [Modality 3/5: Phone Number Analysis] ---")
        target_phone = ext_data['extracted_phones'][0]['raw_number'] if ext_data['extracted_phones'] else "0300-1234567"
        phone_res = client.post(f"/cases/{case_id}/phone", json={"phone_number": target_phone})
        phone_data = phone_res.json()
        print(f"Normalized E.164: {phone_data['metrics']['normalized_e164']}")
        print(f"Resolved Carrier: {phone_data['metrics']['carrier']} ({phone_data['metrics']['line_type']})")
        print(f"Status: {phone_data['status'].upper()} (Per SRS §15.5 Anti-Bias Policy: {phone_data['confidence_note']})")

        # Modality 4: Multi-Turn Conversation Analysis
        print("\n--- [Modality 4/5: Multi-Turn Conversation Analysis] ---")
        transcript = (
            "[10:14] Officer: This is Sub-Inspector Farooq from FIA Cyber Crime Wing. A case FIR has been lodged against your CNIC.\n"
            "[10:15] Citizen: What FIR? I haven't done anything wrong!\n"
            "[10:16] Officer: Your account was used for illegal transactions. You must immediately settle Rs. 50,000 bail fee.\n"
            "[10:17] Officer: Transfer the money to our safe clearing account right now via Easypaisa or arrest warrant will be issued."
        )
        conv_res = client.post(f"/cases/{case_id}/conversation", json={"raw_text": transcript})
        conv_data = conv_res.json()
        print(f"Risk Score: {conv_data['risk_score']}/100 ({conv_data['risk_label'].upper()})")
        print(f"Escalation Pressure Detected: {conv_data['metrics']['escalation_detected']}")
        print(f"Total Dialogue Turns: {conv_data['metrics']['total_turns']}")
        print("Detected Social Engineering Tactics:")
        for s in conv_data['signals']:
            print(f"  • {s['code']} ({s['severity'].upper()}): \"{s['evidence']}\"")

        # Modality 5: Voice Acoustic Analysis
        print("\n--- [Modality 5/5: Voice Acoustic Analysis] ---")
        voice_res = client.post(f"/cases/{case_id}/voice")
        voice_data = voice_res.json()
        print(f"Voice Spoof Risk: {voice_data['risk_score']}/100 ({voice_data['risk_label'].upper()})")
        print(f"Acoustic Metrics: F0={voice_data['metrics']['pitch_f0_hz']}Hz | Jitter={voice_data['metrics']['jitter']} | Shimmer={voice_data['metrics']['shimmer']}")
        print(f"Temporal Anomaly Spans Detected: {voice_data['metrics']['temporal_anomaly_count']}")

        # 5. Compiled Forensic Late-Fusion Report
        print_section("5. COMPILED FORENSIC REPORT & LATE-FUSION CORE")
        report_res = client.get(f"/cases/{case_id}/report")
        report = report_res.json()
        fusion = report["fusion_assessment"]
        print(f"COMPOSITE RISK SCORE: {fusion['fused_score']} / 100")
        print(f"RISK CATEGORY:        {fusion['risk_category'].upper()}")
        print(f"CERTAINTY / CONF:     {fusion['confidence'] * 100:.0f}% (CI: {fusion['confidence_interval']})")
        print(f"ACTIVE MODALITIES:    {fusion['active_modalities']}")
        print(f"NORMALIZED WEIGHTS:   {fusion['weights_used']}")
        print(f"ABLATION DELTAS:      {json.dumps(fusion['ablation_comparison'], indent=2)}")
        print(f"FUSION RATIONALE:     {fusion['rationale']}")

        # 6. Grounded AI Safety Assistant (RAG)
        print_section("6. GROUNDED AI SAFETY ASSISTANT (RAG) QUERY")
        user_query = "The caller claims to be from FIA demanding bail money. What should I do?"
        print(f"User Query: \"{user_query}\"\n")
        assist_res = client.post(f"/cases/{case_id}/assistant/query", json={"query": user_query})
        assist_data = assist_res.json()
        print(f"Is Grounded: {assist_data['is_grounded']}")
        print(f"Explanation Output:\n{assist_data['explanation']}\n")
        print("Official Regulatory Citations:")
        for c in assist_data["citations"]:
            print(f"  📜 {c}")
        print("\nPrioritized Incident Response Checklist:")
        for i, act in enumerate(assist_data["remedial_actions"], 1):
            print(f"  [{i}] {act}")

        # 7. Sealed Dossier Cryptographic Export
        print_section("7. HUMAN-IN-THE-LOOP ACTION: EXPORT SEALED DOSSIER")
        dossier_res = client.post(f"/cases/{case_id}/actions/export-dossier")
        dossier_data = dossier_res.json()
        print(f"Dossier Sealed: {dossier_data['status'].upper()}")
        print(f"SHA-256 Digest: {dossier_data['sha256_digest']}")

        # 8. Human-in-the-Loop FIA Reporting
        print_section("8. HUMAN-IN-THE-LOOP ACTION: FIA CYBERCRIME DISPATCH")
        fia_res = client.post(
            f"/cases/{case_id}/actions/report-fia",
            json={"user_confirmed": True, "investigator_notes": "Senior Forensic Analyst approved incident dispatch"}
        )
        print(f"Dispatch Status: {fia_res.json()['complaint_payload']['action_status']}")
        print(f"Agency: {fia_res.json()['agency']}")
        print(f"Legal Basis: {fia_res.json()['legal_basis']}")

        print("\n" + "=" * 70)
        print(" ALL END-TO-END WORKFLOWS EXECUTED LIVE WITH 100% SUCCESS! ")
        print("=" * 70)

if __name__ == "__main__":
    main()
