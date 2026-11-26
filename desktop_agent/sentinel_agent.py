"""
Sentinel Core Desktop Ambient Agent.
Continuous background OS-level clipboard and system text guardian.
Scans incoming copied text, links, and phone numbers in real time, alerting users
and providing 1-click Human-in-the-Loop FIA statutory reporting under PECA 2016.
"""

import sys
import time
import json
import urllib.request
import urllib.error
import hashlib
import subprocess
import argparse
from datetime import datetime

API_BASE_URL = "http://127.0.0.1:8000/api/v1"


def get_clipboard_text() -> str:
    """Retrieves current clipboard text using standard Windows PowerShell or tkinter."""
    try:
        import tkinter as tk
        root = tk.Tk()
        root.withdraw()
        text = root.clipboard_get()
        root.destroy()
        return text.strip()
    except Exception:
        pass

    try:
        proc = subprocess.run(
            ["powershell", "-NoProfile", "-Command", "Get-Clipboard"],
            capture_output=True,
            text=True,
            timeout=2
        )
        return proc.stdout.strip()
    except Exception:
        return ""


def show_system_notification(title: str, message: str):
    """Fires native Windows system toast notification."""
    safe_title = title.replace('"', '').replace("'", "")
    safe_msg = message.replace('"', '').replace("'", "")
    ps_cmd = f'''
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null
    $template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
    $textNodes = $template.GetElementsByTagName("text")
    $textNodes.Item(0).AppendChild($template.CreateTextNode("{safe_title}")) > $null
    $textNodes.Item(1).AppendChild($template.CreateTextNode("{safe_msg}")) > $null
    $toast = [Windows.UI.Notifications.ToastNotification]::new($template)
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Sentinel Core").Show($toast)
    '''
    try:
        subprocess.run(["powershell", "-NoProfile", "-Command", ps_cmd], capture_output=True, timeout=3)
    except Exception:
        pass


def scan_content(text: str, source: str = "desktop_clipboard") -> dict:
    """Dispatches ambient scan to Sentinel Core API."""
    url = f"{API_BASE_URL}/ambient/scan"
    payload = json.dumps({
        "content": text,
        "source": source
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=5) as resp:
        return json.loads(resp.read().decode("utf-8"))


def report_to_fia(case_id: str, accused: str, notes: str = None) -> dict:
    """Transmits confirmed incident report to FIA Cybercrime Wing via Sentinel Core."""
    url = f"{API_BASE_URL}/incidents/direct-report"
    payload = json.dumps({
        "case_id": case_id,
        "user_confirmed": True,
        "operator_notes": notes or "Investigator authorized submission via Desktop Ambient Agent.",
        "source": "desktop_agent",
        "accused_identifier": accused
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=8) as resp:
        return json.loads(resp.read().decode("utf-8"))


def print_banner():
    print("""
========================================================================
🛡️  SENTINEL CORE — DESKTOP AMBIENT GUARDIAN (v3.0)
    Real-Time Clipboard & Application Fraud Shield with FIA Reporting
========================================================================
[+] Sentinel Core API: http://127.0.0.1:8000
[+] Active Monitoring: System Clipboard & Copied URLs / Messages
[+] Legal Enforcement: PECA 2016 Sections 13, 14, 16
[*] Press Ctrl+C at any time to halt ambient protection.
------------------------------------------------------------------------
""")


def run_continuous_guard():
    print_banner()
    last_hash = None
    processed_count = 0

    print("[*] Ambient Shield is ACTIVE and guarding your system...\n")

    while True:
        try:
            time.sleep(1.2)
            current_text = get_clipboard_text()
            if not current_text or len(current_text) < 6:
                continue

            current_hash = hashlib.md5(current_text.encode("utf-8")).hexdigest()
            if current_hash == last_hash:
                continue

            last_hash = current_hash
            processed_count += 1

            # Scan the newly copied text
            try:
                res = scan_content(current_text)
            except Exception as e:
                # Backend might be restarting
                continue

            if res.get("is_threat"):
                score = res.get("risk_score", 0.0)
                tags = ", ".join(res.get("threat_tags", [])[:3])
                target = res.get("target_phone") or res.get("target_url") or "Unknown"

                print("\n" + "!" * 72)
                print(f"🚨 SENTINEL SECURITY ALERT — FRAUD / IMPERSONATION DETECTED!")
                print("!" * 72)
                print(f"  • Risk Score    : {score}/100.0 (SEVERITY: HIGH / CRITICAL)")
                print(f"  • Threat Tags   : {tags}")
                print(f"  • Suspect/Target: {target}")
                print(f"  • Text Snippet  : {current_text[:120]}...")
                print("-" * 72)

                show_system_notification(
                    f"⚠️ Sentinel Fraud Alert ({score}% Risk)",
                    f"Suspicious scam detected: {tags[:60]}"
                )

                print("  [?] Do you want to report this sender to the FIA Cybercrime Wing?")
                try:
                    choice = input("      Type 'Y' to confirm & submit report to FIA (or Enter to dismiss): ").strip().lower()
                    if choice in ("y", "yes"):
                        rep = report_to_fia(res["case_id"], target, f"Reported from desktop clipboard: {current_text[:80]}")
                        print("\n  ✅ SUCCESS: Formal Complaint Dispatched to FIA NR3C!")
                        print(f"     Tracking Reference No : {rep['reference_no']}")
                        print(f"     Evidence SHA-256 Seal : {rep['sha256_digest'][:24]}...")
                        print(f"     Statutory Basis       : PECA 2016 Sections 13, 14, 16\n")
                        show_system_notification(
                            "✅ FIA Incident Registered",
                            f"Tracking Reference: {rep['reference_no']}"
                        )
                    else:
                        print("  [i] Report cancelled by user.\n")
                except EOFError:
                    pass
        except KeyboardInterrupt:
            print("\n[!] Sentinel Ambient Guardian stopped by user.")
            break
        except Exception as e:
            time.sleep(2)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sentinel Core Desktop Ambient Agent")
    parser.add_argument("--scan", type=str, help="Scan a single text snippet or URL immediately")
    args = parser.parse_args()

    if args.scan:
        print(f"[*] Scanning snippet: {args.scan}")
        res = scan_content(args.scan)
        print(json.dumps(res, indent=2))
        if res.get("is_threat"):
            rep = report_to_fia(res["case_id"], res.get("target_phone") or res.get("target_url") or "CLI Input")
            print("FIA Report Registered:", json.dumps(rep, indent=2))
    else:
        run_continuous_guard()
