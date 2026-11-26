# Software Requirements Specification (SRS)
## Multimodal Impersonation & Fraud Analyzer (AegisAI / Sentinel Core)
**Version:** 3.0 (Enterprise & High-Innovation Edition)  
**Status:** Implementation-ready baseline; dataset and deployment decisions must be validated during the relevant milestones.  
**Repository:** https://github.com/maryam441/Multimodal-Impersonation-and-Fraud-Analyzer  
**Primary branch:** `staging`  
**Frontend preference:** Next.js (App Router, TypeScript, Tailwind CSS, Framer Motion, WebAudio/Canvas APIs)  
**Backend preference:** Agent-selected, with Python/FastAPI as the default recommendation  
**Platform:** Responsive, interactive web application ("Cyber-Forensic Command Center" UX)  
**Deployment approach:** Hybrid and cloud-deployable

---

# PART I — PROJECT DEFINITION & PRODUCT VISION

## 1. Purpose & Vision

Build a complete, flagship-grade web application that analyzes user-submitted evidence related to possible impersonation, scams, phishing, and social engineering. The system analyzes five evidence modalities independently and, when multiple modalities are supplied, combines their outputs into one explainable, interactive risk assessment.

Beyond functional accuracy, the product must deliver an **extraordinary, modern "Forensic Intelligence Workspace" user experience**—combining intuitive progressive disclosure for everyday users with deep, interactive visual explainability (such as acoustic spectrogram overlays, live conversational threat-highlighting, and node-based risk fusion graphs) for investigative clarity.

The product is strictly a **decision-support and user-awareness tool**. It must communicate uncertainty transparently and must never claim that a model has definitively proved fraud or verified a person's identity.

The coding agent is responsible for taking the existing GitHub repository from its current state to a tested, documented, deployable project. First inspect the repository and preserve any useful existing work. Do not assume it is empty.

## 2. Confirmed project decisions and dataset situation

The project owner has confirmed:

- The application must be a **web application**, not a native Android/iOS app.
- Use **Next.js** for the frontend, engineered with high-craft UI/UX innovations.
- The owner already has datasets for:
  - Voice recordings / voice-related analysis.
  - Text messages / message-related analysis.
- The owner does **not** currently have datasets for:
  - URL / phishing-link analysis.
  - Phone-number reputation / risk analysis.
- The owner has not specified the exact filenames, formats, labels, sizes, licenses, or quality of the existing voice and text datasets. The agent must locate and inspect them in the repository or ask the owner to provide them. Never pretend to have accessed datasets that are not available.
- The agent may choose the remaining technologies, libraries, models, storage, and deployment approach based on suitability, maintainability, cost, and the existing repository.
- The agent must research suitable public datasets for URL and phone-number analysis before considering synthetic data creation.
- The agent must build the complete application incrementally, test each milestone, push completed work to GitHub `staging`, and obtain the owner's confirmation before starting the next milestone.

### Dataset acquisition policy

For every dataset, the agent must create a dataset register containing: name, source URL, publisher/owner, access date, license/terms, intended task, label definitions, fields, size, class distribution, known limitations, preprocessing steps, and train/validation/test split strategy.

**Voice and message datasets**
1. Locate the owner's existing datasets first.
2. Inspect schema, labels, class balance, duplicates, missing values, language coverage, audio quality, and licensing/usage restrictions.
3. Do not silently replace the owner's data with unrelated public data.
4. If files are missing or unusable, explain the issue and propose alternatives; obtain confirmation before substituting a major dataset.

**URL dataset**
1. Search for reputable, accessible public phishing/benign URL datasets and/or documented threat-intelligence feeds.
2. Evaluate recency, provenance, label reliability, licensing, duplicate leakage, class balance, and whether URLs are raw strings or include page content.
3. Prefer a reproducible dataset with documented labels and a defensible benign class.
4. If public data is insufficient, create a clearly labelled supplemental synthetic dataset using documented URL-generation rules. Synthetic records must never be represented as real-world observations.
5. Keep a dated snapshot and record collection dates. Avoid live crawling by default.

**Phone-number dataset**
1. Search for lawful, reputable, documented phone-number reputation or spam-report datasets/APIs that permit the intended use.
2. Investigate privacy, consent, licensing, coverage, geographic relevance (especially Pakistan where possible), and false-report risks.
3. Do not scrape private databases, bypass access controls, collect personal information unlawfully, or publish real private phone numbers.
4. If no suitable lawful dataset exists, create a **synthetic phone-number dataset** for pipeline and UI testing, with generated numbers reserved for examples or otherwise guaranteed not to contact real subscribers. Clearly mark it as synthetic.
5. A synthetic dataset cannot establish real-world phone-number reputation performance. In that situation, implement a transparent reputation lookup interface/provider adapter and return `insufficient_data` or `unavailable` when no verified source exists. Never invent reputation reports or label a real number fraudulent based only on a synthetic dataset.

**Conversation dataset**
- Conversation analysis is a distinct modality from single-message analysis. First determine whether the owner's message dataset contains multi-turn conversations with usable labels.
- If it does, document the mapping and evaluate it separately. If it does not, search for an appropriate public conversation/social-engineering dataset or create carefully labelled, clearly synthetic multi-turn examples for development and testing.
- Do not claim that a single-message classifier has been validated as a conversation classifier without evidence.

**Data integrity**
- Maintain source attribution and licenses.
- Use stratified splits where appropriate.
- Prevent train/test leakage by grouping duplicate or related samples before splitting.
- Fit preprocessing and feature selection on training data only.
- Keep a fixed random seed and record dataset/model versions.
- Never fabricate metrics, citations, dataset sources, or experiment results.

## 3. Product scope — five modalities

1. **Phone Number Analysis:** Evaluate a submitted number using lawful reputation data/provider responses and transparent metadata/carrier/region structural checks where justified.
2. **Voice Analysis:** Analyze an uploaded recording for signals associated with genuine versus synthetic/manipulated speech, subject to the capabilities and limitations of the selected dataset/model, accompanied by interactive acoustic visualization.
3. **Conversation Analysis:** Analyze pasted multi-turn conversations for impersonation, urgency, threats, pressure, requests for money, OTPs, credentials, or sensitive information with turn-by-turn psychological tactic tagging.
4. **Message Analysis:** Analyze a single SMS/WhatsApp-style text for scam and social-engineering indicators with token-level attention/trigger highlighting. English and Roman Urdu may be supported only to the extent that training and evaluation data justify.
5. **URL Analysis:** Analyze URL strings for phishing/suspicious indicators using validated ML features, structural anatomy breakdown, and, where available, reputable reputation metadata.

