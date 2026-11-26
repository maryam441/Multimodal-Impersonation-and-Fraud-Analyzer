# Master Dataset Register & Modality Audit (Milestone M02)
**Project:** Multimodal Impersonation & Fraud Analyzer (AegisAI / Sentinel Core)  
**SRS Version:** 3.0 (Enterprise & High-Innovation Edition)  
**Document Version:** 1.0  
**Status:** Approved Dataset Register (Milestone M02)  
**Target Integration Branch:** `staging`  

---

## 1. Executive Summary & Audit Overview

As mandated by **SRS v3.0 Part I (§2)** and **Milestone M02**, this document establishes the authoritative **Dataset Register** for the *Multimodal Impersonation & Fraud Analyzer*.

Every dataset in the workspace has been programmatically inspected, audited for provenance, schema, class balance, linguistic diversity, and potential leakage hazards. All large raw datasets, audio files, and model weights are strictly preserved on local disk and excluded from Git version control via [.gitignore](file:///c:/Users/Maryam_Sharif/Desktop/fyp/.gitignore), while lightweight machine-readable manifests are stored in `ml/datasets/manifests/` and test fixtures in `tests/fixtures/`.

### Summary of Modality Readiness
| Modality | Primary Dataset File(s) | Records / Volume | Class Balance | Language Coverage | Readiness Verdict |
|---|---|---|---|---|---|
| **Voice** | `Cleaned_Voice_Dataset/` | 200 audio files (38 MB) | 100 Ham / 100 Spam | Urdu (80%), English (20%) | **Production Ready** |
| **Message** | `Dataset_5971.csv`<br>`Financial scams dataset.csv` | 5,971 SMS<br>523 messages | 4,844 Ham / 1,127 Spam<br>213 Ham / 310 Scam | Roman Urdu & English<br>English | **Production Ready** |
| **URL** | `PhiUSIIL_Phishing_URL_Dataset.csv` | 235,795 URLs (56.8 MB) | 100,945 Benign / 134,850 Phishing | N/A (Web URIs) | **Production Ready** |
| **Phone** | `phone_numbers_dataset.csv` | 10 records (exploratory) | 10 Spam reports | Pakistani dial codes | **Synthetic Fixtures + Adapter Only** |
| **Conversation**| `synthetic_conversations.json` | Curated multi-turn dialogues | Balanced Benign / Scams | English & Urdu contexts | **Synthetic Benchmark Active** |

---

## 2. Voice Modality Register

### 2.1 Dataset Identity & Provenance
- **Dataset Name:** Cleaned Voice Telecom Fraud & Vishing Dataset
- **Local Location:** `datasets/Cleaned_Voice_Dataset/`
- **Manifest Reference:** `ml/datasets/manifests/voice_manifest.json`
- **Origin & Provenance:**
  - **Ham (Legitimate):** Real human Urdu conversational speech extracted from the Mozilla Common Voice Urdu Corpus (`cv-corpus-27.0-2026-09-11/ur/`).
  - **Spam (Fraud / Impersonation):** Realistic telecom fraud recordings synthesized using high-fidelity neural speech engines (Edge-TTS `ur-PK-AsadNeural`, `ur-PK-UzmaNeural`, `en-US-GuyNeural`, `en-US-JennyNeural`) covering 25 documented Pakistani and global scam scripts.
- **Telephony Channel Simulation:** Standard 16 kHz 16-bit PCM Mono (`.wav`). Applied 4th-order Butterworth bandpass filter (300 Hz – 3,400 Hz) with additive telecom carrier channel noise and pitch/speed perturbation.

### 2.2 Volume & Class Distribution
- **Total Samples:** 200 audio files
  - **Ham (Legitimate):** 100 samples (50.0%)
  - **Spam (Fraudulent):** 100 samples (50.0%)
- **Languages:** 160 Urdu (80.0%), 40 English (20.0%)
- **Train / Test Partitioning:**
  - **Train Split (`voice_features_train.csv`):** 160 samples (80 Ham, 80 Spam)
  - **Test Split (`voice_features_test.csv`):** 40 samples (20 Ham, 20 Spam)
  - **Combined Matrix (`voice_features_all.csv`):** 200 samples × 46 columns

### 2.3 Scam Categories Covered
1. **Bank & Wallet OTP Fraud (Urdu & English):** 24 samples (State Bank, HBL, Bank Al Habib, JazzCash, EasyPaisa account freeze & OTP solicitation).
2. **Relative / Family Emergency Impersonation:** 20 samples (Kidnapping, car accident, police custody emergency money transfer).
3. **Lottery & Prize Scams:** 20 samples (Jeeto Pakistan, BISP Ramadan draw, international lottery).
4. **Law Enforcement / Police Intimidation:** 16 samples (FIA Cybercrime officer, arrest warrant, fake court fine).
5. **Telecom SIM Block Scams:** 12 samples (PTA biometric expiry, illegal SIM deactivation warning).
6. **Fake Loan & Tech Support Scams:** 8 samples (Uncollateralized fast loan fee, Microsoft virus alert).

### 2.4 Extracted Acoustic Features (35 Physical Metrics)
Pre-extracted across all 200 samples without data leakage:
- **MFCCs (26 metrics):** 13 mean coefficients (`mfcc_1_mean` to `mfcc_13_mean`) and 13 standard deviations (`mfcc_1_std` to `mfcc_13_std`).
- **Spectral Descriptors (4 metrics):** `spectral_centroid`, `spectral_bandwidth`, `spectral_rolloff`, `spectral_flatness`.
- **Temporal & Energy (2 metrics):** `rms_energy`, `zero_crossing_rate` (ZCR).
- **Pitch & Micro-Perturbation (3 metrics):** `pitch_f0` (fundamental frequency Hz), `jitter` (relative pitch perturbation), `shimmer` (amplitude perturbation).

---

## 3. Message Modality Register

### 3.1 Primary Dataset: `Dataset_5971.csv`
- **Dataset Name:** Roman Urdu & English SMS Fraud/Smishing Benchmark
- **Local Location:** `datasets/Dataset_5971.csv` (596 KB)
- **Manifest Reference:** `ml/datasets/manifests/message_manifest.json`
- **Academic Source:** Published in **LREC-COLING 2024** (`2024.lrec-main.422.pdf`, preserved in root).
- **Schema:** 5 columns: `LABEL`, `TEXT`, `URL`, `EMAIL`, `PHONE`
- **Volume:** 5,971 SMS samples
- **Class Breakdown:**
  - `ham`: 4,844 samples (81.1%)
  - `Smishing`: 616 samples (10.3%)
  - `spam`: 466 samples (7.8%)
  - `Spam`: 23 samples (0.4%)
  - `smishing`: 22 samples (0.4%)
  - *Aggregated Target:* 4,844 Legitimate vs. 1,127 Malicious/Fraudulent.
- **Linguistic Profile:** Roman Urdu (Urdu written in Latin alphabet) mixed with Pakistani English SMS vernacular.

### 3.2 Supplemental Dataset: `Financial scams detection dataset.csv`
- **Location:** `datasets/Financial scams detection dataset/` (47 KB)
- **Volume:** 523 messages
- **Schema:** 2 columns: `label`, `message`
- **Class Breakdown:** 310 Scam (59.3%), 213 Ham (40.7%)
- **Focus:** Loan approval scams, lottery processing fees, and banking credential phishing in English.

---

## 4. URL Modality Register

### 4.1 Primary Dataset: `PhiUSIIL_Phishing_URL_Dataset.csv`
- **Dataset Name:** PhiUSIIL Phishing URL Dataset
- **Local Location:** `datasets/PhiUSIIL_Phishing_URL_Dataset.csv` (56.8 MB, preserved locally)
- **Academic Provenance:** Prasad & Chandra, published in *Computers & Security / IEEE* (2024).
- **Volume:** 235,795 URLs
- **Class Distribution:**
  - `1` (Phishing): 134,850 URLs (57.2%)
  - `0` (Benign): 100,945 URLs (42.8%)
- **Feature Schema (56 Attributes):**
  - Syntactic & Structural: `URLLength`, `DomainLength`, `IsDomainIP`, `TLD`, `NoOfSubDomain`, `CharContinuationRate`
  - Lexical Ratios: `LetterRatioInURL`, `DegitRatioInURL`, `SpcharRatioInURL`
  - Delimiters & Tokens: `NoOfEqualsInURL`, `NoOfQMarkInURL`, `NoOfAmpersandInURL`
  - Security Attributes: `IsHTTPS`, `TLDLegitimateProb`, `URLSimilarityIndex`

### 4.2 Safe Execution & Zero Live Crawling Policy
In accordance with **SRS v3.0 §15.4**:
- The URL analyzer relies strictly on **lexical, host, and structural anatomy features**.
- Live fetching of remote URLs is **disabled by default** to protect users and backend workers from server-side request forgery (SSRF), drive-by exploits, and IP tracing.
- When rendered in the UI, all URLs are defanged (`hxxp://domain[.]com`).

---

## 5. Phone Modality Register & Ethics Policy

### 5.1 Existing Data Audit
- `phone_dataset/phone_numbers_dataset.csv` contains only 10 rows scraped from community forum complaints on `whoseno.com`.
- **Audit Finding:** 10 web-scraped entries cannot statistically train a generalized machine learning model or establish real-world reputation.

### 5.2 Legal & Ethical Mandate (SRS §2 & §15.5)
1. **Zero Scraped Private Numbers:** We do not scrape private telecom databases, bypass telecom firewalls, or publish unverified personal phone numbers.
2. **Zero Fabricated Reputation:** The system will **never** label a real person's phone number as fraudulent based on synthetic data.
3. **Transparent Provider Status:** When an unverified real phone number is queried, the system displays:
   - Status: `insufficient_data` or `unavailable`
   - Detailed format validation (E.164, region, carrier identification)
   - Clear notice that absence of known complaints does not imply verified safety.
4. **Synthetic Test Fixtures:** Synthetic numbers (such as `+92 300 0000000` or reserved 555-numbers) are provided in `tests/fixtures/sample_phones.json` exclusively for UI and format validation tests.

---

## 6. Conversation Modality Audit & Synthetic Benchmark

### 6.1 Audit Finding on Message Data
A programmatic inspection of the 5,971 records in `Dataset_5971.csv` revealed **zero multi-turn conversational dialogues** (`len(multiline) == 0`). Every record is an isolated, single-turn SMS.

### 6.2 Distinct Modality Requirement (SRS §15.3)
Single-message classifiers evaluate standalone phrase triggers. Conversation analysis must evaluate multi-turn psychological manipulation:
- Establishing false authority
- Creating artificial time pressure and urgency
- Attempting channel migration (e.g., *"Contact me on WhatsApp"*)
- Soliciting credentials, OTPs, or financial transfers across escalating turns.

### 6.3 Validated Synthetic Multi-Turn Benchmark
To establish reproducible testing without conflating tasks, we constructed `tests/fixtures/synthetic_conversations.json`:
- **Scenario 1:** State Bank Account Freeze & OTP Harvest (Urgency + Authority Impersonation + OTP Solicitation)
- **Scenario 2:** Police Accident Extortion Emergency (Urgency + False Arrest Extortion + Easypaisa Demand)
- **Scenario 3:** Legitimate ISP Broadband Support Dialogue (Benign Baseline)

---

## 7. Data Integrity, Leakage Prevention & Reproducibility Rules

1. **Stratified Split Integrity:** All train/test partitions maintain exact class ratios.
2. **Zero Cross-Split Contamination:** Feature scaling (e.g. `StandardScaler`) and vocabulary fitting (`TfidfVectorizer`) are fitted strictly on the training partition and transformed on test/inference.
3. **Fixed Random Seeds:** A global random seed `42` is enforced across all experiments.
4. **Zero Secrets / Data in Git:** All datasets $> 1\text{ MB}$ and binary weights are barred from Git commits via `.gitignore`.
