# Multimodal Impersonation & Fraud Analyzer (AegisAI / Sentinel Core)

> **Flagship Cyber-Forensic Command Center & Multimodal Impersonation Risk Analyzer**  
> Analyzing Voice, Conversation, Message, URL, and Phone Number Evidence with Explainable Late-Fusion.

[![SRS Version](https://img.shields.io/badge/SRS-v3.0-blue.svg)](docs/SRS_Final.md)
[![Branch](https://img.shields.io/badge/integration%20branch-staging-green.svg)](https://github.com/maryam441/Multimodal-Impersonation-and-Fraud-Analyzer/tree/staging)
[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 1. System Architecture

```mermaid
flowchart TD
    subgraph Evidence_Dock["Unified Multimodal Evidence Dock"]
        V[Voice Audio Upload]
        M[Single Message SMS]
        C[Multi-Turn Chat Transcript]
        U[Suspicious URL]
        P[Phone Number]
    end

    subgraph Modality_Analyzers["Independent Modality Pipelines"]
        V_A["Voice Pipeline<br/>(35 Acoustic Metrics + Deepfake Spans)"]
        M_A["Message Pipeline<br/>(Roman Urdu & English Phrase Attribution)"]
        C_A["Conversation Pipeline<br/>(Multi-Turn Social Engineering Tactic Tagger)"]
        U_A["URL Pipeline<br/>(Offline PhiUSIIL Lexical & Host Extractor)"]
        P_A["Phone Pipeline<br/>(E.164 Normalization + PTA Carrier Resolver)"]
    end

    subgraph Decision_Core["Forensic Decision Core"]
        FUSION["Transparent Late-Fusion Engine<br/>(Missingness Neutrality & De-Duplication Discount)"]
        GAUGE["0-100 Risk Framework<br/>(0-30 Low, 31-60 Med, 61-100 High)"]
        RAG["Grounded Safety Assistant (RAG)<br/>(SBP, PTA, FIA Regulatory Guidance)"]
        GATE["Human-in-the-Loop Gate<br/>(Dossier SHA-256 Seal & FIA Dispatch)"]
    end

    subgraph Forensic_Dossier["Interactive Forensic Dossier (UI)"]
        UI_GAUGE["Overall Risk Gauge (Radial SVG)"]
        UI_CONST["Fusion Constellation Map"]
        UI_REPLAY["Annotated Chat Replay"]
        UI_URL["Defanged URL Anatomy Card"]
        UI_VOICE["Waveform & Anomaly Timeline"]
        UI_ASSIST["Safety Assistant Drawer"]
    end

    V --> V_A
    M --> M_A
    C --> C_A
    U --> U_A
    P --> P_A

    V_A & M_A & C_A & U_A & P_A --> FUSION
    FUSION --> GAUGE --> UI_GAUGE
    FUSION --> UI_CONST
    FUSION --> RAG --> UI_ASSIST
    FUSION --> GATE

    M_A --> UI_REPLAY
    C_A --> UI_REPLAY
    U_A --> UI_URL
    V_A --> UI_VOICE
```

---

## 2. Milestone Execution Log (M00 — M17)

All 18 engineering milestones have been completed, verified with automated tests, and merged into `staging`:

| Milestone | Scope & Deliverables | Integration Branch | Status |
|---|---|---|:---:|
| **M00** | Repository audit, safe git baseline, `.gitignore`, `.env.example` | `feature/M00-repository-audit` | **Completed** |
| **M01** | Technical decisions & system architecture (`ARCHITECTURE.md`) | `feature/M01-technical-decisions` | **Completed** |
| **M02** | Dataset discovery, audit, and manifests (`DATASETS.md`) | `feature/M02-dataset-discovery` | **Completed** |
| **M03** | FastAPI foundation, Docker setup, CI workflow, health check | `feature/M03-project-foundation` | **Completed** |
| **M04** | Async SQLite DB, case TTL lifecycle, smart entity extraction | `feature/M04-backend-core` | **Completed** |
| **M05** | Next.js 15 App Router frontend, Tailwind CSS, dark cyber-theme | `feature/M05-frontend-foundation` | **Completed** |
| **M06** | 5 Studio cards, interactive waveform preview, smart extraction chips | `feature/M06-evidence-studio-workflows` | **Completed** |
| **M07** | Standardized BaseModalityAnalyzer contract & pipeline telemetry | `feature/M07-job-orchestration` | **Completed** |
| **M08** | Voice pipeline: 35 acoustic metrics + temporal anomaly detector | `feature/M08-voice-pipeline` | **Completed** |
| **M09** | Message pipeline: Roman Urdu & English phrase attribution | `feature/M09-message-pipeline` | **Completed** |
| **M10** | Conversation pipeline: Multi-turn tactic tagger & escalation velocity | `feature/M10-conversation-pipeline` | **Completed** |
| **M11** | URL pipeline: Offline PhiUSIIL lexical extractor & defanging | `feature/M11-url-pipeline` | **Completed** |
| **M12** | Phone pipeline: E.164 normalization & cautious fallback adapter | `feature/M12-phone-pipeline` | **Completed** |
| **M13** | Fusion engine: Missingness neutrality, ablation, and divergence checks | `feature/M13-fusion-engine` | **Completed** |
| **M14** | Grounded Safety Assistant (RAG) & Human-in-the-Loop gate | `feature/M14-rag-explainability` | **Completed** |
| **M15** | Interactive Forensic Dossier: Risk Gauge, Constellation, Replay | `feature/M15-forensic-dossier-frontend` | **Completed** |
| **M16** | Security audit (SSRF, XSS, Secret leak check) & E2E evaluation | `feature/M16-security-qa-eval` | **Completed** |
| **M17** | Release Candidate v3.0.0-rc1, deployment guide & documentation | `feature/M17-release-candidate` | **Completed** |

---

## 3. Model Cards & Architectural Specifications

Detailed behavioral cards, limitations, and evaluation metrics:
- 🎙️ **Voice Modality:** [`docs/MODEL_CARDS/VOICE_MODEL_CARD.md`](docs/MODEL_CARDS/VOICE_MODEL_CARD.md)
- 💬 **Single Message Modality:** [`docs/MODEL_CARDS/MESSAGE_MODEL_CARD.md`](docs/MODEL_CARDS/MESSAGE_MODEL_CARD.md)
- 👥 **Multi-Turn Conversation Modality:** [`docs/MODEL_CARDS/CONVERSATION_MODEL_CARD.md`](docs/MODEL_CARDS/CONVERSATION_MODEL_CARD.md)
- 🌐 **URL & Domain Modality:** [`docs/MODEL_CARDS/URL_MODEL_CARD.md`](docs/MODEL_CARDS/URL_MODEL_CARD.md)
- 📞 **Phone Number Modality:** [`docs/MODEL_CARDS/PHONE_MODEL_CARD.md`](docs/MODEL_CARDS/PHONE_MODEL_CARD.md)
- ⚖️ **Multimodal Fusion Engine:** [`docs/MODEL_CARDS/FUSION_ENGINE_CARD.md`](docs/MODEL_CARDS/FUSION_ENGINE_CARD.md)
- 🤖 **Grounded RAG Safety Assistant:** [`docs/MODEL_CARDS/RAG_ASSISTANT_CARD.md`](docs/MODEL_CARDS/RAG_ASSISTANT_CARD.md)
- 📊 **Research Evaluation Report:** [`docs/RESEARCH_EVALUATION.md`](docs/RESEARCH_EVALUATION.md)

---

## 4. Quickstart Setup & Execution

### Option A: Local Development Setup

#### 1. Backend (Python 3.12)
```bash
# From workspace root
pip install -r requirements.txt

# Start FastAPI asynchronous API server
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```
- API Documentation (Swagger): `http://localhost:8000/api/v1/docs`
- Health Telemetry: `http://localhost:8000/api/v1/health`

#### 2. Frontend (Next.js 15)
```bash
cd frontend
npm install
npm run dev
```
- Forensic Command Center UI: `http://localhost:3000`

---

### Option B: Docker Compose Deployment

```bash
# Build and run backend, frontend, and volumes
docker-compose up --build
```
Access the application at `http://localhost:3000`.

---

## 5. Automated Verification Suite

Run all 36 unit, integration, SSRF defense, and lifecycle tests:
```bash
python -m pytest backend/tests/ -v
```
Build Next.js production bundle:
```bash
cd frontend && npm run build
```

---

## 6. Ethical Boundary Charter & Decision-Support Mandate

1. **Zero Hallucination:** The Grounded Assistant references strictly deterministic model outputs and official statutory circulars (SBP BPRD Circular 02/2023, PTA Shortcode 8866, PECA 2016 Sections 13 & 14).
2. **Missingness Neutrality:** Missing modalities are never imputed as zero risk; they are excluded from the denominator ($w_i = 0$ for unprovided) to avoid false-negative dilution.
3. **SSRF & Execution Defense:** URLs are defanged (`hxxp://`, `[.]`) and evaluated purely via static lexical/host parsing without live HTTP network crawling.
4. **Human-in-the-Loop Gate:** High-consequence actions (e.g. FIA incident reporting) strictly require explicit human investigator authorization before dispatch.