Any non-empty subset of the five modalities must be analyzable. The user must be able to submit one modality or combine several in one unified forensic case.

## 4. Out of scope

- Continuous monitoring or interception of live calls.
- Direct telecom-network integration.
- Accessing private WhatsApp, SMS, email, or social-media accounts.
- Face recognition, face enrollment, biometric login, or video identity verification.
- Claiming to identify the real person behind a number or voice.
- Guaranteed detection of every scam or deepfake.
- Automatic legal, banking, or financial decisions.
- Unapproved crawling of URLs or execution of downloaded content.

## 5. Intended users and roles

- **Guest/User:** Submit evidence via zero-friction workspace, view interactive forensic analysis, export signed/structured reports, or delete permitted reports immediately.
- **Registered User:** Manage own analysis history, saved case templates, and privacy retention settings.
- **Administrator (if authentication/admin features are implemented):** Manage model/provider configuration, review system health telemetry, and manage non-sensitive operational settings. Admin access must not expose raw user evidence without a justified permission and audit trail.

Authentication can be implemented if it fits the existing repository and delivery scope. Do not block the core analysis workflow on optional account features; recommend guest mode or account mode based on security and deployment implications, then document the decision.

## 6. Core user workflow

1. User lands on an interactive, high-trust entry experience showcasing live architectural capabilities and privacy guarantees.
2. User enters the **Unified Evidence Studio** and activates any combination of the five modalities (1 to 5).
3. User supplies evidence via smart dropzones, audio waveform recorders/uploaders, chat-thread parsers, or URL inspectors.
4. Frontend performs instant client-side hygiene checks (format, duration, safe URL normalization) and displays explicit privacy/consent controls.
5. Backend creates an analysis case and dispatches asynchronous jobs with real-time progress streaming (SSE/WebSockets or smart polling).
6. Each active modality analyzer returns a structured forensic result, including status, risk signals, calibrated confidence (where valid), granular evidence spans/timestamps, and model limitations.
7. Fusion engine combines available modality outputs mathematically without treating missing modalities as safe, generating a cross-modal correlation map.
8. User explores the **Interactive Forensic Dossier**: overall radial risk gauge, multimodal fusion graph, modality deep-dives (spectrograms, annotated chat bubbles, URL anatomy), plain-language RAG-grounded explanation, and actionable safety playbooks.
9. User can export a clean PDF/JSON summary or trigger immediate cryptographic/hard deletion of case data.

---

# PART II — FUNCTIONAL REQUIREMENTS

## 7. Functional requirements

### FR-01 — Responsive, High-Craft Web Interface
The application shall provide an ultra-responsive, accessible, studio-grade interface for desktop, tablet, and mobile browsers with fluid micro-interactions and zero layout shift.

### FR-02 — Multi-modality Case Creation ("Evidence Studio")
The user shall be able to assemble a case using any one or more of the five modalities in a single unified canvas. The UI shall visually distinguish active modalities, pending inputs, and unprovided modalities.

### FR-03 — Phone-number input and analysis
The system shall:
- Accept a phone number with country code or an intelligent country/region selector (including Pakistan `+92` formatting support).
- Normalize and validate format (E.164) and extract non-invasive structural metadata (region, line type where lawful) without assuming format validity means safety.
- Query only approved reputation data sources/providers.
- Return source, retrieval time, evidence, coverage limitations, and status.
- Distinguish `known_reports`, `no_known_reports`, `insufficient_data`, `unavailable`, and `invalid_input`.
- Never infer that a number is safe merely because no reports were found.
- Never call a real number or send an SMS/OTP as part of analysis.

### FR-04 — Voice upload and acoustic analysis
The system shall:
- Accept supported audio formats (`.wav`, `.mp3`, `.ogg`, `.m4a`, `.flac`) and enforce configurable file-size/duration limits based on the selected model and deployment capacity.
- Validate file magic bytes, duration, sample rate, channels, and corruption.
- Render an interactive client-side waveform preview prior to and after submission.
- Preprocess audio reproducibly and run the selected deep-learning/audio model.
- Return `analyzed`, `inconclusive`, or `failed` status as appropriate, along with temporal/spectral anomaly markers if supported by the model architecture.
- Explain that recording quality, codec, language, unseen synthesis methods, and domain shift can affect reliability.
- Never label a short or poor-quality recording confidently if the model is not validated for it.

### FR-05 — Conversation analysis
The system shall accept multi-turn text (supporting both raw paste and smart speaker-turn parsing) and analyze social-engineering and impersonation indicators, including:
- Claimed identity/authority.
- Urgency and time pressure.
- Threats, intimidation, or emotional manipulation.
- Requests for money, transfers, OTPs, passwords, credentials, or personal information.
- Suspicious instructions or attempts to move the user to another channel ("platform migration").

The output shall map detected tactics directly onto the corresponding conversation turns/spans in the UI and distinguish conversation-level escalation analysis from single-message analysis.

### FR-06 — Message analysis
The system shall accept a single message and identify suspicious patterns with phrase-level evidence attribution. Language support must be explicitly documented and evaluated. Roman Urdu support must not be claimed unless sufficient representative data and tests exist.

### FR-07 — URL analysis & Anatomy Breakdown
The system shall:
- Accept a URL string and normalize/defang it safely (`hxxp://`) in the UI so users cannot accidentally click dangerous links.
- Deconstruct and visually display URL anatomy (protocol, subdomain depth, registrable domain, TLD risk profile, path entropy, suspicious parameters, IP-host usage).
- Extract documented lexical/host-based features and run a trained model plus optional approved reputation metadata.
- Return the feature signals and source status.
- Avoid fetching URL content by default.
- If page fetching is later enabled, use strict SSRF protections, DNS/IP validation, redirect limits, timeouts, isolated execution, no credential forwarding, and no active content execution. This must be separately documented and tested.
- Distinguish `phishing_likely`, `benign_likely`, `inconclusive`, and `unavailable`; never guarantee safety.

