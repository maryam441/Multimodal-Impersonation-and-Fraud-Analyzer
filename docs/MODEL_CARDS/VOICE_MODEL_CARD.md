# Model Card: Voice Telecom Fraud & Vishing Detector
**Model Name:** `acoustic-telecom-fraud-detector`  
**Version:** 1.0  
**Model Architecture:** Random Forest Classifier (100 estimators, max depth 10, StandardScaler)  
**Task:** Binary Acoustic Classification (Legitimate Conversation vs. Impersonation/Fraud Call)  
**Authors:** Multimodal Impersonation & Fraud Analyzer Team  
**Date:** November 2026  

---

## 1. Model Overview & Purpose
This model provides acoustic fraud-risk decision support by analyzing raw speech recordings to distinguish legitimate conversational speech from telephone impersonation, vishing, and OTP scams in Pakistani and global communication contexts.

---

## 2. Training & Evaluation Data
- **Dataset:** `Cleaned_Voice_Dataset` (derived from Mozilla Common Voice Urdu Corpus v27.0 and high-fidelity neural telephony simulation).
- **Audio Preprocessing:** 16 kHz 16-bit PCM Mono, 300 Hz – 3,400 Hz 4th-order Butterworth bandpass filter.
- **Split Strategy:**
  - Training Partition: 160 samples (80 Ham, 80 Spam; 132 Urdu, 28 English)
  - Held-out Test Partition: 40 samples (20 Ham, 20 Spam; 32 Urdu, 8 English)

---

## 3. Extracted Acoustic Feature Schema (35 Metrics)
- **13 MFCC Means:** Mel-frequency cepstral coefficients representing vocal tract shape.
- **13 MFCC Standard Deviations:** Spectral coefficient temporal variability.
- **Spectral Descriptors:** Spectral Centroid (timbral brightness), Bandwidth, Rolloff (85% energy point), Flatness.
- **Voice Perturbation:** Fundamental Frequency ($F_0$), Jitter (micro-pitch variation), Shimmer (micro-amplitude variation), RMS Energy, and Zero-Crossing Rate.

---

## 4. Benchmark Performance Metrics (Held-out Test Set)

| Model Architecture | Accuracy | Precision | Recall | F1-Score | ROC-AUC |
|---|:---:|:---:|:---:|:---:|:---:|
| **Random Forest (Selected)** | **100.0%** | **100.0%** | **100.0%** | **100.0%** | **100.0%** |
| Support Vector Machine (SVM) | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% |
| Multi-Layer Perceptron (MLP) | 97.5% | 95.2% | 100.0% | 97.6% | 100.0% |
| Gradient Boosting Classifier | 82.5% | 100.0% | 65.0% | 78.8% | 83.4% |

---

## 5. Temporal Anomaly Timeline Generation
The model pipeline includes a 1.0-second sliding-window acoustic perturbation detector that identifies anomalous segments where jitter ($>0.14$) or shimmer ($>0.22$) spikes, emitting exact timestamp spans (`[timestamp_start_sec, timestamp_end_sec]`) for visual inspection on the waveform timeline.

---

## 6. Known Limitations & Intended Use
- **Decision Support Only:** This model provides a risk score and acoustic flags. It does not replace human judgment or legal verification.
- **Duration Sensitivity:** Recordings shorter than 1.0 second cannot reliably calculate pitch $F_0$ or jitter metrics.
- **Domain Shift:** Extreme acoustic distortions, loud ambient background music, or VoIP packet loss can impact feature extraction.
