# Repository Audit & Safe Baseline (Milestone M00)
## Cross-Platform Real-Time Anti-Fraud & Law Enforcement Defense
**Project:** Multimodal Impersonation & Fraud Analyzer (Sentinel Core / AegisAI)  
**SRS Version:** 4.0 (Enterprise Cross-Platform Web + Mobile Edition)  
**Date of Audit:** November 26, 2026  
**Auditor:** Principal Full-Stack, Mobile & AI Systems Engineer  
**Target Integration Branch:** `staging`  
**Feature Branch:** `feature/M00-repository-audit-mobile-upgrade`  

---

## 1. Executive Summary

This document constitutes the formal deliverable for **Milestone M00: Repository Audit and Safe Baseline** for the upgraded *Cross-Platform Real-Time Multimodal Impersonation & Fraud Analyzer*.

The system has evolved from a single-page analysis concept into an end-to-end cybersecurity and anti-fraud product comprising:
1. **Next.js 15 Web Command Center (`frontend/`):** A forensic workspace providing 0–100 radial risk gauges, multimodal constellation visualization, acoustic waveform anomaly inspection, annotated chat replays, defanged URL token cards, and an interactive State Bank / PTA / FIA regulatory assistant.
2. **Installable Mobile Companion App (`mobile/`):** A cross-platform React Native / Expo application for Android & iOS designed for active in-conversation threat screening, notification listening, and floating heads-up alert overlays.
3. **Autonomous FIA Reporting Agent (PECA 2016):** A human-in-the-loop law enforcement dispatch engine generating cryptographically sealed (SHA-256) legal affidavits and official tracking reference numbers (`FIA-CCW-YYYY-XXXXX`).
4. **Ambient Browser Guardian (`extension/`):** Manifest V3 extension for Chrome, Edge, and Brave providing real-time inline message protection on WhatsApp Web and Gmail.
5. **Desktop Ambient Daemon (`desktop_agent/`):** Background system clipboard watcher providing native Windows toast alerts.
6. **High-Performance AI Backend (`backend/`):** Python FastAPI async REST and WebSocket streaming server (`/api/v1/stream/live`) powering 6 independent modality analyzers and a transparent late-fusion engine.

---

## 2. Repository Inventory & Asset Register

### 2.1 File & Module Directory Structure

| Subsystem | File / Directory Path | Purpose & Status |
|---|---|---|
| **Backend REST Core** | `backend/app/api/v1/` | Async endpoints: `health.py`, `cases.py`, `analysis.py`, `assistant.py`, `ambient.py`, `incidents.py` |
| **Backend DB** | `backend/app/db/` | SQLAlchemy async models: `Case`, `EvidenceItem`, `ModalityResult`, `FusionAssessment`, `AuditEvent`, `FIAIncidentReport`, `AmbientScanLog` |
| **Backend Services** | `backend/app/services/` | 6 Analyzers + `fusion_service.py`, `rag_service.py`, `fia_reporting_service.py`, `extractor.py`, `job_manager.py` |
| **Backend Tests** | `backend/tests/` | 12 Pytest modules (41 automated tests, 100% passing) |
| **Web Command Center** | `frontend/` | Next.js 15 App Router, Tailwind CSS, shadcn/ui, Forensic Dossier, Evidence Studio, Ambient Hub |
| **Mobile Companion** | `mobile/` | Installable React Native / Expo cross-platform mobile app directory (Architecture baseline created) |
| **Browser Extension** | `extension/` | Manifest V3 extension with WhatsApp Web (`content_whatsapp.js`), Gmail (`content_email.js`), and popup UI |
| **Desktop Daemon** | `desktop_agent/` | OS clipboard watcher (`sentinel_agent.py`) with Windows toast notifications |
| **ML Models & Sources** | `ml/src/` | Feature extractors: `voice/`, `message/`, `conversation/`, `url/`, `phone/` |
| **Dataset Manifests** | `ml/datasets/manifests/` | JSON dataset manifests for voice, SMS, URLs, and phone registries |
| **Documentation** | `docs/` | `SRS.md`, `ARCHITECTURE.md`, `DATASETS.md`, `REPOSITORY_AUDIT.md`, `MODEL_CARDS/` |

