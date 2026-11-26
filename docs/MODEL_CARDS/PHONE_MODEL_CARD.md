# Model Card: Phone Number Modality Pipeline

## Model Details
- **Modality:** Telecom Caller Identifier & Phone Reputation
- **Architecture:** E.164 Standardization, PTA Carrier Resolution, and Cautious Fallback Engine.
- **Task:** Normalization, carrier attribution, line-type classification (Mobile, Landline, Shortcode, VoIP, Toll-Free), and transparent evidence attribution.

## Policy & Ethical Safeguards (SRS §15.5 Compliance)
- **Zero Hallucination / Anti-Bias Guarantee:** As audited during milestone M02, scraping 10 ad-hoc web entries cannot legally or statistically substantiate generalized machine learning predictions against real callers.
- **`insufficient_data` Fallback:** In the absence of an authorized live telecom carrier API (e.g. PTA-sanctioned gateway), unverified live phone numbers strictly return `status="insufficient_data"` and `risk_score=None`.
- **Fusion Neutrality:** Phone numbers with `insufficient_data` are strictly excluded from late-fusion weighting ($w_{\text{phone}} = 0$) rather than being treated as clean ($0$ risk) or malicious ($100$ risk).

## Numbering Plan Support
- Pakistani GSM carriers: Jazz, Zong, Ufone, Telenor, SCOM.
- Landline area codes: Karachi (021), Lahore (042), Islamabad (051), Peshawar (091), Quetta (081), Multan (061), Faisalabad (041), etc.
- Shortcodes: 4-5 digit banking and institutional SMS shortcodes.
- International numbers: Validated via E.164 regex specifications.