### FR-08 — Real-time Asynchronous Processing
Long-running audio/model tasks shall use background jobs where appropriate. The frontend shall display a live **Pipeline Telemetry Tracker** showing per-modality stages (`queued`, `preprocessing`, `inference`, `completed`, `inconclusive`, or `failed`) with safe retry controls.

### FR-09 — Structured modality results
Every modality shall return a consistent schema containing:
- Modality name.
- Status.
- Risk signal/score where supported.
- Model/provider and version.
- Evidence/features/reasons (with character spans or timestamps where applicable).
- Confidence only if meaningful and calibrated; otherwise omit or clearly label it as an uncalibrated model score.
- Limitations and error information.
- Timestamp and processing duration.

### FR-10 — Multimodal fusion
The system shall combine available modality results into one overall assessment. The fusion approach must be selected through documented experiments, not arbitrary guessed weights.

At minimum:
- Implement a transparent weighted late-fusion baseline.
- Compare it with at least one justified alternative if data and time permit (e.g. a trained meta-classifier or another evidence-fusion method).
- Handle missing modalities explicitly (never imputing missing evidence as zero-risk).
- Avoid double-counting correlated evidence (e.g., identical URL inside a message).
- Preserve modality-level results and explanations.
- Return an overall `inconclusive` status when evidence is insufficient or unreliable rather than forcing a confident risk label.

### FR-11 — Risk score and categories
The user-facing risk score shall be in the range 0–100 when a defensible score can be calculated.

| Score | Category | Visual Semantic |
|---|---|---|
| 0–30 | Low Risk | Emerald / Calm Slate |
| 31–60 | Medium Risk | Amber / Caution Gold |
| 61–100 | High Risk | Crimson / Alert Coral |

Test boundary values 30/31 and 60/61. The score is a risk indicator, not a probability unless calibrated and validated as such. Do not show a numerical score for cases where the fusion method cannot justify one; show `Inconclusive` with reasons instead.

### FR-12 — Explainable Forensic Report
The report shall show:
- Overall risk score/category or inconclusive status.
- Visual modality coverage matrix (analyzed vs. missing vs. inconclusive).
- Individual modality results with interactive evidence highlights.
- Main evidence and contributing signals.
- Plain-language explanation grounded in deterministic outputs.
- Model/provider limitations and uncertainty disclaimers.
- Actionable, context-aware safety recommendations.
- Analysis timestamp, model/data versions, and one-click export (JSON / Print-optimized Report).

### FR-13 — Safety recommendations & Interactive Playbooks
Recommendations must be tailored to the triggered modalities and may include:
- Do not transfer money under pressure.
- Do not share OTPs, passwords, or credentials.
- Do not click suspicious links.
- Verify identity using a separately obtained trusted contact method.
- Contact the relevant bank/service using its official channel.
- Block/report a sender only after the user independently verifies the situation.

Recommendations must be proportional and must not present model output as proof.

### FR-14 — History and deletion
If history is enabled, users shall see only their own cases. Provide instant deletion controls ("Purge Case") and a documented retention policy. Raw audio and raw text shall not be retained permanently by default.

### FR-15 — Admin/model observability
Provide secure, limited operational visibility into model versions, job status, latency metrics, errors, and provider health. Do not expose secrets, API keys, or raw evidence in logs.

### FR-16 — Documentation
Provide setup instructions, environment variable examples, dataset register, model cards, API documentation, test instructions, deployment instructions, known limitations, and user guide.

### FR-17 — Human review / approval gate
Where the system proposes an external action (e.g. submitting a URL to a third-party service, enabling live URL fetching, or using a paid API), it must require explicit user configuration/approval via an interactive confirmation modal. The application itself must not automatically contact a suspected sender or take financial/legal action.

### FR-18 — FYP AI methodology support
The implementation and documentation shall preserve the project's research objectives:
- Develop and evaluate individual modality components.
- Include a genuine deep-learning component for voice analysis if the available voice data supports it.
- Use machine-learning/NLP approaches for message, conversation, and URL analysis where supported by data.
- Compare single-modality and multimodal configurations.
- Include an LLM + Retrieval-Augmented Generation (RAG) explanation/assistant layer only if it can be grounded in trusted project knowledge and model outputs.
- Include an agent/tool workflow with a human-approval stop before any external or consequential action.
- Do not use an LLM to invent detection results, evidence, sources, confidence, or risk scores. The deterministic analysis/fusion layer is the source of truth; the LLM may explain its structured output.
- If the owner's supervisor has a specific minimum number/type of ML and DL models, verify it with the owner/supervisor and document the mapping before final model selection. Do not inflate model count by renaming variants of the same model.

---

# PART III — NON-FUNCTIONAL, PRIVACY AND SECURITY REQUIREMENTS

## 8. Non-functional requirements

- **NFR-01 Usability & Craft:** Main analysis flow must be effortless for non-technical users while offering rich progressive disclosure for technical/forensic inspection.
- **NFR-02 Responsiveness:** Fluid layout across desktop (1440px+), laptop, tablet, and mobile viewports.
- **NFR-03 Reliability:** Fault-isolated execution; one failed or timed-out modality must never crash the overall case or block available results.
- **NFR-04 Maintainability:** Clean separation between frontend design system, API contracts, modality inference engines, fusion logic, and data pipelines.
- **NFR-05 Reproducibility:** Track dataset versions, model versions, random seeds, configurations, and evaluation outputs.
- **NFR-06 Performance:** Define measurable response-time and throughput targets after measuring the chosen models and deployment environment. Optimize frontend perceived performance with skeleton loaders, optimistic UI states, and streaming status updates.
- **NFR-07 Accessibility:** WCAG 2.1 AA compliance—semantic HTML, full keyboard navigation, screen-reader ARIA labels, focus rings, and non-color-only status indicators.
- **NFR-08 Portability:** Support one-command local development with Docker Compose and documented environment setup.
- **NFR-09 Observability:** Structured JSON logs, health checks, job telemetry, and actionable errors; zero secrets or raw sensitive evidence in logs.
- **NFR-10 Cost awareness:** Prefer open-source/local tools where practical; document any paid API, GPU, hosting, or data-provider dependency before adopting it.

## 9. Privacy and security