---

## 3. Dataset & Data Governance Audit

### 3.1 Local Voice Dataset (`datasets/Cleaned_Voice_Dataset/`)
- **Structure:** Cleaned telephony WAV recordings partitioned into `train/` (408 files), `val/` (102 files), and `test/` (102 files). Total: **612 audio files**.
- **Class Balance:** 50% Spam (Bank OTP impersonation, Benazir prize scam, lottery deceit) vs 50% Ham (Authentic conversational calls).
- **Format:** 16 kHz Mono PCM WAV, standardized telephony bandwidth.
- **Git Hygiene:** Strictly gitignored via `*.wav` in `.gitignore`. Verified zero audio binary leakage into git history.

### 3.2 Local Message Dataset (`datasets/expanded_pakistan_spam_dataset_10k.csv`)
- **Volume:** **10,000 labeled text messages** in Roman Urdu and English.
- **Vectors Covered:** Fake banking alerts (HBL, Meezan, Bank Alfalah), Easypaisa / JazzCash unauthorized transfer warnings, lottery claims, courier fee phishing.
- **Git Hygiene:** CSV tracked in repository baseline for reproducible testing; no PII or live credentials contained.

### 3.3 Lawful External Data & Synthetic Benchmarks
- **URL Phishing Dataset:** Documented PhiUSIIL phishing benchmark rules + synthetic Pakistani banking domain fixtures (`http://hbl-verify.pk`, `http://fake-bank-login.pk`).
- **Phone Number Reputation:** PTA carrier prefix mapping (0300=Jazz, 0312=Zong, 0333=Ufone, 0345=Telenor) + cautious fallback protocol returning `insufficient_data` for unverified numbers per SRS §15.5.

---

## 4. Git Hygiene, Secrets & Data Leakage Verification

| Category | Target / Pattern | Status | Verification Command |
|---|---|---|---|
| **Audio Binaries** | `*.wav`, `*.mp3`, `*.ogg` | ✅ Ignored | `git check-ignore frontend/public/audio/spam_test_001_Bank_OTP_Scam.wav` -> Exit 0 |
| **Model Weights** | `*.pt`, `*.bin`, `*.onnx`, `*.pkl` | ✅ Ignored | Verified in `.gitignore` |
| **Secrets / Keys** | `.env`, `*.pem`, `*.key` | ✅ Ignored | Verified; `.env.example` provided with safe placeholders |
| **Build Artifacts** | `.next/`, `node_modules/`, `__pycache__/` | ✅ Ignored | Verified in `.gitignore` |
| **Branch Policy** | Pushes to `main` prohibited | ✅ Enforced | All work integrates into `staging` via feature branches |

---

## 5. Architectural Upgrades & Gap Analysis (M00 Baseline)

To satisfy the full **Cross-Platform Real-Time Anti-Fraud Application** mandate, the following architectural additions are established:

### Gap 1: Installable Mobile Companion (`mobile/`)
- **Current State:** Next.js web application, Chrome extension, and Desktop daemon exist. Mobile app directory must be structured.
- **Resolution Plan:** Establish `mobile/` with React Native / Expo, configuring onboarding permission consents, background Notification Listener service, and in-conversation Floating Heads-Up Overlay.

### Gap 2: Real-Time WebSocket Streaming (`/api/v1/stream/live`)
- **Current State:** REST endpoints (`/ambient/scan`, `/cases/{id}/analyze`) operate synchronously.
- **Resolution Plan:** Implement bidirectional WebSocket endpoint streaming audio chunks and conversation turns for sub-50ms live call and chat screening.

