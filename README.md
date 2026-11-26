# Multimodal Impersonation & Fraud Analyzer (AegisAI / Sentinel Core)

> **Flagship Cyber-Forensic Command Center & Multimodal Impersonation Risk Analyzer**  
> Analyzing Voice, Conversation, Message, URL, and Phone Number Evidence with Explainable Fusion.

[![SRS Version](https://img.shields.io/badge/SRS-v3.0-blue.svg)](docs/SRS_Final.md)
[![Branch](https://img.shields.io/badge/integration%20branch-staging-green.svg)](https://github.com/maryam441/Multimodal-Impersonation-and-Fraud-Analyzer/tree/staging)
[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)

---

## 1. Project Purpose & Scope

The **Multimodal Impersonation & Fraud Analyzer** is an enterprise-grade decision-support and forensic intelligence workspace designed to analyze user-submitted evidence across five modalities:

1. **Phone Number Analysis:** Structural E.164 normalization, carrier/region metadata, and reputation adapter.
2. **Voice Analysis:** Acoustic waveform and deep-learning spoof/vishing detection with temporal anomaly markers.
3. **Conversation Analysis:** Multi-turn social engineering, urgency, authority impersonation, and pressure tactics tagging.
4. **Message Analysis:** Single SMS/text scam classification with token-level phrase attribution (English and Roman Urdu).
5. **URL Analysis:** Defanged URL anatomy inspection (`hxxp://`) and lexical/host-based phishing detection.
6. **Multimodal Fusion Engine:** Transparent weighted late-fusion combining active signals without treating missing modalities as safe.
7. **Grounded Explainability & RAG Assistant:** Decision-support guidance grounded strictly in deterministic model outputs.

---

## 2. Milestone Progress & Execution Roadmap

The project is built incrementally following the mandatory Git protocol (`feature/Mxx-*` -> `staging`):

| Milestone | Description | Status |
|---|---|:---:|
| **M00** | Repository audit and safe baseline | **In Progress / Current** |
| **M01** | Requirements confirmation & architectural decisions | Pending Approval |
| **M02** | Dataset discovery, audit & register | Pending |
| **M03** | Project foundation & developer experience | Pending |
| **M04** | Backend core, DB schema & evidence lifecycle | Pending |
| **M05** | Frontend foundation, design system & landing | Pending |
| **M06** | Innovative evidence input workflows & dock | Pending |
| **M07** | Job orchestration & standardized result contracts | Pending |
| **M08** | Voice model pipeline & acoustic inference | Pending |
| **M09** | Message model pipeline & phrase attribution | Pending |
| **M10** | Conversation analysis & turn-by-turn tactics | Pending |
| **M11** | URL analysis & structural anatomy breakdown | Pending |
| **M12** | Phone-number analysis & provider adapter | Pending |
| **M13** | Fusion engine & 0-100 risk framework | Pending |
| **M14** | Grounded explainability & RAG safety assistant | Pending |
| **M15** | Interactive forensic dossier & full integration | Pending |
| **M16** | Security, QA & research evaluation | Pending |
| **M17** | Production deployment & final release candidate | Pending |

---

## 3. Repository Documentation

- [Repository Audit (M00)](docs/REPOSITORY_AUDIT.md)
- [Software Requirements Specification (SRS v3.0)](srs_final_md.md)

---

## 4. Local Development Quickstart

### Prerequisites
- Python 3.12+
- Node.js 20+ & npm
- Git

### Setup
```bash
# Clone and checkout staging
git clone https://github.com/maryam441/Multimodal-Impersonation-and-Fraud-Analyzer.git
cd Multimodal-Impersonation-and-Fraud-Analyzer
git checkout staging

# Python environment
python -m venv .venv
source .venv/bin/activate  # Or on Windows: .venv\Scripts\activate
pip install -r requirements.txt  # Coming in M03
```

---

## 5. Security & Privacy Commitments

- **Zero Secret & Data Leakage:** Real phone numbers, raw recordings, and proprietary weights are never committed to version control.
- **Decision Support Only:** This application is strictly an investigative aid and never claims 100% certainty or replaces human judgment.
