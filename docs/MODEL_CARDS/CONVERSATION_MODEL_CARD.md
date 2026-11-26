# Model Card: Multi-Turn Conversation Tactic Tagger & Escalation Detector
**Model Name:** `multiturn-tactic-tagger`  
**Version:** 1.0  
**Model Architecture:** Turn-by-Turn Psychological Tactic Tagger + Escalation Dynamics Analyzer  
**Task:** Multi-turn Social-Engineering and Extortion Conversation Risk Assessment  
**Authors:** Multimodal Impersonation & Fraud Analyzer Team  
**Date:** November 2026  

---

## 1. Model Overview & Purpose
This model analyzes multi-turn conversational exchanges (such as phone call transcripts, chat threads, and social media exchanges) to identify psychological manipulation patterns that cannot be detected from single isolated messages. It identifies role escalation, false authority intimidation, time pressure, and extortion demands over the duration of the dialogue.

---

## 2. Tactic Taxonomy & Detection Dimensions
1. **`AUTHORITY_IMPERSONATION`:** Falsely claiming police, judicial, military, or banking authority (e.g., *State Bank officer, Sub-Inspector Tariq, arrest warrant*).
2. **`ARTIFICIAL_URGENCY`:** Imposing acute time limits to force hurried compliance (e.g., *within 10 minutes, immediately, right now*).
3. **`OTP_CREDENTIAL_SOLICITATION`:** Direct or indirect attempts to extract one-time passwords, login PINs, or passcodes.
4. **`FINANCIAL_TRANSFER_DEMAND`:** Coercing immediate peer-to-peer mobile payments (EasyPaisa, JazzCash, wire transfer).
5. **`PLATFORM_MIGRATION`:** Attempting to move the conversation from recorded enterprise systems to encrypted private messaging.

---

## 3. Evaluation Benchmark
- **Dataset:** `tests/fixtures/synthetic_conversations.json` containing validated multi-turn Pakistani and global social-engineering dialogues and benign support baseline conversations.
- **Escalation Metric:** Compares the density and severity of manipulation tactics in opening turns versus closing turns.

---

## 4. Known Limitations & Intended Use
- **Distinct Modality:** This analyzer is designed strictly for multi-turn dialogues and must not be replaced by a single-message classifier.
- **Parsing Dependency:** Requires clear speaker role demarcation (`Caller:` / `User:`); raw unformatted text uses regex fallback heuristics.
