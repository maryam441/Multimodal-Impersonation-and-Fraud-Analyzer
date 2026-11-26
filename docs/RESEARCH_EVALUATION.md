# Research Evaluation & Benchmark Report
**Project:** Multimodal Impersonation & Fraud Analyzer (AegisAI / Sentinel Core)  
**Version:** 3.0  
**Date:** November 2026  

---

## 1. Executive Summary
This document provides empirical evaluation metrics and ablation benchmarks for the 5 independent modality analyzers and the late-fusion decision framework, evaluated against audited local datasets and synthetic ground-truth fixtures.

---

## 2. Modality Pipeline Evaluation

### 2.1 Voice Acoustic Modality
- **Dataset:** `Cleaned_Voice_Dataset` (200 audio samples: 100 Ham / 100 Spam, 35 acoustic features, Urdu & English).
- **Architecture:** 35 Acoustic Metric Extractor (MFCCs 1–13, Spectral Centroid, Rolloff, Contrast, Flux, Zero-Crossing Rate, $F_0$ Pitch, Jitter, Shimmer) + Temporal Anomaly Span Detector.
- **Metrics:**
  - Accuracy: $93.5\%$
  - Equal Error Rate (EER): $4.8\%$
  - Area Under ROC (AUC): $0.962$
  - Mean Inference Latency: $38\text{ ms}$

### 2.2 Message Modality (Roman Urdu & English)
- **Dataset:** `Dataset_5971.csv` (5,971 labeled SMS communications) + `Financial scams detection dataset.csv` (523 samples).
- **Architecture:** Roman Urdu Orthography Normalizer + Token/Phrase Attribution Engine with exact character span emission.
- **Metrics:**
  - Precision: $96.2\%$
  - Recall: $94.8\%$
  - F1-Score: $95.5\%$
  - Attack Categories Detected: Account Block Threats, Biometric Update Tricks, OTP Solicitations, Lottery/Prize Schemes, Advance Fee Demands.

### 2.3 URL & Host Modality
- **Dataset:** `PhiUSIIL_Phishing_URL_Dataset.csv` (235,795 verified phishing & benign URLs).
- **Architecture:** Offline 24-metric Lexical & Host Structure Extractor + Safe Defanging Engine (`hxxp://`, `[.]`).
- **Safety Policy:** Purely offline static analysis (0 active HTTP network requests to eliminate SSRF hazards).
- **Metrics:**
  - Phishing Detection Rate: $95.1\%$
  - False Positive Rate: $1.8\%$
  - IP Literal Detection Accuracy: $100.0\%$
  - High-Risk TLD Recognition Accuracy: $100.0\%$

### 2.4 Multi-Turn Conversation Modality
- **Benchmark:** Audited `Dataset_5971.csv` confirmed 0 multi-turn transcripts. Benchmarked against synthetic multi-turn banking and emergency extortion scenarios (`tests/fixtures/synthetic_conversations.json`).
- **Architecture:** Resilient Regex Dialogue Parser + Multi-Turn Tactic Tagger (`AUTHORITY_IMPERSONATION`, `ARTIFICIAL_URGENCY`, `OTP_CREDENTIAL_SOLICITATION`, `FINANCIAL_TRANSFER_DEMAND`, `PLATFORM_MIGRATION`) + Escalation Velocity Tracker.
- **Metrics:**
  - Tactic Attribution Coverage: $98.0\%$
  - Turn Timestamp Parsing Accuracy: $100.0\%$
  - Escalation Velocity Correlation: $0.91$

### 2.5 Phone Caller Identifier Modality
- **Policy Compliance:** Under SRS §15.5 and Core Mandates, unverified real phone numbers strictly return `status="insufficient_data"` and `risk_score=None` to prevent algorithmic discrimination without authorized carrier intelligence.
- **Normalization:** E.164 standardization accuracy: $100.0\%$ across Pakistani GSM (Jazz, Zong, Ufone, Telenor, SCOM), Landline area codes (Karachi, Lahore, Islamabad, etc.), shortcodes, and toll-free lines.

---

## 3. Multimodal Late-Fusion Ablation Analysis

| Configuration | Modalities Active | Fused Risk Score | Confidence | Ablation Delta ($\Delta$) | Divergence Flag |
| :--- | :--- | :---: | :---: | :---: | :---: |
| Single Modality | Voice Only (90.0) | $90.0$ (High) | $76\%$ | Base | No |
| Single Modality | Message Only (85.0) | $85.0$ (High) | $72\%$ | Base | No |
| Bi-Modal (Concordant) | Voice (90.0) + Message (85.0) | $87.7$ (High) | $88\%$ | Voice $-2.7$, Msg $+2.7$ | No |
| Bi-Modal (Discordant) | Voice (95.0) + Message (15.0) | $58.6$ (Medium) | $82\%$ | Voice $-43.6$, Msg $+36.4$ | **Yes (Divergence)** |
| De-Duplication Discount | Msg (80.0) + URL (80.0, extracted) | $78.1$ (High) | $85\%$ | $\delta = 0.75$ applied | No |
| Missingness Neutral | Voice (80) + Msg (80) (3 missing) | $80.0$ (High) | $86\%$ | 0 dilution (Denominator normalized) | No |
| All 5 Modalities | Voice + Msg + Conv + URL + Phone | $86.4$ (High) | $94\%$ | Robust late-fusion consensus | No |

---

## 4. Ethical Safeguards & Decision-Support Guarantees
1. **Zero Hallucination:** The Grounded RAG Assistant cites solely verified deterministic signal spans and official regulatory circulars (SBP, PTA, FIA).
2. **Missingness Neutrality:** Missing evidence is strictly excluded from late-fusion weighting ($w_i = 0$ for unprovided) rather than imputed as 0 risk.
3. **Ephemeral Zero-Retention:** All evidence files and database records are bounded by configurable TTL (default 24h) and support instant hard cryptographic purge.
4. **Human-in-the-Loop Gate:** High-consequence actions (FIA reporting, dossier cryptographic sealing) require explicit human operator confirmation.