- Obtain explicit user consent before processing uploaded evidence.
- Use HTTPS in deployed environments.
- Validate and limit uploads; inspect actual file magic bytes/headers, not only filename extensions.
- Store secrets in environment variables/secret manager; commit only `.env.example`.
- Apply authentication and authorization if user accounts are enabled.
- Protect against SQL injection, XSS, CSRF where applicable, path traversal, unsafe file upload, and SSRF.
- Defang all user-submitted URLs in UI rendering so malicious links are never clickable hyperlinks.
- Use rate limits and abuse controls.
- Avoid logging phone numbers, message bodies, audio, credentials, or complete URLs if they may contain tokens.
- Encrypt sensitive stored data where appropriate.
- Delete temporary files immediately after processing and enforce strict TTL retention periods.
- Never store raw evidence permanently by default. If a feature requires retention, disclose it and provide immediate deletion.
- Use synthetic or properly licensed datasets for development and evaluation; do not expose private real-world phone numbers.
- Keep an audit trail for administrative changes and third-party provider use.

---

# PART IV — TECHNICAL ARCHITECTURE

## 10. Technology selection policy

The owner has selected Next.js for the frontend and delegated all other technology decisions to the agent. The agent must inspect the existing repository first. If no strong existing architecture exists, use the following recommended baseline, or document a better choice with reasons before implementation.

| Layer | Recommended technology | Reason |
|---|---|---|
| Frontend Core | Next.js (App Router) + TypeScript | Modern SSR/CSR hybrid web architecture, strong typing, routing |
| UI & Motion | Tailwind CSS + shadcn/ui + Framer Motion + Lucide Icons | Precision forensic design system, smooth transitions, accessible primitives |
| Data Viz & Audio | Web Audio API / WaveSurfer.js + Recharts / Custom SVG | Interactive audio waveforms, spectral overlays, and fusion graphs |
| Backend API | Python FastAPI | High-performance async Python ML/audio ecosystem and typed OpenAPI |
| Validation | Pydantic v2 | Strict request/response schema validation |
| Database | PostgreSQL | Relational case, result, audit, and model metadata |
| ORM/migrations | SQLAlchemy 2.0 + Alembic | Maintainable async schema evolution |
| Background jobs | Redis + Celery or RQ | Isolated audio/model execution and retries |
| ML | scikit-learn, pandas, NumPy | Reproducible tabular/text/URL baselines |
| Deep learning | PyTorch + torchaudio (or suitable existing framework) | Voice/audio deep-learning pipeline |
| NLP/audio | Select libraries based on dataset and model requirements | Avoid unnecessary dependencies |
| Experiment tracking | MLflow or documented lightweight JSON/CSV registry | Reproducible experiments |
| Testing | Pytest + Vitest/React Testing Library + Playwright | Unit, integration, and browser E2E tests |
| Packaging | Docker + Docker Compose | Reproducible local setup |
| CI | GitHub Actions (if practical) | Automated lint, typecheck, and test checks |

Avoid unnecessary microservices; a modular monolith with separate background workers is preferred unless the repository or measured workload justifies otherwise.

## 11. High-level architecture

```text
Browser (Next.js Interactive Forensic Studio)
  |  [Client-side URL Defanging, Waveform Rendering, Input Hygiene]
  v
FastAPI Gateway (/api/v1)
  |------------------- PostgreSQL (cases / structured results / model metadata)
  |
  |---- Redis / Background Job Queue (Real-time Stage Telemetry)
             |
             v
       Fault-Isolated Analysis Workers
        |      |         |         |      |
      Phone  Voice  Conversation Message URL
        \      |         |         |      /
         Standardized Modality Evidence Schemas
                         |
                         v
              Multimodal Fusion Engine
       (Weighted / Meta-Fusion + Missingness Logic)
                         |
                         v
         Grounded RAG & Explainability Layer
          (Citations + Human-Approval Gate)
                         |
                         v
        Interactive Forensic Dossier Report
```

Keep model inference behind a clean abstract service interface so models can run locally on CPU/GPU or on a dedicated inference worker without changing frontend contracts.

## 12. Suggested repository structure

Adapt this to the existing repository; do not overwrite existing working code without review.

```text
/
├── frontend/                    # Next.js application
│   ├── app/                     # App Router pages & layouts
│   ├── components/
│   │   ├── ui/                  # Base accessible design primitives
│   │   ├── studio/              # Multi-modality evidence composer components
│   │   ├── forensics/           # Waveform viewer, chat highlighter, URL anatomy, fusion graph
│   │   └── shared/              # Telemetry bars, privacy badges, export controls
│   ├── features/                # Domain logic per modality
│   ├── lib/                     # API client, defangers, formatters, validators
│   ├── hooks/                   # Real-time job polling/SSE & audio hooks
│   ├── public/
│   └── tests/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── workers/
│   │   └── main.py
│   └── tests/
├── ml/
│   ├── datasets/
│   │   ├── README.md
│   │   └── manifests/
│   ├── notebooks/
│   ├── src/
│   │   ├── voice/
│   │   ├── message/
│   │   ├── conversation/
│   │   ├── url/
│   │   ├── phone/
│   │   └── fusion/
│   ├── artifacts/               # Large model files excluded from Git
│   ├── experiments/
│   └── model_cards/
├── docs/
│   ├── SRS.md
│   ├── DATASETS.md
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── MODEL_CARDS/
│   └── USER_GUIDE.md
├── infra/
│   ├── docker/
│   └── deployment/
├── scripts/
├── .github/workflows/
├── .env.example
├── .gitignore
└── README.md
```

Large datasets, audio files, trained model weights, secrets, and user uploads must not be committed to Git.

## 13. Database entities

Design a normalized schema based on actual requirements and existing code:

- `users` (only if accounts are implemented).
- `analysis_cases`: case id, owner/guest token where applicable, status, retention expiry timestamp, created/updated timestamps.
- `evidence_items`: case id, modality, safe metadata, temporary storage reference, retention/deletion status.
- `modality_results`: case id, modality, status, model/provider name and version, score/signal, explanation, structured evidence (including spans/timestamps), limitations.
- `fusion_assessments`: case id, fusion version, overall score/category/status, modality weights/contributions, explanation, missing modalities.
- `model_versions`: model name, version, artifact reference, dataset version, evaluation metadata.
- `audit_events`: administrative/configuration/external-lookup events without raw evidence.
- `provider_checks`: provider, source, retrieval time, response status, and safe metadata.

Never store raw evidence indefinitely by default.

## 14. API contract

Use versioned REST endpoints under `/api/v1`. Adapt names to the existing API if one exists.

