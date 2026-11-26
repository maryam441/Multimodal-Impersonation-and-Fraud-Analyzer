# Software Requirements Specification (SRS)
## Multimodal Impersonation & Fraud Analyzer (Sentinel Core / AegisAI)
**Version:** 4.0 (Enterprise Cross-Platform Real-Time Anti-Fraud & Law Enforcement Edition)  
**Status:** Implementation-Ready Baseline & Technical Contract  
**Repository:** `https://github.com/maryam441/Multimodal-Impersonation-and-Fraud-Analyzer`  
**Primary Integration Branch:** `staging`  
**Platforms:**
- **Next.js Web Forensic Command Center (`frontend/`):** TypeScript, Tailwind CSS, shadcn/ui, WebAudio API, Generative UI widgets.
- **Installable Cross-Platform Mobile App (`mobile/`):** React Native / Expo (Android & iOS) with explicit user consent, Notification Listener, SMS/Email Intent, Call Screening Service, and in-conversation Floating Alert Overlay.
- **Ambient Browser Guardian (`extension/`):** Manifest V3 for Chrome, Edge, and Brave with WhatsApp Web and Gmail inline scanning.
- **Desktop Ambient Daemon (`desktop_agent/`):** OS-level background clipboard watcher with native Windows toast alerts.
- **High-Performance AI Backend (`backend/`):** Python FastAPI, WebSockets (`/api/v1/stream/live`), SQLAlchemy async, SQLite/PostgreSQL, PyTorch, Scikit-learn.

---

# PART I — PRODUCT VISION & ARCHITECTURAL FOUNDATION

## 1. Executive Purpose & Vision

The **Multimodal Impersonation & Fraud Analyzer (Sentinel Core / AegisAI)** is a comprehensive, multi-platform anti-fraud cybersecurity ecosystem designed to protect citizens, enterprises, and investigators from impersonation, financial fraud, social engineering scams, and synthetic media attacks.

The product operates across three tiers:
1. **Ambient Real-Time Shield (Mobile + Browser + Desktop):** Actively monitors live communications (SMS, WhatsApp, incoming calls, emails, and web pages). Whenever a high-probability scam, fake banking alert, synthetic voice, or OTP solicitation is detected mid-conversation, it triggers an instant, unobtrusive heads-up warning overlay.
2. **Autonomous Law Enforcement Reporting Agent (Human-in-the-Loop):** When a scam attempt is detected, the agent presents a one-tap authorization modal: *"Scam indicators detected. Do you grant permission to compile an evidence dossier and report this incident to FIA Cyber Crime Wing (NR3C)?"* Upon explicit confirmation, it compiles an immutable, cryptographically sealed (SHA-256) legal affidavit under **PECA 2016** and registers an official tracking complaint.
3. **Forensic Intelligence Command Center (Web):** A forensic workspace providing deep explainability, radial SVG risk gauges (0–100), multimodal fusion constellation graphs, acoustic spectrograms, annotated chat replay, defanged URL token inspection, and State Bank of Pakistan (SBP) / PTA grounded regulatory guidance.

---

## 2. Core Architectural Principles & Safe Standards

### 2.1 Decision-Support & Epistemic Humility
The system functions strictly as an intelligent decision-support and threat-awareness system. In accordance with legal and scientific standards, it must communicate uncertainty transparently and **never fabricate evidence or definitively proclaim guilt**.

### 2.2 Strict Human-in-the-Loop Authorization Gate
External actions—specifically transmitting reports to the Federal Investigation Agency (FIA), notifying telecom operators (PTA), or conducting live third-party lookups—**must strictly require explicit human operator confirmation**. Automated background dispatch without user consent is strictly prohibited.

### 2.3 SSRF Defense & Defanged URL Policy
To prevent Server-Side Request Forgery (SSRF) and malicious code execution, the URL and Email analyzers do not perform live recursive network crawling of untrusted domains. All extracted URLs are defanged into safe non-clickable representations (e.g. `hxxps://bank-secure[.]pk`).

