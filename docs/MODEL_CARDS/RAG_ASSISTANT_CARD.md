# Model Card: Grounded Safety Assistant (RAG) & Human Gate

## Component Details
- **Component:** Grounded RAG Safety Assistant & Consequential Action Guardrails
- **Function:** Decision-support natural language explanation and policy retrieval grounded exclusively in deterministic model outputs.
- **Specification:** Complies with SRS §13 (Assistant) & Core Technical Mandates.

## Grounded Knowledge Base
- **State Bank of Pakistan (SBP):** BPRD Circular No. 02 of 2023 on Unauthorized Electronic Funds Transfers & Social Engineering Scams.
- **Pakistan Telecommunication Authority (PTA):** Consumer Protection Regulations & Shortcode 8866 Fraud Reporting Guidelines.
- **Federal Investigation Agency (FIA):** Prevention of Electronic Crimes Act (PECA 2016) Sections 13, 14, and 16.
- **National CERT:** Advisory NCERT-ADV-2023-08 on Phishing and Smishing Defense.

## Safety & Non-Fabrication Guarantees
- **Strict Grounding:** The assistant is restricted from hallucinating evidence spans or overriding deterministic model risk scores.
- **Zero Extrapolation:** Does not assert legal guilt; provides calibrated defensive guidance and statutory reporting avenues.
- **Human-in-the-Loop Gate:** High-consequence actions (e.g. reporting to FIA, external carrier lookups, exporting cryptographic dossiers) strictly require explicit human operator confirmation (`user_confirmed=True`) before execution.
