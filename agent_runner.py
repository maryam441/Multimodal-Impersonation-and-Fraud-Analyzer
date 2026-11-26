"""GAQI scheduled alert agent (no dashboard needed).
Fetch latest data for a watch-list, forecast the next 24 hours, decide which cities pass the threshold,
write alerts.json and (optionally) send them to Telegram. Meant to run on a schedule, e.g. GitHub Actions:

    on:
      schedule: [{cron: "0 */6 * * *"}]      # every 6 hours (the data source refreshes only every few hours)
    steps: pip install requests pandas numpy scikit-learn  ->  python agent_runner.py

Environment (all optional): GAQI_CITIES="Lahore,Karachi,Delhi"  GAQI_THRESHOLD=150
TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID  (send alerts)   ANTHROPIC_API_KEY (Claude writes a short briefing)
Data: Open-Meteo (modelled, not sensor). Times in Pakistan time (PKT). Not medical advice."""
import json, os, sys
from datetime import datetime, timedelta, timezone

import numpy as np
import pandas as pd
import requests
from sklearn.ensemble import RandomForestRegressor

GEO = "https://geocoding-api.open-meteo.com/v1/search"
AQ = "https://air-quality-api.open-meteo.com/v1/air-quality"
DEFAULT = "Lahore,Karachi,Islamabad,Rawalpindi,Peshawar,Quetta,Faisalabad,Multan"
LAGS = [1, 2, 3, 6, 12]

def now_pkt():
    return (datetime.now(timezone.utc) + timedelta(hours=5)).replace(tzinfo=None)

def fetch(city, days=7):
    g = requests.get(GEO, params={"name": city, "count": 1}, timeout=30).json().get("results")
    if not g:
        raise ValueError("city not found")
    now = now_pkt(); end = now.date(); start = end - timedelta(days=days - 1)
    r = requests.get(AQ, params=dict(latitude=g[0]["latitude"], longitude=g[0]["longitude"], hourly="us_aqi",
                                     start_date=start.isoformat(), end_date=end.isoformat(), timezone="Asia/Karachi"), timeout=30)
    r.raise_for_status()
    d = pd.DataFrame(r.json()["hourly"]); d["time"] = pd.to_datetime(d["time"])
    d = d[d["time"] <= now.replace(minute=0, second=0, microsecond=0)].dropna(subset=["us_aqi"]).reset_index(drop=True)
    if len(d) < 30:
        raise ValueError("not enough data")
    return d

def forecast(d, hours=24):
    v, h = d["us_aqi"].to_numpy(float), d["time"].dt.hour.to_numpy()
    s = max(LAGS)
    X = np.array([[v[i - l] for l in LAGS] + [h[i]] for i in range(s, len(v))]); y = v[s:]
    m = RandomForestRegressor(n_estimators=120, max_depth=8, random_state=42).fit(X, y)
    hist, out, t0 = list(v), [], d["time"].iloc[-1]
    for k in range(1, hours + 1):
        t = t0 + pd.Timedelta(hours=k)
        p = max(0.0, float(m.predict(np.array([[hist[-l] for l in LAGS] + [t.hour]]))[0])); hist.append(p); out.append((t, p))
    return out

def telegram(text):
    tok, chat = os.getenv("TELEGRAM_BOT_TOKEN"), os.getenv("TELEGRAM_CHAT_ID")
    if not (tok and chat):
        return "Telegram not configured; skipped."
    r = requests.post(f"https://api.telegram.org/bot{tok}/sendMessage", json={"chat_id": chat, "text": text[:4000]}, timeout=20)
    return "Sent to Telegram." if r.ok else f"Telegram error {r.status_code}"

def briefing(alerts):
    if not (alerts and os.getenv("ANTHROPIC_API_KEY")):
        return ""
    try:
        import anthropic
        r = anthropic.Anthropic().messages.create(model=os.getenv("GAQI_MODEL", "claude-sonnet-5-5"), max_tokens=300,
            messages=[{"role": "user", "content": "Write a 3-line plain-language air-quality briefing from these alerts. Use only these numbers. "
                       "Say the data is modelled and this is not medical advice.\n" + json.dumps(alerts)}])
        return "".join(b.text for b in r.content if b.type == "text")
    except Exception as exc:
        return f"(briefing unavailable: {exc})"

def main():
    cities = [c.strip() for c in os.getenv("GAQI_CITIES", DEFAULT).split(",") if c.strip()]
    thr = float(os.getenv("GAQI_THRESHOLD", "150")); alerts, log = [], []
    for c in cities:
        try:
            d = fetch(c); fc = forecast(d); now_v = float(d["us_aqi"].iloc[-1]); t, peak = max(fc, key=lambda x: x[1])
        except Exception as exc:
            log.append(f"{c}: skipped ({exc})"); continue
        log.append(f"{c}: now {now_v:.0f}, forecast peak {peak:.0f} at {t:%H:%M} PKT")
        if max(now_v, peak) > thr:
            alerts.append({"city": c, "severity": "high" if max(now_v, peak) >= 200 else "elevated", "now": round(now_v), "forecast_peak": round(peak),
                           "peak_time_pkt": f"{t:%Y-%m-%d %H:%M}", "message": f"{c}: US AQI {now_v:.0f} now, forecast up to {peak:.0f} around {t:%H:%M} PKT (threshold {thr:.0f})."})
    text = f"GAQI agent {now_pkt():%d %b %H:%M} PKT: {len(alerts)} alert(s) above {thr:.0f}\n" + "\n".join(a["message"] for a in alerts)
    note = briefing(alerts)
    result = {"run_time_pkt": f"{now_pkt():%Y-%m-%d %H:%M}", "threshold": thr, "alerts": alerts, "log": log, "briefing": note,
              "disclaimer": "Modelled data; not medical advice."}
    json.dump(result, open("alerts.json", "w"), indent=2)
    print("\n".join(log)); print(text + ("\n" + note if note else ""))
    if alerts:
        print(telegram(text + ("\n\n" + note if note else "")))

if __name__ == "__main__":
    sys.exit(main())