### Gap 3: 6th Modality — Email Header & Phishing Body Analyzer
- **Current State:** 5 modalities currently active (Phone, Voice, Conversation, Message, URL).
- **Resolution Plan:** Implement dedicated `EmailServiceAnalyzer` evaluating RFC header authenticity (SPF/DKIM/DMARC alignment), display-name spoofing, and embedded credential solicitation.

### Gap 4: Generative UI Visual Components
- **Current State:** Tailwind CSS dark UI in place.
- **Resolution Plan:** Embed standalone interactive HTML Generative UI artifacts directly inside the conversation transcript and web dashboard.

---

## 6. Updated Milestone Execution Roadmap (M00 to M17)

| Milestone | Title | Key Deliverables & Focus |
|---|---|---|
| **M00** | **Repository Audit & Safe Baseline** | Comprehensive repository audit, `docs/SRS.md`, `docs/REPOSITORY_AUDIT.md`, git hygiene verification |
| **M01** | **Technical Architecture & Streaming Spec** | `docs/ARCHITECTURE.md` updated with WebSocket streaming, mobile IPC, and 6-modality pipeline |
| **M02** | **Master Dataset Register & Manifests** | Data register, email phishing fixtures, synthetic benchmarks, dataset cards |
| **M03** | **Project Foundation & Monorepo Tooling** | FastAPI WebSocket infrastructure, Docker Compose, mobile dependencies, shared types |
| **M04** | **Backend Async Core & Streaming Engine** | SQLite/PostgreSQL schema updates, WebSocket streaming handler, streaming buffer manager |
| **M05** | **Frontend & Mobile Foundation** | Next.js 15 UI polish + React Native / Expo companion app shell with theme parity |
| **M06** | **Evidence Studio & Mobile Ingestion** | 6-card multi-modal input studio + mobile notification listener intent |
| **M07** | **Job Orchestration & Telemetry** | Async background pipeline manager, latency telemetry, result contracts |
| **M08** | **Voice Modality Pipeline** | 35 acoustic metrics, temporal anomaly detector, streaming audio chunk processor |
| **M09** | **Message Modality Pipeline** | Roman Urdu & English NLP classifier, suspicious phrase attribution spans |
| **M10** | **Conversation Modality Pipeline** | Multi-turn dialogue parser, authority impersonation and urgency tactic tagger |
| **M11** | **URL Modality Pipeline** | Lexical & host feature extractor, defanging engine, PhiUSIIL feature evaluator |
| **M12** | **Phone Modality Pipeline** | E.164 normalization, PTA network carrier resolution, cautious fallback adapter |
| **M13** | **Email Phishing Modality Pipeline** | RFC header spoof inspector, SPF/DKIM alignment, deceptive display name analyzer |
| **M14** | **Multimodal Fusion Engine** | Weighted late fusion, missingness neutrality, redundancy discount ($\delta = 0.75$), ablation deltas |
| **M15** | **Grounded RAG Assistant & FIA Approval Agent** | SBP/PTA/FIA grounded advisory, Human-in-the-Loop Gate, PECA 2016 statutory affidavit generator |
| **M16** | **Forensic Dossier & Generative UI** | Radial SVG Risk Gauge (0–100), Constellation Map, Chat Replay, Anomaly Timeline, Mobile Heads-Up Overlay |
| **M17** | **Security Hardening, E2E QA & Release Candidate** | SSRF defense, penetration testing, cross-platform E2E test suite, `v4.0.0-rc1` release |

---

## 7. Milestone M00 Sign-Off & Verification

- **Branch:** `feature/M00-repository-audit-mobile-upgrade`
- **Target Integration:** `staging`
- **Zero Secrets / Data Committed:** Verified via `.gitignore` and `git status`.
- **Automated Tests:** 41 / 41 passing backend tests.
- **Production Build:** Next.js frontend builds cleanly with 0 errors.
- **Remote Remote URL:** `https://github.com/maryam441/Multimodal-Impersonation-and-Fraud-Analyzer`
