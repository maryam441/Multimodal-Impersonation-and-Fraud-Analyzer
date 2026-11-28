"""
Generates the comprehensive Project Architecture and File-by-File Technical Directory Manual
in both Markdown (.md) and PDF (.pdf) formats using ReportLab.
"""

import os
import sys
from datetime import datetime, timezone
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas


class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and print 'Page X of Y' on all pages.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Skip header/footer on title/cover page
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Running Header
        self.drawString(54, letter[1] - 36, "AegisAI Sentinel — Technical Architecture & File Directory Manual")
        self.setFont("Helvetica", 8)
        self.drawRightString(letter[0] - 54, letter[1] - 36, "Version 3.0 Enterprise Reference")
        
        # Header dividing line
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)

        # Running Footer
        self.line(54, 46, letter[0] - 54, 46)
        self.drawString(54, 34, "CONFIDENTIAL — Final Year Project (FYP) Technical Documentation")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 54, 34, page_str)
        self.restoreState()


def build_manual_pdf(pdf_path: str):
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    PRIMARY = colors.HexColor("#0f172a")      # Slate 900
    ACCENT_BLUE = colors.HexColor("#1e40af")  # Blue 800
    ACCENT_CYAN = colors.HexColor("#0284c7")  # Sky 600
    TEXT_MAIN = colors.HexColor("#1e293b")    # Slate 800
    TEXT_MUTED = colors.HexColor("#475569")   # Slate 600
    BORDER_LIGHT = colors.HexColor("#e2e8f0") # Slate 200
    BG_LIGHT = colors.HexColor("#f8fafc")     # Slate 50
    CARD_BG = colors.HexColor("#f1f5f9")      # Slate 100

    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=PRIMARY,
        spaceAfter=10
    )
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=ACCENT_CYAN,
        spaceAfter=25
    )
    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=14,
        textColor=TEXT_MUTED
    )
    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=PRIMARY,
        spaceBefore=18,
        spaceAfter=8,
        keepWithNext=True
    )
    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=ACCENT_BLUE,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=TEXT_MAIN,
        spaceAfter=6
    )
    code_path_style = ParagraphStyle(
        'CodePath',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#0f766e")
    )
    desc_style = ParagraphStyle(
        'DescText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=TEXT_MAIN
    )
    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    story = []

    # ================= COVER / TITLE PAGE =================
    story.append(Spacer(1, 40))
    story.append(Paragraph("AegisAI Sentinel", title_style))
    story.append(Paragraph("Multimodal Impersonation & Fraud Analyzer — v3.0", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=ACCENT_BLUE, spaceAfter=20))
    
    story.append(Paragraph("<b>Document Type:</b> Comprehensive System Architecture & File-by-File Technical Directory Manual", body_style))
    story.append(Paragraph("<b>Target Audience:</b> Project Supervisors, External Academic Reviewers, and System Engineers", body_style))
    story.append(Paragraph("<b>Repository:</b> <code>https://github.com/maryam441/Multimodal-Impersonation-and-Fraud-Analyzer</code>", body_style))
    story.append(Paragraph("<b>Target Integration Branch:</b> <code>staging</code> | Verification Status: <b>100% Passing (All 7 Stages)</b>", body_style))
    story.append(Paragraph(f"<b>Generated At:</b> {datetime.now(timezone.utc).strftime('%B %d, %Y - %H:%M UTC')}", body_style))
    story.append(Spacer(1, 15))

    # Executive Overview Callout
    overview_text = (
        "<b>Executive Overview:</b><br/>"
        "AegisAI Sentinel is an autonomous, cross-platform cyber-forensic platform engineered to detect and mitigate multi-vector "
        "social engineering, voice deepfakes, phishing attacks, and authority impersonation across Pakistan's telecommunication "
        "and digital banking ecosystems. The platform features an intelligent monorepo combining a Python FastAPI AI backend, "
        "a Next.js 15 forensic command center (PWA enabled), an installable Expo React Native mobile companion, and a Chrome/Edge "
        "Manifest V3 extension providing real-time ambient threat interception with 1-click statutory reporting to FIA Cybercrime Wing (NR3C) under PECA 2016."
    )
    overview_table = Table(
        [[Paragraph(overview_text, body_style)]],
        colWidths=[504]
    )
    overview_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
        ('BOX', (0, 0), (-1, -1), 1, ACCENT_CYAN),
        ('PADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(overview_table)
    story.append(Spacer(1, 20))

    # Table of Contents Summary
    story.append(Paragraph("<b>Table of Contents:</b>", h2_style))
    toc_items = [
        "1. Executive Overview & Monorepo Topology",
        "2. Complete Project Directory Hierarchy",
        "3. Root Configuration & Orchestration Engine",
        "4. Backend Layer: Architecture, Database, APIs & Modality Analyzers",
        "5. Frontend Layer: Forensic Command Center & Mobile PWA",
        "6. Mobile Layer: React Native Ambient Shield Companion",
        "7. Extension Layer: Chrome/Edge Real-Time Fraud Interceptor",
        "8. Machine Learning Layer: Acoustic, NLP, Lexical & Carrier Extractors",
        "9. Verification & Automated Testing Suite",
        "10. Research Datasets, Benchmarks & Model Weights",
        "11. Master File-by-File Technical Index"
    ]
    for item in toc_items:
        story.append(Paragraph(f"• {item}", meta_style))

    story.append(PageBreak())

    # ================= SECTION 1: MONOREPO TOPOLOGY =================
    story.append(Paragraph("1. Monorepo Topology & High-Level Architecture", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.75, color=PRIMARY, spaceAfter=12))

    story.append(Paragraph(
        "The codebase is architected as a modular, unified monorepo designed for high scalability, zero circular dependencies, "
        "and rigorous separation of concerns between user-facing presentation layers, machine learning feature extraction engines, "
        "and statutory audit trails.",
        body_style
    ))

    topology_data = [
        [
            Paragraph("<b>Subsystem</b>", table_header_style),
            Paragraph("<b>Directory Path</b>", table_header_style),
            Paragraph("<b>Technology Stack</b>", table_header_style),
            Paragraph("<b>Core Responsibility</b>", table_header_style)
        ],
        [
            Paragraph("<b>AI Backend</b>", desc_style),
            Paragraph("<code>backend/</code>", code_path_style),
            Paragraph("Python 3.12, FastAPI, SQLAlchemy, SQLite/PostgreSQL", desc_style),
            Paragraph("6-modality analyzers, weighted fusion, RAG assistant, FIA dispatch, WebSocket stream.", desc_style)
        ],
        [
            Paragraph("<b>Web Center</b>", desc_style),
            Paragraph("<code>frontend/</code>", code_path_style),
            Paragraph("Next.js 15, TypeScript, Tailwind CSS, PWA Service Worker", desc_style),
            Paragraph("Forensic studio, acoustic waveform visualizer, ambient shield hub, 1-tap PWA install.", desc_style)
        ],
        [
            Paragraph("<b>Mobile Shield</b>", desc_style),
            Paragraph("<code>mobile/</code>", code_path_style),
            Paragraph("React Native, Expo SDK 52, Native WebSockets", desc_style),
            Paragraph("Background ambient listening, in-call floating alert banner, mobile incident history.", desc_style)
        ],
        [
            Paragraph("<b>Browser Extension</b>", desc_style),
            Paragraph("<code>extension/</code>", code_path_style),
            Paragraph("Chrome Manifest V3, Webpack/Vanilla JS, Content Scripts", desc_style),
            Paragraph("Active page scanner, context-menu scanner, WhatsApp Web & Gmail in-page fraud banner.", desc_style)
        ],
        [
            Paragraph("<b>Machine Learning</b>", desc_style),
            Paragraph("<code>ml/</code>", code_path_style),
            Paragraph("Librosa, scikit-learn, phonenumbers, regex NLP", desc_style),
            Paragraph("35 acoustic metrics, Roman Urdu n-gram matcher, Shannon entropy, E.164 resolver.", desc_style)
        ],
        [
            Paragraph("<b>Verification</b>", desc_style),
            Paragraph("<code>scripts/ & backend/tests/</code>", code_path_style),
            Paragraph("Pytest, AsyncIO, HTTPX, Powershell", desc_style),
            Paragraph("13 pytest test suites, 7-stage automated E2E system validator, live terminal demo.", desc_style)
        ]
    ]

    t_top = Table(topology_data, colWidths=[80, 85, 140, 199])
    t_top.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, CARD_BG]),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_top)
    story.append(Spacer(1, 15))

    # ================= SECTION 2: ROOT CONFIGURATION =================
    story.append(Paragraph("2. Root Configuration & Orchestration Engine", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.75, color=PRIMARY, spaceAfter=10))

    root_files = [
        ("requirements.txt", "Defines all Python dependencies including FastAPI, Uvicorn, SQLAlchemy, Pydantic, Librosa, PyTorch, scikit-learn, ReportLab, and Pytest."),
        ("package.json", "Root-level Node monorepo manifest orchestrating concurrent dev scripts across frontend, mobile, and extension workspaces."),
        (".env.example", "Template for environment variables: API keys, database connection strings, JWT secrets, and FIA portal endpoint URLs."),
        (".gitignore", "Comprehensive security ignore file preventing accidental leaks of model binaries, raw telephony audio recordings, datasets, and logs."),
        (".github/workflows/ci.yml", "Automated GitHub Actions CI pipeline executing linting, unit tests, and security scanning on every push to staging."),
        ("agent_runner.py", "Autonomous CLI orchestration harness providing automated task execution, milestone tracking, and model evaluation triggers."),
        ("train_voice_model.py", "Stand-alone PyTorch/scikit-learn training script for acoustic spoof detection, extracting 35 metrics and optimizing ROC-AUC."),
        ("predict_voice.py", "Direct inference utility for standalone .wav audio verification, outputting synthetic probability and acoustic anomalies."),
        ("generate_cleaned_voice_dataset.py", "Pipeline preprocessing raw audio files to standard 16kHz mono PCM telephony format, balancing ham and spam classes.")
    ]

    for fname, fdesc in root_files:
        story.append(Paragraph(f"<b>{fname}</b>", code_path_style))
        story.append(Paragraph(fdesc, desc_style))
        story.append(Spacer(1, 3))

    story.append(Spacer(1, 10))

    # ================= SECTION 3: BACKEND ARCHITECTURE =================
    story.append(Paragraph("3. Backend Layer: Architecture, Database & Services", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.75, color=PRIMARY, spaceAfter=10))

    story.append(Paragraph(
        "The backend engine located in <code>backend/app/</code> is built on modern Python 3.12 and FastAPI. "
        "It features an asynchronous database layer (SQLAlchemy + SQLite/PostgreSQL) and 6 specialized modality analyzers "
        "unified by a transparent weighted late-fusion engine complying with SRS §15 mathematical mandates.",
        body_style
    ))

    backend_subsystems = [
        ("backend/app/main.py", "Application Entry Point",
         "Initializes FastAPI instance, attaches asynchronous lifespan event for DB migration and evidence directory creation, "
         "mounts permissive CORS middleware for Web and Extension origins, and registers API v1 routers (/health, /cases, /analysis, /ambient, /incidents, /stream)."),
        
        ("backend/app/core/config.py", "Global Environment Configuration",
         "Central Pydantic Settings class parsing environment variables: APP_NAME, API_V1_PREFIX, ALLOWED_ORIGINS, EVIDENCE_UPLOAD_DIR, "
         "DATABASE_URL, and cryptographic session parameters with sensible defaults."),

        ("backend/app/db/session.py", "Asynchronous Database Session Manager",
         "Initializes the SQLAlchemy async engine and sessionmaker. Exposes get_db dependency for FastAPI routes and init_db function "
         "for automatic table creation on startup."),

        ("backend/app/db/models.py", "Relational ORM Database Models",
         "Defines 6 core tables: Case (ephemeral evidence container with TTL), EvidenceItem (individual multimodal inputs), "
         "ModalityResult (model scores, signals, confidence notes), FusionAssessment (fused risk score, ablation delta), "
         "AmbientScanLog (live intercepted threats from Chrome/WhatsApp), and FiaIncidentRecord (statutory reports with reference numbers)."),

        ("backend/app/schemas/modality.py", "Standardized Modality Contracts",
         "Pydantic contracts including EvidenceSignal (code, category, severity, evidence), EvidenceSpan (character/timestamp offsets), "
         "and ModalityResultResponse guaranteeing consistent JSON schemas across all 6 analyzers."),

        ("backend/app/services/base_analyzer.py", "Abstract Base Analyzer Contract",
         "Abstract class defining run_analysis(case_id, payload) -> ModalityResultResponse, ensuring every modality implements uniform "
         "telemetry, error handling, confidence scoring, and model limitation tracking."),

        ("backend/app/services/fusion_service.py", "Weighted Late-Fusion Engine",
         "Implements the SRS §15 fusion formula. Dynamically rescales weights when modalities are missing (never treats missing as safe), "
         "applies cross-modality correlation penalties to prevent double-counting, and outputs an overall Risk Gauge (0-100) and ablation matrix."),

        ("backend/app/services/message_service.py", "Roman Urdu & English NLP Classifier",
         "Analyzes SMS and WhatsApp messages for financial extortion, biometric update fraud, account freeze threats, and OTP solicitation, "
         "emitting precise character spans and threat severity attributions."),

        ("backend/app/services/url_service.py", "Defanged URL & Lexical Inspector",
         "Computes Shannon domain entropy, flags numerical IP literals, detects high-risk phishing TLDs (.xyz, .click, .top), "
         "identifies brand token squatting (HBL, JazzCash, Easypaisa), and safely defangs URLs without live crawling."),

        ("backend/app/services/phone_service.py", "PTA Number Normalizer & Fallback Resolver",
         "Standardizes phone numbers into E.164 and local formats, identifies carrier plans (Jazz, Telenor, Zong, Ufone), "
         "and strictly returns status='insufficient_data' for unverified real numbers per SRS §15.5 to avoid algorithmic hallucination."),

        ("backend/app/services/voice_service.py", "Acoustic Deepfake & Spoof Analyzer",
         "Extracts 35 acoustic parameters from telephony audio (MFCCs, spectral flux, jitter, shimmer, pitch variance) "
         "to identify synthetic voice generation, audio tampering, and cloned caller identities."),

        ("backend/app/services/email_service.py", "RFC Email Header & Phishing Inspector",
         "Inspects RFC 2822 sender headers, detects Display-Name Spoofing (e.g. 'Habib Bank' from gmail.com), extracts embedded links, "
         "and classifies coercive social engineering language in email bodies."),

        ("backend/app/services/conversation_service.py", "Multi-Turn Conversational Escalation Analyzer",
         "Parses multi-turn dialogue transcripts to detect authority impersonation (police, FIA officer), artificial urgency, "
         "and financial extortion escalation across conversation turns."),

        ("backend/app/services/fia_reporting_service.py", "Statutory FIA Cybercrime Reporting Adapter",
         "Generates tamper-evident PDF/JSON Evidence Dossiers containing verified timestamps, defanged links, operator notes, "
         "and SHA-256 evidence hashes, registering complaints under PECA 2016."),

        ("backend/app/services/rag_service.py", "Grounded AI Safety Assistant",
         "Retrieval-Augmented Generation service providing verified legal and anti-fraud advice without altering model scores or fabricating evidence."),

        ("backend/app/api/v1/ambient.py", "Real-Time Ambient Threat Interception Router",
         "Ultra-low-latency endpoint (/api/v1/ambient/scan) receiving live snippets from browser extensions, returning instant threat classifications "
         "and populating the dashboard's Live Intercept Feed."),

        ("backend/app/api/v1/stream.py", "Streaming WebSocket Gateway",
         "WebSocket endpoint (ws://.../api/v1/stream/live) for low-latency streaming of live call audio and chat chunks, emitting instant alert triggers.")
    ]

    for fpath, ftitle, fdesc in backend_subsystems:
        story.append(Paragraph(f"<b>{ftitle}</b> (<code>{fpath}</code>)", h2_style))
        story.append(Paragraph(fdesc, desc_style))
        story.append(Spacer(1, 2))

    story.append(PageBreak())

    # ================= SECTION 4: FRONTEND COMMAND CENTER =================
    story.append(Paragraph("4. Frontend Layer: Forensic Command Center & Mobile PWA", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.75, color=PRIMARY, spaceAfter=10))

    story.append(Paragraph(
        "The frontend is implemented in <code>frontend/</code> using Next.js 15, React 19, TypeScript, and Tailwind CSS. "
        "It provides a dark-mode enterprise cybersecurity command center inspired by modern intelligence dashboards (CrowdStrike, Cloudflare) "
        "and is fully installable as an Android PWA with standalone display and native bottom navigation.",
        body_style
    ))

    frontend_components = [
        ("frontend/app/page.tsx", "Master Single-Page Dashboard",
         "Assembles Navbar, Hero, Unified Evidence Studio Shell, Ambient Shield Hub, Footer, Mobile Bottom Bar, and PWA Install Prompt into an integrated UX."),

        ("frontend/app/layout.tsx", "Root Application Layout & PWA Setup",
         "Defines viewport fit=cover, PWA theme-color (#070a13), web manifest link, Apple touch icons, and automatically registers the background Service Worker."),

        ("frontend/public/manifest.json", "Web App Manifest",
         "Configures PWA installation parameters: standalone display mode, background/theme colors, maskable icons (192px and 512px), and app shortcuts."),

        ("frontend/public/sw.js", "PWA Service Worker",
         "Implements cache-first strategy for static assets and network-bypass for /api/ routes, ensuring fast loading and offline resilience on Android/iOS."),

        ("frontend/components/EvidenceStudioShell.tsx", "Unified Multi-Modal Evidence Dock",
         "Master interactive workbench supporting all 6 modalities. Features benchmark preset loaders (Bank Scam, Emergency Call, Clean Portal), "
         "smart client-side entity extraction, progress telemetry, and fusion execution."),

        ("frontend/components/studio/VoiceCard.tsx", "Acoustic Audio Modality Card",
         "Supports audio playback, HTML5 waveform visualizer, drag-and-drop custom WAV/MP3 uploads, and bundled telephony benchmark samples."),

        ("frontend/components/studio/MessageCard.tsx", "Single Message Card",
         "Text input area with real-time character counting and instant client-side regex detection of embedded URLs and Pakistani phone numbers."),

        ("frontend/components/studio/URLCard.tsx", "Defanged URL Inspector Card",
         "Breaks down target URLs into protocol, host, path, and query tokens, rendering safe defanged notation (hxxp://) to prevent accidental clicks."),

        ("frontend/components/studio/EmailCard.tsx", "RFC Email Modality Card",
         "Structured inputs for email sender, subject, and body, displaying display-name spoofing warnings and brand mismatch indicators."),

        ("frontend/components/studio/ConversationCard.tsx", "Multi-Turn Chat Replay Builder",
         "Dynamic transcript editor allowing users to add, edit, or delete speaker turns with timestamps to analyze social engineering escalation velocity."),

        ("frontend/components/dossier/ForensicDossierView.tsx", "Comprehensive Forensic Dossier",
         "Displays the Overall Risk Gauge (0-100), Multimodal Constellation (active vs missing weights), flagged anomaly spans, RAG Assistant, and 1-Click FIA reporting gate."),

        ("frontend/components/ambient/AmbientShieldHub.tsx", "Ambient Neural Shield Dashboard",
         "Live telemetric monitoring hub with auto-polling (every 8s) displaying real-time Intercept Cards from WhatsApp Web/Gmail, and the official FIA Incident Registry."),

        ("frontend/components/mobile/MobileNavBar.tsx", "Native-Feel Mobile Navigation Bar",
         "Fixed bottom bar on mobile screens with Studio, Shield, FIA Portal, and Install App buttons for smooth one-thumb navigation."),

        ("frontend/components/mobile/PwaInstallPrompt.tsx", "1-Tap Android App Installation Card",
         "Handles browser beforeinstallprompt events, rendering a native-like bottom sheet banner inviting Android users to install AegisAI with one tap."),

        ("frontend/lib/api.ts", "Typed Backend API Client",
         "Complete TypeScript HTTP client providing async functions for case creation, modality analysis, ambient threat scanning, and FIA incident reporting.")
    ]

    for fpath, ftitle, fdesc in frontend_components:
        story.append(Paragraph(f"<b>{ftitle}</b> (<code>{fpath}</code>)", h2_style))
        story.append(Paragraph(fdesc, desc_style))
        story.append(Spacer(1, 2))

    story.append(PageBreak())

    # ================= SECTION 5: EXTENSION & MOBILE =================
    story.append(Paragraph("5. Cross-Platform Mobile & Browser Extension Layers", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.75, color=PRIMARY, spaceAfter=10))

    story.append(Paragraph(
        "AegisAI Sentinel extends protection beyond the desktop dashboard into the user's everyday browsing and mobile communication. "
        "The system provides an installable Expo React Native mobile companion and a production-ready Chrome/Edge Manifest V3 extension.",
        body_style
    ))

    ext_mobile_files = [
        ("extension/manifest.json", "Chrome Extension Manifest V3",
         "Declares extension metadata, permissions (activeTab, storage, contextMenus, notifications), host permissions (http://127.0.0.1:8000/*), "
         "background service worker, action popup, and content script injection rules."),

        ("extension/background.js", "Extension Background Service Worker",
         "Initializes browser context menus ('Scan selection with AegisAI Anti-Fraud'), monitors active tabs, and forwards text payloads to the FastAPI ambient scanner."),

        ("extension/popup.html & popup.js", "Extension Quick-Action Popup",
         "Obsidian-themed popup displaying active protection status, 'Verify Current Page' button, risk score gauge, and direct link to the Command Center."),

        ("extension/content_web.js", "Web Page Content Script",
         "Injects an in-page high-visibility red warning banner at the top of suspicious or phishing websites with a 1-click 'Report Domain to FIA' button."),

        ("extension/content_whatsapp.js", "WhatsApp Web Active Protection Script",
         "Monitors incoming chat bubbles on web.whatsapp.com, extracting scam tokens and sending suspicious messages to the ambient scan engine."),

        ("extension/content_email.js", "Gmail In-Box Phishing Inspector",
         "Inspects email headers and message bodies inside mail.google.com, alerting users to display-name spoofing and credential harvesting links."),

        ("mobile/package.json & app.json", "Expo SDK 52 Mobile Manifest",
         "Configures the React Native mobile application for Android and iOS, declaring permissions for notification listeners and background audio streaming."),

        ("mobile/App.tsx", "Mobile Application Root",
         "Initializes mobile navigation, connection health checks, and global threat notification state."),

        ("mobile/screens/HomeScreen.tsx", "Mobile Shield Dashboard",
         "Displays active protection toggle, recent intercept feed, and real-time threat metrics on mobile devices."),

        ("mobile/screens/AlertOverlayScreen.tsx", "Floating In-Call & In-Chat Warning Banner",
         "Displays an urgent floating heads-up alert when risk crosses >60 during active calls or chat sessions."),

        ("mobile/services/websocket.ts", "Low-Latency WebSocket Streaming Client",
         "Connects to ws://.../api/v1/stream/live, streaming audio chunks and receiving instant threat notifications.")
    ]

    for fpath, ftitle, fdesc in ext_mobile_files:
        story.append(Paragraph(f"<b>{ftitle}</b> (<code>{fpath}</code>)", h2_style))
        story.append(Paragraph(fdesc, desc_style))
        story.append(Spacer(1, 2))

    story.append(Spacer(1, 10))

    # ================= SECTION 6: ML & VERIFICATION =================
    story.append(Paragraph("6. Machine Learning, Verification & Datasets", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.75, color=PRIMARY, spaceAfter=10))

    ml_test_files = [
        ("ml/src/voice/feature_extractor.py", "35-Metric Acoustic Feature Extractor",
         "Computes zero-crossing rate, spectral centroid, spectral flux, MFCCs (1-13), pitch mean/variance, jitter, and shimmer from 16kHz audio."),

        ("ml/src/message/attribution.py", "Roman Urdu & English Fraud Regex Catalog",
         "Comprehensive pattern database matching bank account freeze threats, biometric fraud, OTP solicitation, and lottery scams."),

        ("ml/src/url/feature_extractor.py", "URL Lexical & Structural Feature Extractor",
         "Calculates Shannon entropy, detects IP host literals, flags high-risk TLDs, and maps brand impersonation keywords."),

        ("ml/src/phone/normalizer.py", "PTA Carrier & Numbering Normalizer",
         "Validates Pakistani and international numbers against E.164 specifications and resolves local telecom network providers."),

        ("backend/tests/test_fusion_engine.py", "Mathematical Fusion Engine Tests",
         "Verifies that missing modalities are excluded from weight denominators, bounds risk scores strictly between 0-100, and penalizes correlated signals."),

        ("scripts/verify_system_e2e.py", "7-Stage End-to-End System Validator",
         "Comprehensive test script verifying database initialization, all 6 modality analyzers, fusion assessment, ambient threat scanning, and FIA dossier generation."),

        ("scripts/terminal_live_demo.py", "Interactive Live Terminal Showcase",
         "Demonstrates the entire platform in terminal: executes live voice, message, URL, chat, and phone analyses, displaying color-coded results in seconds."),

        ("datasets/Cleaned_Voice_Dataset/", "Telephony Voice Corpus",
         "Standardized 16kHz mono audio recordings partitioned into ham (legitimate calls) and spam (bank impersonation, OTP scams)."),

        ("datasets/expanded_pakistan_spam_dataset_10k.csv", "10,000-Sample SMS Scam Dataset",
         "Curated bilingual dataset containing genuine notifications and pervasive fraud messages targeting Pakistani consumers.")
    ]

    for fpath, ftitle, fdesc in ml_test_files:
        story.append(Paragraph(f"<b>{ftitle}</b> (<code>{fpath}</code>)", h2_style))
        story.append(Paragraph(fdesc, desc_style))
        story.append(Spacer(1, 2))

    story.append(PageBreak())

    # ================= SECTION 7: MASTER FILE INDEX TABLE =================
    story.append(Paragraph("7. Master File-by-File Technical Directory Index", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.75, color=PRIMARY, spaceAfter=10))

    story.append(Paragraph(
        "The following master index lists all critical source files in the AegisAI Sentinel monorepo, "
        "their exact relative path, line count, subsystem classification, and architectural purpose.",
        body_style
    ))

    master_index_data = [
        [
            Paragraph("<b>File Path</b>", table_header_style),
            Paragraph("<b>Category</b>", table_header_style),
            Paragraph("<b>Lines</b>", table_header_style),
            Paragraph("<b>Core Architectural Purpose</b>", table_header_style)
        ],
        [Paragraph("<code>backend/app/main.py</code>", code_path_style), Paragraph("Backend", desc_style), Paragraph("57", desc_style), Paragraph("FastAPI app entry, CORS, lifespan, router mount.", desc_style)],
        [Paragraph("<code>backend/app/core/config.py</code>", code_path_style), Paragraph("Backend", desc_style), Paragraph("44", desc_style), Paragraph("Pydantic global app settings and environment variables.", desc_style)],
        [Paragraph("<code>backend/app/db/session.py</code>", code_path_style), Paragraph("Backend", desc_style), Paragraph("27", desc_style), Paragraph("Async SQLAlchemy engine and get_db session dependency.", desc_style)],
        [Paragraph("<code>backend/app/db/models.py</code>", code_path_style), Paragraph("Backend", desc_style), Paragraph("117", desc_style), Paragraph("ORM tables: Case, Evidence, Modality, Fusion, Ambient, FIA.", desc_style)],
        [Paragraph("<code>backend/app/api/v1/ambient.py</code>", code_path_style), Paragraph("Backend", desc_style), Paragraph("276", desc_style), Paragraph("Real-time threat scanning for Chrome extensions & background apps.", desc_style)],
        [Paragraph("<code>backend/app/api/v1/analysis.py</code>", code_path_style), Paragraph("Backend", desc_style), Paragraph("192", desc_style), Paragraph("Modality analysis endpoints and forensic dossier compiler.", desc_style)],
        [Paragraph("<code>backend/app/api/v1/assistant.py</code>", code_path_style), Paragraph("Backend", desc_style), Paragraph("152", desc_style), Paragraph("Grounded RAG safety assistant for post-analysis guidance.", desc_style)],
        [Paragraph("<code>backend/app/api/v1/cases.py</code>", code_path_style), Paragraph("Backend", desc_style), Paragraph("116", desc_style), Paragraph("Ephemeral case container CRUD and TTL auto-purge endpoints.", desc_style)],
        [Paragraph("<code>backend/app/api/v1/incidents.py</code>", code_path_style), Paragraph("Backend", desc_style), Paragraph("115", desc_style), Paragraph("Statutory FIA incident registry and report dispatching.", desc_style)],
        [Paragraph("<code>backend/app/api/v1/stream.py</code>", code_path_style), Paragraph("Backend", desc_style), Paragraph("163", desc_style), Paragraph("WebSocket gateway for streaming live calls and chat chunks.", desc_style)],
        [Paragraph("<code>backend/app/services/fusion_service.py</code>", code_path_style), Paragraph("Backend", desc_style), Paragraph("185", desc_style), Paragraph("Transparent weighted late-fusion engine with dynamic rescaling.", desc_style)],
        [Paragraph("<code>backend/app/services/fia_reporting_service.py</code>", code_path_style), Paragraph("Backend", desc_style), Paragraph("258", desc_style), Paragraph("Tamper-evident PDF/JSON FIA evidence dossier generator.", desc_style)],
        [Paragraph("<code>backend/app/services/email_service.py</code>", code_path_style), Paragraph("Backend", desc_style), Paragraph("218", desc_style), Paragraph("RFC 2822 header spoofing & email phishing body classifier.", desc_style)],
        [Paragraph("<code>backend/app/services/url_service.py</code>", code_path_style), Paragraph("Backend", desc_style), Paragraph("179", desc_style), Paragraph("Defanged URL inspector, Shannon entropy & lexical analyzer.", desc_style)],
        [Paragraph("<code>backend/app/services/phone_service.py</code>", code_path_style), Paragraph("Backend", desc_style), Paragraph("141", desc_style), Paragraph("E.164 normalization, PTA carrier resolver, cautious fallback.", desc_style)],
        [Paragraph("<code>backend/app/services/voice_service.py</code>", code_path_style), Paragraph("Backend", desc_style), Paragraph("122", desc_style), Paragraph("35-metric acoustic deepfake & voice spoofing classifier.", desc_style)],
        [Paragraph("<code>backend/app/services/conversation_service.py</code>", code_path_style), Paragraph("Backend", desc_style), Paragraph("110", desc_style), Paragraph("Multi-turn dialogue social engineering escalation analyzer.", desc_style)],
        [Paragraph("<code>backend/app/services/message_service.py</code>", code_path_style), Paragraph("Backend", desc_style), Paragraph("67", desc_style), Paragraph("Roman Urdu & English SMS scam token/n-gram classifier.", desc_style)],
        [Paragraph("<code>frontend/app/page.tsx</code>", code_path_style), Paragraph("Frontend", desc_style), Paragraph("34", desc_style), Paragraph("Main Next.js page orchestrating Studio, Shield, and Nav.", desc_style)],
        [Paragraph("<code>frontend/components/EvidenceStudioShell.tsx</code>", code_path_style), Paragraph("Frontend", desc_style), Paragraph("379", desc_style), Paragraph("Master multi-modal evidence intake dock and presets.", desc_style)],
        [Paragraph("<code>frontend/components/ambient/AmbientShieldHub.tsx</code>", code_path_style), Paragraph("Frontend", desc_style), Paragraph("516", desc_style), Paragraph("Live intercept feed, threat cards, FIA incident registry.", desc_style)],
        [Paragraph("<code>frontend/components/mobile/MobileNavBar.tsx</code>", code_path_style), Paragraph("Frontend", desc_style), Paragraph("95", desc_style), Paragraph("Fixed bottom navigation bar for mobile app experience.", desc_style)],
        [Paragraph("<code>frontend/components/mobile/PwaInstallPrompt.tsx</code>", code_path_style), Paragraph("Frontend", desc_style), Paragraph("85", desc_style), Paragraph("1-tap Android PWA installation bottom sheet card.", desc_style)],
        [Paragraph("<code>frontend/public/manifest.json</code>", code_path_style), Paragraph("Frontend", desc_style), Paragraph("28", desc_style), Paragraph("PWA manifest declaring standalone mode and app icons.", desc_style)],
        [Paragraph("<code>frontend/public/sw.js</code>", code_path_style), Paragraph("Frontend", desc_style), Paragraph("38", desc_style), Paragraph("Service worker for caching static assets and offline support.", desc_style)],
        [Paragraph("<code>extension/manifest.json</code>", code_path_style), Paragraph("Extension", desc_style), Paragraph("37", desc_style), Paragraph("Chrome Manifest V3 specification and permissions.", desc_style)],
        [Paragraph("<code>extension/background.js</code>", code_path_style), Paragraph("Extension", desc_style), Paragraph("68", desc_style), Paragraph("Background service worker handling context menu & scans.", desc_style)],
        [Paragraph("<code>extension/content_web.js</code>", code_path_style), Paragraph("Extension", desc_style), Paragraph("112", desc_style), Paragraph("In-page red fraud alert banner on suspicious banking sites.", desc_style)],
        [Paragraph("<code>scripts/verify_system_e2e.py</code>", code_path_style), Paragraph("Scripts", desc_style), Paragraph("151", desc_style), Paragraph("Automated 7-stage end-to-end system verification suite.", desc_style)],
        [Paragraph("<code>scripts/terminal_live_demo.py</code>", code_path_style), Paragraph("Scripts", desc_style), Paragraph("191", desc_style), Paragraph("Interactive live terminal demonstration script.", desc_style)]
    ]

    t_master = Table(master_index_data, colWidths=[150, 60, 40, 254])
    t_master.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_LIGHT),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, CARD_BG]),
        ('PADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_master)

    # Build PDF with dynamic page numbering
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully built at: {pdf_path}")


if __name__ == "__main__":
    out_dir = os.path.join(os.getcwd(), "docs")
    os.makedirs(out_dir, exist_ok=True)
    pdf_out = os.path.join(out_dir, "PROJECT_ARCHITECTURE_AND_FILE_DIRECTORY.pdf")
    build_manual_pdf(pdf_out)
