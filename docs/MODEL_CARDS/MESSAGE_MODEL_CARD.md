# Model Card: Roman Urdu & English SMS Scam Classifier
**Model Name:** `roman-urdu-english-sms-classifier`  
**Version:** 1.0  
**Model Architecture:** TF-IDF N-Gram Vectorizer + Linear Support Vector Machine & Rule Attribution Engine  
**Task:** Binary Scam & Social Engineering Text Classification  
**Authors:** Multimodal Impersonation & Fraud Analyzer Team  
**Date:** November 2026  

---

## 1. Model Overview & Purpose
This model provides text-based scam risk decision support for short message communications (SMS, WhatsApp, and messaging apps). It detects banking impersonation, biometric deactivation scams, lottery fraud, and advance-fee solicitation in both **Roman Urdu** (Urdu written in Latin alphabet) and **English**.

---

## 2. Training & Evaluation Datasets
1. **Primary Dataset (`Dataset_5971.csv`):**
   - Source: Academic paper published in **LREC-COLING 2024** (`2024.lrec-main.422.pdf`).
   - Total Volume: 5,971 messages.
   - Class Distribution: 4,844 Ham (81.1%), 1,127 Malicious/Smishing (18.9%).
   - Language Representation: Roman Urdu conversational & promotional texts + Pakistani English SMS.
2. **Supplemental Financial Dataset:**
   - Total Volume: 523 messages (310 Scam, 213 Ham).
   - Domain: Bank OTP solicitation, loan processing fees, account lockout alerts.

---

## 3. Preprocessing & Entity Masking
- URL Entity Masking: Converts URLs to `<URL>` tokens to decouple link analysis from textual social engineering.
- Phone Entity Masking: Converts phone numbers to `<PHONE>` tokens.
- Numeric Normalization: Preserves monetary amounts while masking random transaction IDs.
- Whitespace & Punctuation Cleaning.

---

## 4. Explainable Phrase Attribution Engine
The inference adapter extracts exact character spans `[start, end]` for trigger tokens:
- `ACCOUNT_BLOCK_THREAT`: e.g. "account blocked", "acc freeze", "khata band".
- `BIOMETRIC_UPDATE_SCAM`: e.g. "biometric update krain", "fingerprint tasdeeq".
- `OTP_SOLICITATION`: e.g. "otp code share krain", "secret pin".
- `LOTTERY_PRIZE_FRAUD`: e.g. "jeeto pakistan inaam", "won Rs 500,000".
- `ARTIFICIAL_URGENCY`: e.g. "fori", "immediately", "within 24 hours".

---

## 5. Known Limitations & Linguistic Boundaries
- **No Standardized Orthography:** Roman Urdu has no single official spelling dictionary (e.g. `karo`, `kro`, `karain`). The engine uses token and sub-word matching to mitigate spelling drift.
- **Single-Message Scope:** Evaluates isolated messages; multi-turn conversational context is analyzed separately by the Conversation Modality Analyzer.
