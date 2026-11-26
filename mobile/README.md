# Sentinel Mobile Shield (React Native / Expo Companion)

Cross-platform installable Android & iOS application providing ambient real-time fraud defense, in-conversation heads-up alert overlays, and 1-tap FIA reporting.

---

## 📱 Key Features

1. **Explicit Onboarding & Permissions Consent:**
   - Strict privacy-first onboarding workflow explaining why permissions are requested.
   - Android Notification Listener intent for scanning incoming WhatsApp and SMS scam alerts.
   - Optional Call Screening & live audio streaming intent.

2. **In-Conversation Real-Time Heads-Up Overlay:**
   - Connects to Sentinel Core via WebSockets (`ws://.../api/v1/stream/live`).
   - Streams audio chunks or conversation turns safely.
   - When risk exceeds threshold ($S_{fused} \ge 60.0$), pops a floating system alert overlay:
     `[⚠️ Sentinel Alert: 88% Fraud / Synthetic Voice Detected]`
     `[🚨 Report to FIA (PECA 2016)]`

3. **1-Tap FIA Cybercrime Reporting:**
   - Prompts user with Human-in-the-Loop confirmation gate.
   - Transmits cryptographically sealed (SHA-256) evidence dossier to FIA NR3C.
   - Displays official Tracking Reference Number (`FIA-CCW-YYYY-XXXXX`).

---

## 🚀 Running the Mobile App

```bash
cd mobile
npm install
npx expo start
```
- Press `a` for Android Emulator / Device (Expo Go).
- Press `i` for iOS Simulator.
- Scan QR code via Expo Go app on physical device.