```text
GET    /api/v1/health
POST   /api/v1/analyses
GET    /api/v1/analyses/{analysis_id}
DELETE /api/v1/analyses/{analysis_id}

POST   /api/v1/analyses/{analysis_id}/phone
POST   /api/v1/analyses/{analysis_id}/voice
POST   /api/v1/analyses/{analysis_id}/conversation
POST   /api/v1/analyses/{analysis_id}/message
POST   /api/v1/analyses/{analysis_id}/url

GET    /api/v1/analyses/{analysis_id}/status
GET    /api/v1/analyses/{analysis_id}/report
POST   /api/v1/analyses/{analysis_id}/explain   # Grounded RAG follow-up Q&A

GET    /api/v1/models
GET    /api/v1/providers/status
```

### Standard modality result shape

```json
{
  "analysis_id": "example-id",
  "modality": "url",
  "status": "analyzed",
  "risk_score": 72,
  "risk_label": "high",
  "confidence": null,
  "confidence_note": "No calibrated probability is available.",
  "signals": [
    {
      "code": "SUSPICIOUS_URL_PATTERN",
      "description": "A documented URL feature contributed to the model output.",
      "evidence": "Safe, non-sensitive feature summary",
      "span": { "start": 0, "end": 18 }
    }
  ],
  "model": {
    "name": "url-classifier",
    "version": "1.0"
  },
  "limitations": [],
  "processing_ms": 42,
  "created_at": "ISO-8601 timestamp"
}
```

This is an illustrative contract only. Do not return fabricated scores or evidence. The actual response must be generated by the implemented analyzer.

---

# PART V — ML, DATA AND RESEARCH METHODOLOGY

## 15. Modality development requirements

### 15.1 Voice
- Inspect the owner's dataset before choosing architecture.
- Determine whether labels distinguish genuine, synthetic, cloned, converted, replayed, or manipulated audio. Do not collapse labels without documenting why.
- Build a reproducible audio preprocessing pipeline.
- Establish a baseline and a deep-learning model appropriate to data size and compute.
- Evaluate on speaker-disjoint and, where possible, generator/source-disjoint splits to reduce leakage.
- Report accuracy, precision, recall, F1, confusion matrix, and suitable additional metrics.
- Test robustness across duration, codecs, noise, and sample rates where data permits.
- Provide an inconclusive outcome for unsupported languages/domains or poor-quality inputs.

### 15.2 Message
- Inspect the owner's text dataset and labels.
- Build text cleaning/normalization carefully; preserve meaning and relevant scam indicators.
- Compare a transparent ML baseline (e.g. TF-IDF + Logistic Regression/Linear SVM) with a suitable stronger NLP model if data and compute justify it.
- Extract interpretable feature/token attributions so the UI can highlight trigger phrases.
- Evaluate language coverage separately. Do not claim Roman Urdu support unless supported by data.
- Report per-class metrics and error examples.

### 15.3 Conversation
- Treat conversation-level context as its own task.
- Use multi-turn labelled data where available.
- If creating synthetic conversation examples, label them synthetic and keep them separate from real evaluation data.
- Detect relevant patterns with turn-level evidence spans and avoid assuming that any single keyword proves fraud.
- Evaluate conversation-level classification separately from message classification.

### 15.4 URL
- Complete public dataset/provider research before generating supplemental synthetic samples.
- Record source, license, retrieval date, labels, and limitations.
- Deduplicate and prevent domain/URL leakage across splits.
- Compare a simple baseline with a suitable tree-based or other model.
- Output structural URL anatomy breakdown alongside model signals.
- Validate performance on a later time-based holdout if timestamps permit, because phishing patterns change over time.
- Do not present a URL as safe solely because the classifier returns a benign-like result.

### 15.5 Phone number
- Research lawful reputation sources and provider APIs before generating synthetic data.
- Clearly separate number-format validation from reputation evidence.
- Do not train a fraud classifier on synthetic phone numbers and then claim it detects real-world scam numbers.
- If verified real-world labels are unavailable, use a provider adapter plus synthetic fixtures for tests, and return `insufficient_data`/`unavailable` for unsupported real lookups.
- Document country coverage and stale/missing-report limitations.

## 16. Fusion and risk assessment

- Start with a documented weighted late-fusion baseline.
- Select weights only from validation experiments or a clearly justified expert protocol; do not invent weights and present them as learned.
- Compare alternatives where feasible.
- Handle missing, failed, and inconclusive modalities distinctly.
- Consider dependence between evidence sources to avoid double-counting (e.g. a URL copied from the same message).
- Preserve raw modality outputs and the reason each signal contributes.
- Evaluate message-only, URL-only, voice-only, conversation-only, phone-only (where data permits), pairwise combinations, and multiple-modality cases.
- Compare against individual-modality performance to determine whether fusion adds measurable value.
- Evaluate calibration if confidence/probability is displayed.
- Include ablation tests and error analysis.

## 17. LLM, RAG and agent layer

If implemented:
- The deterministic modality models and fusion engine must calculate the assessment.
- The LLM may convert structured evidence into understandable explanations, answer follow-up questions in an interactive report drawer, and provide general safety education.
- RAG must retrieve from a curated, versioned knowledge base (e.g. project documentation and trusted public anti-fraud guidance with source metadata).
- Display inline source citations for retrieved factual guidance.
- The LLM must not fabricate evidence, sources, model metrics, risk scores, or claims about a phone number/URL.
- The agent may call internal analysis/report tools.
- Require human approval via explicit UI confirmation before external lookups that incur cost or disclose user evidence, and before any future consequential action.
- Provide safe deterministic fallback if the LLM/RAG provider is unavailable.

## 18. Model evaluation and reporting

For each modality and fusion model, record:
- Dataset name/version and source.
- Train/validation/test split method.
- Class distribution.
- Preprocessing and feature definitions.
- Model architecture/hyperparameters.
- Random seed.
- Accuracy, precision, recall, F1, confusion matrix.
- Per-class metrics and relevant error analysis.
- Calibration metrics if probabilities are presented.
- Inference latency and hardware.
- Known limitations and intended use.

Never hardcode desired or illustrative metrics as actual results. Report only metrics produced by reproducible evaluation runs.

---

# PART VI — FRONTEND EXPERIENCE & INNOVATION ARCHITECTURE

## 19. Design Philosophy & Visual Language ("Forensic Precision")

