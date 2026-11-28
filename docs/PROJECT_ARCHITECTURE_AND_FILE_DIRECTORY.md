# AegisAI Sentinel: Multimodal Impersonation & Fraud Analyzer
## Complete System Architecture & File-by-File Technical Directory Manual
**Document Version:** 3.0  
**Target Repository:** `https://github.com/maryam441/Multimodal-Impersonation-and-Fraud-Analyzer`  
**Integration Branch:** `staging`  
**System Verification:** 100% Passing (All 7 End-to-End Stages Verified)  
**Associated PDF Document:** [PROJECT_ARCHITECTURE_AND_FILE_DIRECTORY.pdf](file:///c:/Users/Maryam_Sharif/Desktop/fyp/docs/PROJECT_ARCHITECTURE_AND_FILE_DIRECTORY.pdf)

---

## 1. Executive Summary & Monorepo Topology

AegisAI Sentinel is an enterprise-grade, cross-platform cyber-forensic and anti-fraud system engineered to detect and mitigate multi-vector social engineering, voice deepfakes, phishing attacks, and authority impersonation across Pakistan's telecommunications and digital banking ecosystems.

The project is structured as an integrated monorepo comprising five core execution planes:
1. **AI Backend Engine (`backend/`):** Asynchronous Python FastAPI microservice housing six independent modality analyzers, a transparent weighted late-fusion engine, a grounded RAG safety assistant, and a statutory reporting adapter for the FIA Cybercrime Wing (NR3C) under the Prevention of Electronic Crimes Act (PECA 2016).
2. **Forensic Command Center & Mobile PWA (`frontend/`):** Modern intelligence dashboard built with Next.js 15, React 19, TypeScript, and Tailwind CSS. It features an obsidian cybersecurity dark theme, HTML5 acoustic waveform visualizer, unified multi-modal evidence studio, and Progressive Web App (PWA) manifest with offline service worker.
3. **Cross-Platform Mobile Shield (`mobile/`):** Installable mobile companion application built on Expo SDK 52 and React Native, providing real-time in-call floating alerts and background notification inspection.
4. **Browser Fraud Interceptor (`extension/`):** Google Chrome & Microsoft Edge Manifest V3 extension providing active page verification, right-click context menu threat scanning, and in-page red warning banners on deceptive banking/phishing websites.
5. **Machine Learning & Feature Engineering Pipelines (`ml/`):** Specialized acoustic (Librosa 35-metric), natural language (Roman Urdu/English n-gram attribution), lexical (Shannon entropy, defanged URL), and carrier normalization engines.

```
+-----------------------------------------------------------------------------------+
|                           AEGISAI MONOREPO TOPOLOGY                               |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [Chrome Extension]             [Android PWA / Mobile]          [Next.js Web]    |
|   (extension/)                    (mobile/)                      (frontend/)     |
|         |                              |                              |           |
|         +--------------+---------------+--------------+---------------+           |
|                        |                              |                           |
|                        v                              v                           |
|               REST API (/api/v1/...)        WebSockets (/stream/live)             |
|                        |                              |                           |
|                        +--------------+---------------+                           |
|                                       |                                           |
|                                       v                                           |
|                   +---------------------------------------+                       |
|                   |        FastAPI Backend Engine         |                       |
|                   |             (backend/app/)            |                       |
|                   +---------------------------------------+                       |
|                        |                     |                     |              |
|        +---------------+                     |                     +----+         |
|        v                                     v                          v         |
|  [6 Modality Analyzers]           [Transparent Late Fusion]    [FIA Reporting]   |
|  - Voice (35 Metrics)             - Dynamic Rescaling           - PECA 2016 Spec  |
|  - Message (Roman Urdu)           - Correlation Penalty         - Tamper-Evident  |
|  - URL (Shannon Entropy)          - Risk Gauge (0-100)          - PDF/JSON Dossier|
|  - Phone (PTA Carrier)                       |                          |         |
|  - Conversation (Multi-Turn)                 v                          v         |
|  - Email (RFC 2822 Spoofing)       [SQLite/PostgreSQL DB]      [Statutory NR3C]   |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

---

## 2. Master Project Directory Hierarchy

```text
c:\Users\Maryam_Sharif\Desktop\fyp\
├── backend\
│   ├── app\
│   │   ├── api\v1\
│   │   │   ├── ambient.py
│   │   │   ├── analysis.py
│   │   │   ├── assistant.py
│   │   │   ├── cases.py
│   │   │   ├── health.py
│   │   │   ├── incidents.py
│   │   │   └── stream.py
│   │   ├── core\
│   │   │   └── config.py
│   │   ├── db\
│   │   │   ├── base.py
│   │   │   ├── models.py
│   │   │   └── session.py
│   │   ├── schemas\
│   │   │   ├── case.py
│   │   │   ├── extract.py
│   │   │   ├── inputs.py
│   │   │   └── modality.py
│   │   ├── services\
│   │   │   ├── base_analyzer.py
│   │   │   ├── conversation_service.py
│   │   │   ├── default_analyzers.py
│   │   │   ├── email_service.py
│   │   │   ├── extractor.py
│   │   │   ├── fia_reporting_service.py
│   │   │   ├── fusion_service.py
│   │   │   ├── job_manager.py
│   │   │   ├── message_service.py
│   │   │   ├── phone_service.py
│   │   │   ├── rag_service.py
│   │   │   ├── url_service.py
│   │   │   └── voice_service.py
│   │   └── main.py
│   └── tests\
│       ├── conftest.py
│       ├── test_cases.py
│       ├── test_conversation_modality.py
│       ├── test_email_and_streaming.py
│       ├── test_fia_ambient_protection.py
│       ├── test_fusion_engine.py
│       ├── test_health.py
│       ├── test_job_orchestration.py
│       ├── test_message_modality.py
│       ├── test_phone_modality.py
│       ├── test_rag_and_actions.py
│       ├── test_security_and_e2e.py
│       ├── test_url_modality.py
│       └── test_voice_modality.py
├── datasets\
│   ├── Cleaned_Voice_Dataset\
│   │   ├── audio\test\ (ham/ and spam/ wav files)
│   │   ├── audio\train\ (ham/ and spam/ wav files)
│   │   └── README.md
│   └── expanded_pakistan_spam_dataset_10k.csv
├── docs\
│   ├── END_TO_END_USAGE_GUIDE.md
│   ├── PROJECT_ARCHITECTURE_AND_FILE_DIRECTORY.md
│   ├── PROJECT_ARCHITECTURE_AND_FILE_DIRECTORY.pdf
│   └── REPOSITORY_AUDIT.md
├── extension\
│   ├── background.js
│   ├── content_email.js
│   ├── content_web.js
│   ├── content_whatsapp.js
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   └── icons\ (icon16.png, icon48.png, icon128.png)
├── frontend\
│   ├── app\
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components\
│   │   ├── ambient\AmbientShieldHub.tsx
│   │   ├── dossier\ForensicDossierView.tsx
│   │   ├── mobile\MobileNavBar.tsx
│   │   ├── mobile\PwaInstallPrompt.tsx
│   │   ├── studio\ConversationCard.tsx
│   │   ├── studio\EmailCard.tsx
│   │   ├── studio\MessageCard.tsx
│   │   ├── studio\PhoneCard.tsx
│   │   ├── studio\URLCard.tsx
│   │   ├── studio\VoiceCard.tsx
│   │   ├── studio\WaveformVisualizer.tsx
│   │   ├── EvidenceStudioShell.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   └── Navbar.tsx
│   ├── lib\
│   │   ├── api.ts
│   │   └── utils.ts
│   ├── public\
│   │   ├── icons\ (icon-192.png, icon-512.png)
│   │   ├── manifest.json
│   │   └── sw.js
│   ├── next.config.mjs
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── ml\
│   └── src\
│       ├── conversation\parser.py
│       ├── message\attribution.py
│       ├── message\preprocessor.py
│       ├── phone\normalizer.py
│       ├── url\feature_extractor.py
│       └── voice\feature_extractor.py
├── mobile\
│   ├── screens\
│   │   ├── AlertOverlayScreen.tsx
│   │   ├── FiaHistoryScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   └── ScanScreen.tsx
│   ├── services\
│   │   ├── api.ts
│   │   └── websocket.ts
│   ├── App.tsx
│   ├── app.json
│   └── package.json
├── phone_dataset\
│   └── phone_numbers_dataset.csv
├── scripts\
│   ├── generate_architecture_pdf.py
│   ├── terminal_live_demo.py
│   └── verify_system_e2e.py
├── agent_runner.py
├── generate_cleaned_voice_dataset.py
├── package.json
├── predict_voice.py
├── README.md
├── requirements.txt
├── srs_final_md.md
└── train_voice_model.py
```

---

## 3. Detailed File-by-File Breakdown & Purpose

### 3.1 Root Configuration & System Orchestration

| File Path | Lines | Purpose & Architectural Role |
| :--- | :---: | :--- |
| `package.json` | 24 | Monorepo root manifest declaring workspace commands for frontend, mobile, and test orchestration. |
| `requirements.txt` | 35 | Locked Python dependencies: FastAPI, Uvicorn, SQLAlchemy, Pydantic, Librosa, PyTorch, ReportLab, etc. |
| `README.md` | 165 | Project README detailing system capabilities, installation steps, research citations, and quick start guide. |
| `srs_final_md.md` | 852 | Software Requirements Specification (SRS v3.0) governing all mathematical, ethical, and legal requirements. |
| `.env.example` | 45 | Production configuration template specifying database connection strings, API tokens, and CORS domains. |
| `.gitignore` | 120 | Security boundary ignoring model weights, virtual environments, audio recordings, and temporary artifacts. |
| `agent_runner.py` | 94 | Autonomous test harness executing automated checks, linting, and milestone state transitions. |
| `train_voice_model.py` | 160 | Standalone ML training script extracting 35 acoustic metrics to train the Random Forest / PyTorch voice spoof classifier. |
| `predict_voice.py` | 204 | Direct CLI inference script classifying standalone `.wav` audio files as human vs synthetic/cloned voice. |
| `generate_cleaned_voice_dataset.py` | 110 | Audio dataset preprocessor converting raw sound files into standard 16kHz mono PCM telephony format. |

---

### 3.2 Backend Layer: FastAPI Microservices (`backend/`)

#### 3.2.1 Core & Database Configuration
- **`backend/app/main.py` (57 lines):**  
  Application entry point. Initializes FastAPI with OpenAPI documentation at `/api/v1/docs`, mounts asynchronous lifespan context for SQLite/PostgreSQL table initialization, configures cross-origin resource sharing (CORS) across `localhost:3000` and Chrome extensions, and includes all `v1` routers.
- **`backend/app/core/config.py` (44 lines):**  
  Pydantic Settings module defining environment variables: `APP_NAME`, `API_V1_PREFIX`, `ALLOWED_ORIGINS`, `DATABASE_URL`, and `EVIDENCE_UPLOAD_DIR`.
- **`backend/app/db/session.py` (27 lines):**  
  Asynchronous database engine initialization using `create_async_engine`. Defines `get_db` dependency for route injection and `init_db` for automatic table schema creation.
- **`backend/app/db/models.py` (117 lines):**  
  Declares SQLAlchemy relational ORM models:
  - `Case`: Ephemeral evidence container with creation timestamps and TTL expiration.
  - `EvidenceItem`: Individual inputs (audio file paths, message strings, URLs, phone numbers).
  - `ModalityResult`: Detailed model outputs, confidence metrics, and evidence signal lists.
  - `FusionAssessment`: Multi-modal fused risk score, active modality weights, and ablation differences.
  - `AmbientScanLog`: Live real-time threat intercepts captured from Chrome/WhatsApp Web/Gmail.
  - `FiaIncidentRecord`: Official statutory complaint registry with NR3C reference numbers.
- **`backend/app/db/base.py` (4 lines):**  
  SQLAlchemy Declarative Base anchor.

#### 3.2.2 API Routers (`backend/app/api/v1/`)
- **`backend/app/api/v1/health.py` (83 lines):**  
  Liveness (`/health`), readiness (`/readiness`), and telemetry endpoints monitoring DB connectivity, disk space, and loaded ML model memory.
- **`backend/app/api/v1/cases.py` (116 lines):**  
  REST endpoints for creating cases (`POST /cases`), retrieving case status, and triggering ephemeral TTL purges.
- **`backend/app/api/v1/analysis.py` (192 lines):**  
  The primary analysis execution router. Provides dedicated endpoints:
  - `POST /cases/{id}/analyze/voice` (Audio upload & acoustic metrics)
  - `POST /cases/{id}/analyze/message` (Roman Urdu/English SMS analysis)
  - `POST /cases/{id}/analyze/url` (Safe defanged URL structural analysis)
  - `POST /cases/{id}/analyze/phone` (E.164 normalization & PTA carrier plan)
  - `POST /cases/{id}/analyze/email` (RFC 2822 header spoofing & body analysis)
  - `POST /cases/{id}/analyze/conversation` (Multi-turn chat coercion velocity)
  - `GET /cases/{id}/report` (Compiles complete multi-modal forensic dossier)
- **`backend/app/api/v1/ambient.py` (276 lines):**  
  Ultra-low-latency real-time threat scanning router (`POST /ambient/scan`). Receives snippets from Chrome extensions, runs immediate classification, returns threat verdicts, logs intercepts to DB, and populates the Live Intercept Feed.
- **`backend/app/api/v1/assistant.py` (152 lines):**  
  Grounded RAG safety assistant endpoint (`POST /assistant/query`). Explains forensic model outputs deterministically and provides legal anti-fraud guidance without hallucinating evidence.
- **`backend/app/api/v1/incidents.py` (115 lines):**  
  Statutory reporting router (`POST /incidents/direct-report` and `GET /incidents`). Manages official complaint dispatching, PDF dossier generation, and reference number tracking.
- **`backend/app/api/v1/stream.py` (163 lines):**  
  WebSocket endpoint (`ws://.../api/v1/stream/live`) for real-time low-latency streaming of live call audio and chat chunks, emitting instant floating alert triggers if risk crosses 60.

#### 3.2.3 Forensic Services & Modality Analyzers (`backend/app/services/`)
- **`backend/app/services/base_analyzer.py` (48 lines):**  
  Abstract base class enforcing a strict interface for all 6 modality analyzers: standardizing risk labels (`low`, `medium`, `high`, `inconclusive`), confidence notes, and processing latency telemetry.
- **`backend/app/services/fusion_service.py` (185 lines):**  
  The mathematical core of the system. Implements transparent weighted late-fusion:
  - Dynamically rescales weights when modalities are missing (never treats missing evidence as safe).
  - Applies cross-modality correlation penalties to prevent double-counting collinear signals.
  - Calculates the unified Risk Gauge (0–100) and produces full ablation deltas.
- **`backend/app/services/message_service.py` (67 lines):**  
  Bilingual Roman Urdu and English NLP analyzer. Evaluates banking freeze threats, biometric fraud, and OTP solicitation, emitting character-span attributions.
- **`backend/app/services/url_service.py` (179 lines):**  
  Zero-outbound-fetch URL analyzer. Calculates Shannon domain entropy, flags raw IP literals, detects high-risk TLDs (.xyz, .live, .click), and safely defangs links into `hxxp://` notation.
- **`backend/app/services/phone_service.py` (141 lines):**  
  Complies strictly with SRS §15.5 mandate: normalizes phone numbers to E.164, identifies carrier networks, and returns `status='insufficient_data'` for unverified numbers to prevent algorithmic discrimination.
- **`backend/app/services/voice_service.py` (122 lines):**  
  Deep acoustic analysis service. Extracts 35 acoustic parameters from telephony audio (MFCCs, spectral flux, jitter, shimmer, pitch variance) to identify cloned or synthetic voices.
- **`backend/app/services/email_service.py` (218 lines):**  
  Email phishing analyzer. Inspects RFC 2822 sender display names for brand spoofing (e.g. "Habib Bank Security" sent from a Gmail or high-risk domain), embedded deceptive hyperlinks, and coercive urgency pretexts.
- **`backend/app/services/conversation_service.py` (110 lines):**  
  Multi-turn dialogue analyzer tracking social engineering escalation, authority impersonation (police/FIA officer pretexts), and rapid transition to peer-to-peer money transfers.
- **`backend/app/services/fia_reporting_service.py` (258 lines):**  
  Generates tamper-evident PDF/JSON Evidence Dossiers containing verified timestamps, defanged links, model limitation disclosures, and SHA-256 integrity hashes for NR3C legal submission.
- **`backend/app/services/rag_service.py` (125 lines):**  
  Retrieval-Augmented Generation service providing verified legal and anti-fraud advice without altering model scores or fabricating evidence.
- **`backend/app/services/extractor.py` (100 lines):**  
  High-speed regular expression utility extracting URLs, Pakistani phone numbers (+92/03xx), and email addresses from raw text.
- **`backend/app/services/job_manager.py` (28 lines):**  
  Asynchronous task tracking and job telemetry manager.
- **`backend/app/services/default_analyzers.py` (263 lines):**  
  Singleton registry holding shared initialized instances of all modality analyzers.

---

### 3.3 Frontend Layer: Next.js Command Center & PWA (`frontend/`)

#### 3.3.1 Application Shell & PWA Setup
- **`frontend/app/page.tsx` (34 lines):**  
  Master single-page application orchestrating the Navbar, Hero banner, Unified Evidence Studio Shell, Ambient Shield Hub, Footer, Mobile Navigation Bar, and PWA Install Sheet.
- **`frontend/app/layout.tsx` (68 lines):**  
  Root layout configuring HTML metadata, viewport fit cover, PWA theme-color (`#070a13`), and automatic background Service Worker registration.
- **`frontend/app/globals.css` (176 lines):**  
  Tailwind CSS design tokens, obsidian color variables, custom scrollbars, radar sweep keyframes, and smooth fade-in animations.
- **`frontend/public/manifest.json` (28 lines):**  
  W3C Web App Manifest declaring standalone display mode, application name, theme colors, and high-definition maskable icons (192px and 512px) for Android installation.
- **`frontend/public/sw.js` (38 lines):**  
  PWA Service Worker providing cache-first static asset delivery, immediate activation, and automatic bypass for dynamic `/api/` network requests.

#### 3.3.2 Studio & Forensic Components (`frontend/components/`)
- **`frontend/components/EvidenceStudioShell.tsx` (379 lines):**  
  The central evidence intake dock. Allows toggling all 6 modalities, loading pre-configured benchmarks (Bank Scam, Emergency Call, Clean Portal), client-side entity extraction, and executing multi-modal fusion.
- **`frontend/components/studio/VoiceCard.tsx` (130 lines):**  
  Audio intake component supporting HTML5 waveform playback, drag-and-drop custom WAV/MP3 uploads, and telephony benchmark samples.
- **`frontend/components/studio/WaveformVisualizer.tsx` (115 lines):**  
  Interactive HTML5 Canvas waveform visualizer displaying audio amplitudes and suspicious acoustic segment indicators.
- **`frontend/components/studio/MessageCard.tsx` (65 lines):**  
  Roman Urdu/English SMS intake card featuring real-time character counting and instant client-side regex detection of embedded URLs and phone numbers.
- **`frontend/components/studio/URLCard.tsx` (94 lines):**  
  Safe defanged URL inspector displaying protocol, host, path, and query tokens, rendering safe `hxxp://` notation.
- **`frontend/components/studio/PhoneCard.tsx` (84 lines):**  
  Phone number input card with E.164 preview, carrier badge, and caution notices.
- **`frontend/components/studio/EmailCard.tsx` (118 lines):**  
  Structured RFC email inspector with sender, subject, and body fields, displaying display-name spoofing warnings.
- **`frontend/components/studio/ConversationCard.tsx` (124 lines):**  
  Multi-turn dialogue replay builder allowing dynamic turn addition and escalation velocity tracking.
- **`frontend/components/dossier/ForensicDossierView.tsx` (412 lines):**  
  Comprehensive forensic verdict dossier rendering the 0–100 Risk Gauge, Multimodal Fusion Constellation, flagged anomaly spans, RAG safety assistant, and 1-click FIA reporting modal.
- **`frontend/components/ambient/AmbientShieldHub.tsx` (516 lines):**  
  Ambient Neural Shield command center with auto-polling (every 8s) displaying real-time Intercept Cards from WhatsApp Web/Gmail, and the official FIA Incident Registry.
- **`frontend/components/mobile/MobileNavBar.tsx` (95 lines):**  
  Fixed bottom navigation bar on mobile viewports providing one-thumb switching between Studio, Shield, FIA Portal, and Install App.
- **`frontend/components/mobile/PwaInstallPrompt.tsx` (85 lines):**  
  1-tap Android PWA installation banner handling browser `beforeinstallprompt` events.
- **`frontend/lib/api.ts` (340 lines):**  
  Fully typed TypeScript client communicating with FastAPI REST endpoints and managing ephemeral case lifecycle.
- **`frontend/lib/utils.ts` (45 lines):**  
  General utilities including URL defanging (`http` ➔ `hxxp`), date formatters, and Tailwind class merger (`cn`).

---

### 3.4 Browser Extension Layer (`extension/`)

- **`extension/manifest.json` (37 lines):**  
  Chrome Manifest V3 specification. Declares permissions (`activeTab`, `storage`, `contextMenus`, `notifications`), host permissions (`http://127.0.0.1:8000/*`), background service worker, and content scripts.
- **`extension/background.js` (68 lines):**  
  Service worker creating right-click context menu ("Scan selection with AegisAI Anti-Fraud"), managing tab communications, and relaying snippets to the backend ambient API.
- **`extension/popup.html` & `extension/popup.js` (145 lines combined):**  
  Dark obsidian popup UI providing active status badge, "Verify Page" button, risk score gauge, and direct link to the Command Center.
- **`extension/content_web.js` (112 lines):**  
  Injected script analyzing page links and displaying an in-page high-visibility red warning banner at the top of suspicious banking/phishing websites with 1-click FIA reporting.
- **`extension/content_whatsapp.js` (95 lines):**  
  Content script monitoring web.whatsapp.com chat streams, intercepting scam tokens and forwarding them to the ambient scanner.
- **`extension/content_email.js` (88 lines):**  
  Content script monitoring mail.google.com for display-name spoofing and credential harvesting hyperlinks.

---

### 3.5 Cross-Platform Mobile Companion (`mobile/`)

- **`mobile/package.json` & `mobile/app.json` (85 lines):**  
  Expo SDK 52 and React Native 0.76 configuration declaring Android package name, theme colors, and required telecommunication permissions.
- **`mobile/App.tsx` (92 lines):**  
  Mobile application entry point configuring bottom tab navigation and global connection state.
- **`mobile/screens/HomeScreen.tsx` (110 lines):**  
  Mobile dashboard displaying active shield toggle, threat stats, and quick scan buttons.
- **`mobile/screens/ScanScreen.tsx` (125 lines):**  
  Mobile evidence intake screen for text, URL, and phone number analysis.
- **`mobile/screens/AlertOverlayScreen.tsx` (90 lines):**  
  Floating heads-up scam warning modal displayed mid-conversation during calls or chats when risk crosses >60.
- **`mobile/screens/FiaHistoryScreen.tsx` (80 lines):**  
  Mobile view of submitted FIA reports and status tracking.
- **`mobile/services/websocket.ts` (75 lines):**  
  Low-latency WebSocket client streaming audio chunks and receiving instant threat triggers.

---

### 3.6 Machine Learning & Feature Extraction Layer (`ml/`)

- **`ml/src/voice/feature_extractor.py` (140 lines):**  
  Extracts 35 acoustic features from 16kHz audio: zero-crossing rate, spectral centroid, spectral bandwidth, spectral roll-off, spectral flux, 13 MFCCs, pitch mean, pitch variance, jitter, and shimmer.
- **`ml/src/message/attribution.py` (43 lines):**  
  Character-span regex engine matching bank freeze threats, biometric fraud, OTP solicitation, and lottery scams in Roman Urdu and English.
- **`ml/src/message/preprocessor.py` (35 lines):**  
  Text normalizer handling Roman Urdu spelling variations, lowercasing, and whitespace collapsing.
- **`ml/src/url/feature_extractor.py` (110 lines):**  
  Extracts lexical features: Shannon domain entropy, IP host literal detection, suspicious TLD matching, and banking brand token matching.
- **`ml/src/phone/normalizer.py` (85 lines):**  
  Validates phone numbers against Google phonenumbers and the PTA national numbering plan, returning E.164 and carrier information.
- **`ml/src/conversation/parser.py` (65 lines):**  
  Dialogue parser extracting speaker turns, timestamps, and conversational coercion velocity.

---

### 3.7 Verification, Automated Testing & Live Demo Scripts (`backend/tests/` & `scripts/`)

- **`scripts/verify_system_e2e.py` (151 lines):**  
  Full 7-stage automated cross-platform system verification script testing database initialization, all 6 modality analyzers, fusion assessment, ambient threat scanning, and FIA dossier generation.
- **`scripts/terminal_live_demo.py` (191 lines):**  
  Interactive live terminal demonstration script executing live voice, message, URL, chat, and phone analyses in terminal.
- **`scripts/generate_architecture_pdf.py` (420 lines):**  
  ReportLab generator producing the official 10-page technical manual PDF (`docs/PROJECT_ARCHITECTURE_AND_FILE_DIRECTORY.pdf`).
- **`backend/tests/` (13 test suites, ~1,200 lines total):**  
  Comprehensive Pytest test suites covering case lifecycles, each modality analyzer, weighted late-fusion mathematics, ambient scanning, RAG safety safeguards, and security compliance.

---

## 4. Verification & Operational Guidelines

1. **How to run the full automated verification:**
   ```powershell
   $env:PYTHONPATH="."
   python scripts/verify_system_e2e.py
   ```
   *Expected Result:* `ALL 7 END-TO-END STAGES VERIFIED WITH ZERO ERRORS (100% SUCCESS)`

2. **How to run the interactive live terminal demo:**
   ```powershell
   $env:PYTHONPATH="."
   python scripts/terminal_live_demo.py
   ```

3. **How to regenerate the Architecture PDF Manual:**
   ```powershell
   python scripts/generate_architecture_pdf.py
   ```
   Output: `docs/PROJECT_ARCHITECTURE_AND_FILE_DIRECTORY.pdf` (10 Pages, Formatted with Running Headers/Footers)

---

*Manual compiled for Final Year Project (FYP) Academic Defense & Industry Review.*
