/**
 * Sentinel Ambient Shield - Popup Script
 */

document.addEventListener("DOMContentLoaded", () => {
  const metricScanned = document.getElementById("metricScanned");
  const metricThreats = document.getElementById("metricThreats");
  const metricReports = document.getElementById("metricReports");
  const shieldStatusPill = document.getElementById("shieldStatusPill");
  const protectionToggle = document.getElementById("protectionToggle");
  const quickScanInput = document.getElementById("quickScanInput");
  const quickScanBtn = document.getElementById("quickScanBtn");
  const quickScanResult = document.getElementById("quickScanResult");
  const recentThreatsList = document.getElementById("recentThreatsList");
  const openDashboardBtn = document.getElementById("openDashboardBtn");

  // Load stats from background storage
  chrome.storage.local.get(["scannedCount", "threatsBlocked", "protectionEnabled", "recentThreats"], (data) => {
    metricScanned.innerText = data.scannedCount || 0;
    metricThreats.innerText = data.threatsBlocked || 0;
    
    // Count reported items
    const threats = data.recentThreats || [];
    renderRecentThreats(threats);

    const isEnabled = data.protectionEnabled !== false;
    protectionToggle.checked = isEnabled;
    updateStatusPill(isEnabled);
  });

  function updateStatusPill(enabled) {
    if (enabled) {
      shieldStatusPill.innerText = "ACTIVE";
      shieldStatusPill.className = "status-pill active";
    } else {
      shieldStatusPill.innerText = "PAUSED";
      shieldStatusPill.className = "status-pill disabled";
    }
  }

  // Protection toggle change
  protectionToggle.addEventListener("change", (e) => {
    const isEnabled = e.target.checked;
    chrome.storage.local.set({ protectionEnabled: isEnabled });
    updateStatusPill(isEnabled);
  });

  // Render recent detections
  function renderRecentThreats(threats) {
    if (!threats || threats.length === 0) {
      recentThreatsList.innerHTML = `<div class="empty-state">No threats detected yet. Ambient shield is actively guarding WhatsApp & Email.</div>`;
      return;
    }

    recentThreatsList.innerHTML = "";
    threats.slice(0, 5).forEach((t) => {
      const item = document.createElement("div");
      item.className = "threat-item";
      item.innerHTML = `
        <div>
          <div style="font-weight:700; color:#fca5a5;">${t.source.toUpperCase()}: ${escapeHtml(t.sender || "Unknown")}</div>
          <div style="color:#94a3b8; font-size:9px;">${(t.threat_tags || []).slice(0, 2).join(", ")}</div>
        </div>
        <div style="text-align:right;">
          <span style="font-weight:bold; color:#f43f5e;">${t.risk_score}%</span>
        </div>
      `;
      recentThreatsList.appendChild(item);
    });
  }

  // Quick Ambient Scan
  quickScanBtn.addEventListener("click", () => {
    const content = quickScanInput.value.trim();
    if (!content) return;

    quickScanBtn.disabled = true;
    quickScanBtn.innerText = "Scanning...";
    quickScanResult.classList.remove("hidden", "danger", "safe");
    quickScanResult.innerHTML = "Executing multi-modal neural scan...";

    chrome.runtime.sendMessage({
      type: "SCAN_CONTENT",
      payload: { content, source: "popup_quick_scan" }
    }, (resp) => {
      quickScanBtn.disabled = false;
      quickScanBtn.innerText = "Analyze Threat";

      if (!resp || !resp.success) {
        quickScanResult.className = "scan-result-card danger";
        quickScanResult.innerText = "Scan failed: Ensure Sentinel Core backend is running at http://127.0.0.1:8000.";
        return;
      }

      const res = resp.data;
      if (res.is_threat) {
        quickScanResult.className = "scan-result-card danger";
        quickScanResult.innerHTML = `
          <div style="font-weight:bold; color:#f43f5e; margin-bottom:4px;">
            ⚠️ THREAT DETECTED: Risk Score ${res.risk_score}/100
          </div>
          <div style="color:#cbd5e1; font-size:10px; margin-bottom:8px;">
            ${(res.threat_tags || []).join(" • ")}
          </div>
          <button id="quickReportBtn" class="primary-btn" style="background:#e11d48; width:100%; border-color:#f43f5e;">
            🚨 Report to FIA (PECA 2016)
          </button>
        `;

        document.getElementById("quickReportBtn").addEventListener("click", () => {
          chrome.runtime.sendMessage({
            type: "REPORT_FIA",
            payload: {
              case_id: res.case_id,
              source: "popup_manual",
              accused_identifier: res.target_phone || res.target_url || "Manual input threat"
            }
          }, (repResp) => {
            if (repResp && repResp.success) {
              quickScanResult.innerHTML = `
                <div style="color:#10b981; font-weight:bold;">
                  ✅ FIA Incident Registered!
                </div>
                <div style="color:#94a3b8; font-size:10px; margin-top:4px;">
                  Tracking ID: <strong>${repResp.data.reference_no}</strong>
                </div>
              `;
            }
          });
        });
      } else {
        quickScanResult.className = "scan-result-card safe";
        quickScanResult.innerHTML = `
          <div style="font-weight:bold; color:#10b981;">
            ✅ SAFE / LOW RISK: Score ${res.risk_score}/100
          </div>
          <div style="color:#94a3b8; font-size:10px; margin-top:2px;">
            No suspicious impersonation or deceptive patterns detected.
          </div>
        `;
      }
    });
  });

  // Open Full Forensic Dashboard
  openDashboardBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: "http://localhost:3000" });
  });

  function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }
});