The frontend must stand out as a benchmark in AI-security product design—avoiding generic Bootstrap-style forms or cluttered dark-mode clichés in favor of a **tactile, high-trust "Forensic Intelligence Studio"**:

- **Aesthetic Direction:** Clean, high-contrast architectural surfaces (supporting both crisp Daylight Slate mode and Obsidian Forensic mode), precision monospace typography (`JetBrains Mono` / `Geist Mono`) for hashes, phone numbers, URLs, and timestamps paired with clean geometric sans-serif (`Inter` / `Plus Jakarta Sans`) for human explanations.
- **Semantic Color System:** Strictly disciplined use of color—neutral surfaces for workspace chrome, reserving vibrant Emerald (Low Risk), Amber (Medium Risk), and Crimson (High Risk) exclusively for verified risk indicators and evidence highlights.
- **Motion with Purpose:** Smooth spring-based transitions (Framer Motion) for drawer expansions, modality card activation, and progressive risk-meter reveals—never distracting or delaying user interaction.

## 20. Flagship Frontend Innovations

To make the user experience truly remarkable and genuinely helpful, implement the following five signature interactive innovations:

1. **Unified Multi-Modal "Evidence Dock" & Live Case Builder:**
   - Instead of five disconnected pages, provide a cohesive **Evidence Dock** where users toggle on/off the modalities they possess (e.g., *Message + URL + Voice*).
   - **Smart Cross-Modality Extraction:** When a user pastes an SMS or conversation containing a URL or phone number, offer a one-click **"Extract & Analyze Embedded Link/Number"** chip that automatically populates the URL or Phone modality card (with user consent), demonstrating intelligent multimodal workflow.
2. **Interactive Acoustic Waveform & Anomaly Timeline (Voice Modality):**
   - Render an interactive WebAudio/Canvas waveform upon audio upload with play/pause scrubbing, duration/sample-rate telemetry badge, and quality warnings (e.g., clipping or excessive background noise).
   - In the report view, overlay model-identified anomaly regions or segment-level scores directly onto the waveform timeline so users can inspect *which part* of the audio triggered concern.
3. **Annotated Chat-Thread & Tactic Highlighter (Conversation & Message Modalities):**
   - Transform pasted multi-turn conversations into a clean, structured **Chat Replay View** distinguishing sender vs. recipient turns.
   - Highlight detected social-engineering triggers inline (e.g., `[Urgency]`, `[Authority Impersonation]`, `[OTP/Credential Harvest]`, `[Channel Switch]`) with interactive hover/click popovers explaining *why* that specific phrase is a common manipulation tactic.
4. **Safe URL Anatomy X-Ray & Defanged Inspector (URL Modality):**
   - Automatically display user-submitted URLs in defanged notation (`hxxps://example[.]com`) so accidental clicks are impossible.
   - Present a visual **URL Anatomy Breakdown** separating Protocol, Subdomains, Root Domain, TLD, and Query Parameters into color-coded tokens, visually pinpointing typosquatting, excessive subdomain nesting, or suspicious entropy.
5. **Interactive Multimodal Fusion Constellation & Grounded AI Co-Pilot (Report View):**
   - Display a visual **Fusion Contribution Diagram** showing how each active modality contributed to the final 0–100 Risk Gauge, while explicitly graying out unprovided modalities as `"Not Evaluated (Neutral)"` so users clearly see what is missing.
   - Include a collapsible **"Ask Forensic Assistant" Drawer** powered by the grounded RAG layer—allowing users to ask *"What should I do if I already replied?"* or *"Explain the URL flags simply"*, complete with clickable source badges and deterministic guardrails.

## 21. Required Screens & Views

1. **Landing Experience:** High-craft hero with interactive architecture preview, clear ethical boundaries ("Decision-Support, Not Proof"), privacy-first commitment, and instant "Launch Evidence Studio" CTA.
2. **Unified Evidence Studio (Dashboard / New Analysis):** Modular 5-card evidence composer with smart extraction chips, preset demo cases (clearly labelled `[DEMO FIXTURE]` for instant testing), and explicit consent toggle.
3. **Modality Input Modules (Integrated & Standalone):**
   - *Phone Module:* International dial-code picker, E.164 live formatter, provider coverage indicator.
   - *Voice Module:* Drag-and-drop acoustic dropzone, live waveform preview, format/duration validator.
   - *Conversation Module:* Multi-turn text composer with auto-turn parser (`Sender:` / `Me:`) and paste cleaner.
   - *Message Module:* Clean text composer with character counter and supported-language indicator.
   - *URL Module:* Defanged URL input bar with instant structural preview.
4. **Live Pipeline Telemetry Screen:** Real-time per-modality progress tracker (`Queued` → `Preprocessing` → `Model Inference` → `Completed / Inconclusive`) with elapsed timers and fault-isolated retry buttons.
5. **Interactive Forensic Dossier (Report Screen):** Radial risk gauge, modality coverage pills, interactive fusion breakdown, deep-dive evidence tabs (Waveform, Annotated Chat, URL X-Ray, Phone Metadata), RAG explanation assistant, safety action checklist, and Print/JSON export.
6. **Case History & Privacy Vault:** Searchable/filterable list of user's own cases (if accounts/session history enabled) with retention countdown badges and one-click permanent purge.
7. **System & Model Observability View:** Restricted operational dashboard displaying active model versions, dataset provenance, provider health checks, and latency telemetry (zero raw user evidence).

### UI Quality & Integrity Standards
- Accessible labels, keyboard navigation, focus states, loading skeletons, empty states, and graceful error boundaries.
- Never use sensationalist fear-mongering copy or imply 100% certainty.
- Never display fake charts, fake user activity, fake model metrics, or mock data as production results.
- Any sample/demo button on the UI must be explicitly tagged as **Sample Case (Synthetic/Test Fixture)**.
- Keep visual components modular, well-typed, and decoupled from API transport logic.

---

# PART VII — TESTING AND DEFINITION OF DONE

## 22. Testing requirements

