# Sentinel Core — Desktop Ambient Guardian

Autonomous system-level background daemon monitoring clipboard text, copied links, and phone numbers in real time across desktop applications (WhatsApp Desktop, Outlook, SMS, Telegram, and Browsers).

---

## ⚡ Quick Start

### 1. Run Continuous Background Guard
To start active ambient monitoring:
```bash
python desktop_agent/sentinel_agent.py
```
- Operates quietly in the background, checking copied messages or URLs.
- When an impersonation or fraud string is detected (e.g. Bank OTP scam or suspicious link):
  - Displays a **native Windows Toast Notification** (`⚠️ Sentinel Fraud Alert`).
  - Prompts in terminal: `Type 'Y' to confirm & submit report to FIA`.
  - Automatically seals the evidence and creates a formal statutory complaint with the **FIA Cyber Crime Wing**.

### 2. Single-Shot CLI Scan Mode
To test or scan any text string or URL immediately from the terminal:
```bash
python desktop_agent/sentinel_agent.py --scan "Ap ka bank account suspend ho gaya hai. Verify krein foran http://hbl-verify.pk"
```
Outputs the JSON forensic scan result and registers the incident directly.