### 2.4 Neutrality on Missing Modalities & Correlation De-duplication
A missing piece of evidence must never be treated as proof of safety ($w_i = 0$ for unsupplied modalities). Furthermore, when redundant signals are extracted from the same source (e.g. a phone number and URL mentioned inside a single SMS), a correlation de-duplication discount ($\delta = 0.75$) is applied to prevent artificial score inflation.

---

# PART II — SYSTEM ARCHITECTURE & MONOREPO TOPOLOGY

```
Multimodal-Impersonation-and-Fraud-Analyzer/
├── backend/                  # FastAPI async REST & WebSocket server
│   ├── app/
│   │   ├── api/v1/          # REST endpoints (health, cases, analysis, ambient, incidents, stream)
│   │   ├── core/            # Config, telemetry, security settings
│   │   ├── db/              # SQLAlchemy async models & SQLite/PostgreSQL session
│   │   ├── schemas/         # Pydantic v2 validation contracts
│   │   └── services/        # 6 Modality analyzers, fusion engine, RAG assistant, FIA reporter
│   └── tests/               # Pytest async test suites across all modalities and security gates
├── frontend/                 # Next.js 15 App Router Web Command Center
│   ├── app/                 # Pages, layouts, metadata
│   ├── components/
│   │   ├── ambient/         # Live Intercepts Feed & FIA Incident Registry Hub
│   │   ├── dossier/         # Forensic explainability cards (RiskGauge, Constellation, Waveform)
│   │   └── studio/          # 6 Interactive evidence input cards & entity extraction chips
│   ├── lib/                 # Type-safe API client & WebSocket streaming hooks
│   └── public/              # Lightweight audio samples, SVG badges, static assets
├── mobile/                   # React Native / Expo installable companion app
│   ├── app/                 # Expo Router screens (Onboarding, Active Shield, Live Screening)
│   ├── components/          # Floating Heads-Up Alert Overlay, Risk Badges, Consent Modals
│   ├── services/            # Background notification listener, call audio streaming, WebSockets
│   └── assets/              # App icons, splash screens, permission diagrams
├── extension/                # Manifest V3 Chrome/Edge Ambient Shield
│   ├── content_whatsapp.js  # WhatsApp Web DOM observer & inline threat pills
│   ├── content_email.js     # Gmail & webmail reading pane scanner
│   ├── content_web.js       # Phishing URL and deceptive domain interceptor
│   ├── background.js        # Service worker, badge counter, system notifications
│   └── popup/               # Quick Ambient Scanner & protection toggle UI
├── desktop_agent/            # Python OS-level background clipboard daemon
│   └── sentinel_agent.py    # Windows toast notification & CLI quick scanner
├── ml/                       # Machine learning source & model registries
│   ├── src/                 # Voice acoustic models, Roman Urdu NLP, URL host feature extractors
│   └── datasets/manifests/  # Audited dataset manifests & synthetic benchmark registers
└── docs/                     # Architectural specs, model cards, audit logs, and manuals
```

---

# PART III — THE 6 INDEPENDENT MODALITY ANALYZERS

### 1. Phone Modality Analyzer
- **Input:** Raw MSISDN string (e.g., `03001234567`, `+92-300-1234567`).
- **Processing:** E.164 normalization, PTA network carrier resolution (Jazz, Telenor, Zong, Ufone, SCOM).
- **Cautious Fallback Protocol:** Per SRS §15.5, unverified numbers return `status="insufficient_data"` with neutral weight to prevent algorithmic hallucination. Verified malicious benchmark fixtures trigger threat attribution.

### 2. Real-Time & Batch Voice Deepfake Analyzer
- **Input:** Audio chunks (live stream via WebSockets) or uploaded audio files (`.wav`, `.mp3`, `.ogg`).
- **Processing:** 35 acoustic metrics (Pitch F0 mean/std, jitter local/rap, shimmer local/apq, spectral centroid, spectral rolloff, MFCCs) + temporal anomaly segmentation identifying synthetic voice discontinuities.