- Unit tests for validators, preprocessing, feature extraction, modality interfaces, fusion, risk boundaries, privacy/deletion, and API schemas.
- Integration tests for case creation, each modality, background jobs, fusion, report retrieval, and error handling.
- Frontend component, interaction, and accessibility tests (including waveform rendering, URL defanging, and evidence highlighters).
- End-to-end tests (Playwright) for one modality, multiple modalities, smart extraction flow, missing modality, failed modality, and case deletion.
- Security tests for upload magic-byte validation, authorization, rate limiting, XSS prevention in rendered chat/URLs, SSRF protections if URL fetching exists, and secret leakage.
- ML tests for data leakage, deterministic preprocessing, model loading, class mapping, and metrics.
- Test risk category boundaries 30/31 and 60/61.
- Test that missing modalities are not interpreted as safe.
- Test that uncalibrated confidence is not represented as probability.
- Test unavailable phone reputation data does not produce a fabricated safe/unsafe verdict.

## 23. Definition of Done for every milestone

A milestone is complete only when:
1. Implementation for that milestone is finished.
2. Relevant automated tests pass.
3. Lint/type checks pass where configured.
4. No secrets, datasets, raw evidence, or model binaries are accidentally committed.
5. Documentation is updated.
6. The feature branch is committed and pushed.
7. The milestone branch is merged into `staging` and `staging` is pushed.
8. Remote commit SHA and test results are verified.
9. The agent provides a completion report and asks the owner to approve the next milestone.

A task is not complete merely because code was written. Never claim a test, push, merge, deployment, or dataset download succeeded unless it was actually verified.

---

# PART VIII — GITHUB AND AGENT EXECUTION PROTOCOL

## 24. Repository and branch policy

Repository: `https://github.com/maryam441/Multimodal-Impersonation-and-Fraud-Analyzer`

- `main` is protected/release branch; never push directly to it.
- `staging` is the integration branch.
- Create one feature branch for each milestone, for example:
  - `feature/M00-repository-audit`
  - `feature/M01-foundation`
  - `feature/M02-dataset-audit`
- Before editing, inspect `git status`, current branch, remotes, recent commits, repository tree, README, existing code, and existing tests.
- Never discard or overwrite uncommitted user work.
- If working tree is dirty, report it and preserve changes. Do not stash/reset/clean without approval.
- Pull latest `staging` before starting each milestone.
- Commit with clear messages.
- Push the feature branch.
- Merge the completed feature branch into `staging` using a safe merge/PR workflow; push `staging`.
- Verify remote branch and commit SHA after push.
- Do not force-push.
- If GitHub authentication, permissions, branch protection, conflicts, or remote access prevent a push/merge, stop and report the exact blocker. Do not claim success.

## 25. Mandatory milestone approval loop

For **every** milestone:
1. State the milestone ID and objective before starting.
2. Inspect dependencies and current repository state.
3. Implement only the milestone's scope.
4. Run relevant tests, lint, type checks, and manual checks.
5. Update documentation and milestone notes.
6. Commit on the milestone feature branch.
7. Push the feature branch.
8. Merge into `staging` and push `staging`.
9. Verify the remote commit SHA and branch state.
10. Report:
   - What was completed.
   - Files/folders changed.
   - Tests and exact results.
   - Dataset/model sources added, if any.
   - Commit SHA and feature branch.
   - `staging` merge/push SHA.
   - Known issues and decisions needed.
11. Ask: **“Milestone Mxx is complete and pushed to staging. Do you approve starting Mxx+1?”**
12. STOP and wait. Do not start the next milestone until the owner explicitly approves.

If a milestone requires a user decision, ask only the necessary question and wait. Do not silently make a high-impact choice. The agent may choose ordinary implementation details independently as authorized by the owner, but must document them.

---

# PART IX — MILESTONE ROADMAP

## M00 — Repository audit and safe baseline
- Inspect repository, branches, remotes, existing source, dependencies, tests, and documentation.
- Identify current implementation status and preserve all useful code.
- Check GitHub write access and `staging` branch existence.
- Produce `docs/REPOSITORY_AUDIT.md` and a proposed implementation plan.
- Do not perform destructive cleanup.
**Acceptance:** Audit is accurate, repository remains intact, tests/status are reported, and report is pushed to `staging`.

## M01 — Requirements confirmation and technical decisions
- Review this SRS and map requirements to implementation tasks.
- Select backend and supporting technologies based on existing code; default to FastAPI if there is no compelling reason otherwise.
- Decide auth/guest workflow, local development setup, storage strategy, and deployment assumptions.
- Record architecture decisions in `docs/ARCHITECTURE.md`.
- Identify questions requiring owner approval.
**Acceptance:** Decisions are documented with reasons; no unsupported dataset/model claims.

## M02 — Dataset discovery and audit
- Locate the owner's voice and message datasets.
- Inspect formats, labels, licensing, quality, class balance, languages, and availability.
- Search for lawful, documented URL and phone reputation datasets/providers.
- Determine whether conversation data exists in the supplied message data.
- Create `docs/DATASETS.md` and machine-readable manifests.
- If URL/phone sources are unsuitable, propose synthetic supplement and transparent provider/unavailable fallback. Ask before major substitutions or paid services.
**Acceptance:** Dataset register and gap report are complete; sources are verifiable; no dataset is falsely represented.

## M03 — Project foundation and developer experience
- Establish frontend/backend structure consistent with the repository.
- Configure environment management, formatting, linting, tests, Docker Compose, and health endpoints.
- Add `.env.example`, `.gitignore`, README setup, and CI where practical.
**Acceptance:** Clean local setup works; health checks and baseline tests pass.

## M04 — Backend core and database
- Implement API structure, database models, migrations, case lifecycle, validation, and error handling.
- Add safe storage abstractions and retention/deletion behavior.
**Acceptance:** Database migrations and API integration tests pass.

## M05 — Frontend foundation, design system & landing experience
- Implement Next.js App Router shell, "Forensic Precision" theme tokens (Daylight & Obsidian modes), typography, Framer Motion transitions, and reusable accessible UI primitives.
- Build the high-craft Landing Experience and Unified Evidence Studio shell.
- Ensure zero fake production metrics; mark any demo fixtures clearly.
**Acceptance:** Responsive pages render cleanly, accessibility checks pass, and frontend build succeeds.

## M06 — Innovative evidence input workflows
- Implement all five interactive modality input cards inside the Evidence Studio (including client-side audio waveform preview, smart conversation turn parser, defanged URL input, and one-click cross-modality link/number extraction chips).
- Add client/server validation, consent/privacy messaging, and clear missing-modality indicators.
**Acceptance:** All five forms work seamlessly, prevent unsafe link clicks, and submit valid payloads/files to backend.

## M07 — Job orchestration and result contracts
- Implement analysis job lifecycle, background queue if needed, retries, real-time status telemetry, and standardized modality result schema (supporting spans/timestamps).
- Use deterministic mock adapters only for integration tests, visibly marked as test fixtures.
**Acceptance:** Jobs transition correctly; failure in one modality does not crash other tasks.

## M08 — Voice model pipeline
- Use the audited owner-provided voice dataset.
- Build preprocessing, baseline, deep-learning model, training/evaluation scripts, model card, and inference adapter (emitting segment/temporal anomaly markers where supported).
- Validate speaker/source leakage controls and quality limitations.
**Acceptance:** Reproducible training/evaluation and API inference work; results are not fabricated.

## M09 — Message model pipeline
- Use the audited owner-provided message dataset.
- Build preprocessing, baseline and justified stronger model if appropriate, token/phrase attribution extraction, evaluation, model card, and inference adapter.
- Document language coverage and Roman Urdu limitations.
**Acceptance:** Reproducible training/evaluation and message API inference work.

## M10 — Conversation analysis
- Audit multi-turn data; use it if appropriate.
- Otherwise research a suitable public source or prepare clearly synthetic development data with owner approval where needed.
- Build conversation-level classifier/rules and turn-level tactic evidence spans; evaluate separately.
**Acceptance:** Conversation analysis is distinct, tested, and limitations are documented.

## M11 — URL analysis and dataset
- Complete dataset/provider research and license review.
- Build dataset pipeline, URL structural anatomy & lexical feature extraction, baseline and selected model, evaluation, model card, and inference adapter.
- Use synthetic data only as labelled supplement/testing where required.
- Do not fetch URL content unless separately approved and secured.
**Acceptance:** Reproducible URL model pipeline and safe API behavior work.

## M12 — Phone-number analysis
- Complete lawful source/provider research and document coverage.
- Implement number normalization (E.164), safe structural metadata extraction, and provider adapter(s).
- If no valid reputation source is available, return transparent `insufficient_data`/`unavailable`; synthetic records are test fixtures only.
**Acceptance:** No fabricated reputation claims; provider status and limitations are visible.

## M13 — Fusion engine and risk framework
- Implement weighted late-fusion baseline and compare a justified alternative if feasible.
- Handle missing/failed/inconclusive modalities and correlated evidence (preventing double-counting).
- Implement 0–100 score only where justified and Low/Medium/High boundaries exactly as specified.
- Add boundary and ablation tests.
**Acceptance:** Fusion is reproducible, explainable, tested, and does not treat missing data as safe.

## M14 — Explainability, RAG and agent workflow
- Build report explanations from structured modality/fusion evidence.
- Add curated RAG knowledge base and source metadata if feasible.
- Add interactive follow-up Forensic Assistant drawer and internal tools with strict grounding.
- Require human approval before external/costly actions or evidence disclosure.
**Acceptance:** LLM cannot alter scores or invent evidence; unavailable LLM has a safe fallback.

## M15 — Interactive Forensic Dossier & full integration
- Connect all five modalities, live pipeline telemetry, and the **Interactive Forensic Dossier** (radial risk gauge, fusion constellation graph, waveform anomaly overlay, annotated chat replay, URL anatomy X-ray, RAG assistant drawer, and export/purge controls).
- Add end-to-end Playwright tests for single, multimodal, smart-extracted, and edge-case journeys.
**Acceptance:** Complete user journey works seamlessly from browser input to interactive explainable dossier.

## M16 — Security, QA and research evaluation
- Run full unit, integration, end-to-end, security, accessibility, and performance tests.
- Run individual modality and multimodal evaluation experiments.
- Prepare confusion matrices, metrics, ablation comparisons, error analysis, and known limitations.
- Fix critical/high-severity issues.
**Acceptance:** Results are reproducible and accurately reported; no fake metrics.

## M17 — Deployment, documentation and final release candidate
- Prepare production build and deployment configuration.
- Document environment variables, database migration, model artifacts, worker setup, backups, privacy/retention, and rollback.
- Deploy only after owner approval and after confirming costs/secrets.
- Verify deployed health and core workflows.
- Produce final README, user guide, API docs, model cards, dataset register, and release notes.
**Acceptance:** Reproducible deployment, verified workflows, complete documentation, and release candidate merged to `staging`. Merge to `main` only with explicit owner approval.

---

# PART X — FINAL INSTRUCTIONS TO THE CODING AGENT

You are the implementation agent for this project. Your job is to build the complete working application with exceptional engineering and UI/UX craft, not merely provide suggestions or a static UI.

1. Read this entire SRS before coding.
2. Start with **M00 only**. Do not jump ahead.
3. Inspect the actual GitHub repository and its current state before modifying files.
4. Preserve existing useful code and user changes.
5. The owner already has voice and message datasets. Locate and audit those first; do not assume their contents or labels.
6. There are no owner-provided URL or phone-number datasets. Research suitable lawful public datasets/providers first. Create clearly labelled synthetic supplemental data only when justified. Never pretend synthetic phone records prove real-world phone reputation.
7. For conversation analysis, determine whether the message dataset contains multi-turn conversations; otherwise find or create a clearly labelled suitable source.
8. Use Next.js for the frontend, implementing the **Forensic Precision** design system and the five signature frontend innovations defined in Part VI. Choose the backend and all other technologies yourself based on suitability and repository compatibility; document your decisions. FastAPI is the preferred default because the ML/audio stack is Python-based.
9. Build a complete, integrated, secure, tested web application with all five modalities, fusion, explainable reports, and documented limitations.
10. Do not fabricate datasets, citations, model metrics, confidence, phone reputation, test results, pushes, merges, or deployment status.
11. Use feature branches and push every approved completed milestone to the repository's `staging` branch as described above. Never push directly to `main`.
12. After every milestone, provide the required completion report and ask for explicit approval. Then stop. Do not continue until the owner approves.
13. Ask the owner only when a real decision or permission is required. Do not interrupt for routine technology choices that the owner has delegated to you.
14. Do not expose API keys, credentials, raw user evidence, or private datasets in Git.
15. At the end, deliver a working project, reproducible setup, documentation, evaluation results, and a clear list of any remaining limitations.

**Begin now with M00 — Repository audit and safe baseline. Do not start M01 until the owner has reviewed and approved the M00 completion report.**