### 3. Live Conversation & Social Engineering Analyzer
- **Input:** Multi-turn dialogue stream or pasted chat logs.
- **Processing:** Regex & NLP dialogue parser classifying turns into distinct psychological manipulation tactics:
  - Authority Impersonation (police, FIA, court, bank manager).
  - Artificial Time Pressure & Deadline Induction.
  - Credential & OTP Solicitation.
  - Coercive Financial Transfer Demand (Easypaisa, JazzCash, Wire).
  - Platform Migration (coercing user to move from official apps to private chats).

### 4. Single Message (SMS/WhatsApp) Analyzer
- **Input:** Short text snippet in English, Urdu, or Roman Urdu.
- **Processing:** Domain-specific tokenization and phrase attribution matching against documented Pakistani fraud vectors (Benazir Income Support / Inam scam, bank account suspension, lottery fake prize).

### 5. Email Header & Phishing Body Analyzer
- **Input:** Email headers (From, Return-Path, Authentication-Results) + body content + hyperlinks.
- **Processing:**
  - Header Spoof Inspection: Evaluates SPF, DKIM, and DMARC alignment; flags display-name spoofing (e.g. `HBL Support <attacker@gmail.com>`).
  - Body Urgency & Deception: Flags threats of legal action, account termination, and fake invoices.
  - Embedded Link Inspection: Extracts embedded URLs and passes to the URL analyzer for static feature evaluation.

### 6. Lexical & Host URL Analyzer
- **Input:** Target URL or extracted web link.
- **Processing:** Offline lexical & host feature extractor based on PhiUSIIL phishing benchmark features (hyphen counts, suspicious TLDs, entropy, IP hosts, subdomain depth, deceptive brand keywords in hostname) without performing live web crawling.

---

# PART IV — REAL-TIME STREAMING & MOBILE SHIELD

### 1. WebSocket Streaming Endpoint (`/api/v1/stream/live`)
- **Protocol:** Bidirectional WebSocket stream supporting binary audio frames (PCM/WAV) and JSON text events.
- **Latency Guarantee:** Ingestion to threat verdict roundtrip $< 50\text{ ms}$.
- **Framing Specification:**
  ```json
  {
    "event": "chunk_ingest",
    "modality": "audio" | "conversation",
    "session_id": "uuid",
    "timestamp": 1700000000,
    "payload": { ... }
  }
  ```

### 2. Mobile In-Conversation Alert Overlay
- When the live fused score crosses $S_{fused} \ge 60.0$, the mobile app renders an unobtrusive floating heads-up banner:
  `[🛡️ Sentinel Warning: 88% Fraud / Impersonation Detected]`
  `[Review & Report to FIA]`

---

# PART V — AUTONOMOUS FIA REPORTING PIPELINE & PECA 2016

### 1. Human-in-the-Loop Confirmation Gate
Before any transmission to law enforcement, the system strictly prompts:
> *"Scam indicators detected from [Accused Target]. Do you grant permission to compile an evidence dossier and report this incident to FIA Cyber Crime Wing (NR3C)?"*

### 2. Statutory Legal Charges Under PECA 2016
- **PECA 2016 Section 13 (Electronic Forgery):** Phishing URLs, fake brand domains, and deceptive digital portals.
- **PECA 2016 Section 14 (Electronic Fraud):** Financial deceit, OTP theft, and fake transaction inducement.
- **PECA 2016 Section 16 (Unauthorized Use of Identity Information):** Bank officer or law enforcement impersonation.
- **PECA 2016 Section 20 (Offences Against Dignity / Coercion):** Intimidation, panic induction, and threats of arrest.

### 3. Cryptographic Tamper-Evident Evidence Seal
Every complaint affidavit is sealed with a SHA-256 digest of all contributing signals, metric logs, and timestamps. Tracking numbers follow the standard format:
$$\text{FIA-CCW-YYYY-XXXXX}$$

---

# PART VI — VERIFICATION & COMPLIANCE CRITERIA

1. **Automated Testing:** 100% test pass rate across all unit, integration, and security test suites.
2. **Zero Leakage Guarantee:** Strict `.gitignore` policy ensuring zero raw datasets, audio recordings, or proprietary model binaries are committed to version control.
3. **Branching Discipline:** Development proceeds exclusively on feature branches merged cleanly into `staging`. Direct pushes to `main` are strictly forbidden.
