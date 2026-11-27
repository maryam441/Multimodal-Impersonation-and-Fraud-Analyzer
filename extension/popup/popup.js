/**
 * Sentinel Ambient Shield - Popup Script
 * Handles stats, active tab scanning, quick text scans, and 1-tap FIA reporting.
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
  const scanActiveTabBtn = document.getElementById("scanActiveTabBtn");
  const activeTabUrl = document.getElementById("activeTabUrl");
  const activeTabResult = document.getElementById("activeTabResult");

  let currentActiveTab = null;

  // Retrieve Active Tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0]) {
      currentActiveTab = tabs[0];
      activeTabUrl.innerText = currentActiveTab.url || "about:blank";
      activeTabUrl.title = currentActiveTab.url || "";
    } else {
      activeTabUrl.innerText = "No active web page detected";
    }
  });

  // Load stats from background storage
  chrome.storage.local.get(["scannedCount", "threatsBlocked", "protectionEnabled", "recentThreats"], (data) => {
    if (metricScanned) metricScanned.innerText = data.scannedCount || 0;
    if (metricThreats) metricThreats.innerText = data.threatsBlocked || 0;

    const threats = data.recentThreats || [];
    renderRecentThreats(threats);

    const isEnabled = data.protectionEnabled !== false;
    if (protectionToggle) protectionToggle.checked = isEnabled;
    updateStatusPill(isEnabled);
  });

  function updateStatusPill(enabled) {
    if (!shieldStatusPill) return;
    if (enabled) {
      shieldStatusPill.innerText = "ACTIVE";
      shieldStatusPill.className = "status-pill active";
    } else {
      shieldStatusPill.innerText = "PAUSED";
      shieldStatusPill.className = "status-pill disabled";
    }
  }

  // Protection toggle change
  if (protectionToggle) {
    protectionToggle.addEventListener("change", (e) => {
      const isEnabled = e.target.checked;
      chrome.storage.local.set({ protectionEnabled: isEnabled });
      updateStatusPill(isEnabled);
    });
  }

  // Scan Active Web Page
  if (scanActiveTabBtn) {
    scanActiveTabBtn.addEventListener("click", () => {
      if (!currentActiveTab || !currentActiveTab.url) return;

      scanActiveTabBtn.disabled = true;
      scanActiveTabBtn.innerText = "Scanning...";
      activeTabResult.classList.remove("hidden", "danger", "safe");
      activeTabResult.style.display = "block";
      activeTabResult.innerHTML = "<div class='scanning-text'>Analyzing page URL & lexical entropy...</div>";

      chrome.runtime.sendMessage({
        type: "SCAN_CONTENT",
        payload: {
          content: currentActiveTab.title || currentActiveTab.url,
          source: "web",
          url: currentActiveTab.url
        }
      }, (resp) => {
        scanActiveTabBtn.disabled = false;
        scanActiveTabBtn.innerText = "⚡ Verify Page";

        if (!resp || !resp.success) {
          activeTabResult.className = "active-tab-result danger";
          activeTabResult.innerText = "Scan failed: Backend unavailable at http://127.0.0.1:8000.";
          return;
        }

        const res = resp.data;
        if (res.is_threat) {
          activeTabResult.className = "active-tab-result danger";
          activeTabResult.innerHTML = `
            <div style="font-weight:bold; color:#f87171; margin-bottom:4px;">
              ⚠️ FRAUD RISK: ${res.risk_score}%
            </div>
            <div style="color:#cbd5e1; font-size:10px; margin-bottom:6px;">
              Tags: ${(res.threat_tags || []).join(" • ") || "Phishing / Impersonation"}
            </div>
            <button id="activeReportBtn" class="primary-btn" style="background:#dc2626; border-color:#ef4444; width:100%; font-size:10px; padding:6px;">
              🚨 Report Domain to FIA
            </button>
          `;

          document.getElementById("activeReportBtn").addEventListener("click", () => {
            sendFiaReport(res.case_id, currentActiveTab.url, "Active tab scan", activeTabResult);
          });
        } else {
          activeTabResult.className = "active-tab-result safe";
          activeTabResult.innerHTML = `
            <div style="font-weight:bold; color:#34d399;">
              ✅ Clean / Safe Domain
            </div>
            <div style="color:#94a3b8; font-size:10px;">
              Risk: ${res.risk_score || 0}% • No phishing or brand spoofing detected.
            </div>
          `;
        }
      });
    });
  }

  // Render recent detections
  function renderRecentThreats(threats) {
    if (!recentThreatsList) return;
    if (!threats || threats.length === 0) {
      recentThreatsList.innerHTML = `<div class="empty-state">No threats detected yet. Ambient shield is actively guarding WhatsApp, Email & Web URLs.</div>`;
      return;
    }

    recentThreatsList.innerHTML = "";
    threats.slice(0, 5).forEach((t) => {
      const item = document.createElement("div");
      item.className = "threat-item";
      item.innerHTML = `
        <div>
          <div style="font-weight:700; color:#fca5a5;">${(t.source || "WEB").toUpperCase()}: ${escapeHtml(t.sender || "Suspicious target")}</div>
          <div style="color:#94a3b8; font-size:9px;">${(t.threat_tags || []).slice(0, 2).join(", ") || "Risk flagged"}</div>
        </div>
        <div style="text-align:right;">
          <span style="font-weight:bold; color:#f87171;">${t.risk_score}%</span>
        </div>
      `;
      recentThreatsList.appendChild(item);
    });
  }

  // Quick Ambient Scan
  if (quickScanBtn) {
    quickScanBtn.addEventListener("click", () => {
      const content = quickScanInput.value.trim();
      if (!content) return;

      quickScanBtn.disabled = true;
      quickScanBtn.innerText = "Scanning...";
      quickScanResult.classList.remove("hidden", "danger", "safe");
      quickScanResult.style.display = "block";
      quickScanResult.innerHTML = "<div class='scanning-text'>Executing multi-modal neural scan...</div>";

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
            <div style="font-weight:bold; color:#f87171; margin-bottom:4px;">
              ⚠️ THREAT DETECTED: Risk Score ${res.risk_score}/100
            </div>
            <div style="color:#cbd5e1; font-size:10px; margin-bottom:8px;">
              ${(res.threat_tags || []).join(" • ") || "Fraud indicators found"}
            </div>
            <button id="quickReportBtn" class="primary-btn" style="background:#dc2626; width:100%; border-color:#ef4444; font-size:10px; padding:6px;">
              🚨 Report to FIA (PECA 2016)
            </button>
          `;

          document.getElementById("quickReportBtn").addEventListener("click", () => {
            sendFiaReport(res.case_id, res.target_phone || res.target_url || "Manual input threat", "Popup quick scan", quickScanResult);
          });
        } else {
          quickScanResult.className = "scan-result-card safe";
          quickScanResult.innerHTML = `
            <div style="font-weight:bold; color:#34d399;">
              ✅ Safe Communication
            </div>
            <div style="color:#94a3b8; font-size:10px;">
              Risk score: ${res.risk_score}/100. No fraud markers detected.
            </div>
          `;
        }
      });
    });
  }

  function sendFiaReport(caseId, accusedIdentifier, notes, targetContainer) {
    chrome.runtime.sendMessage({
      type: "REPORT_FIA",
      payload: {
        case_id: caseId,
        source: "popup_manual",
        accused_identifier: accusedIdentifier,
        operator_notes: notes
      }
    }, (repResp) => {
      if (repResp && repResp.success) {
        targetContainer.innerHTML = `
          <div style="color:#34d399; font-weight:bold; font-size:11px; margin-bottom:4px;">
            ✅ Complaint Dispatched to FIA
          </div>
          <div style="font-family:monospace; font-size:9px; color:#cbd5e1; word-break:break-all;">
            Ref: <strong>${repResp.data.reference_no}</strong>
          </div>
        `;
      } else {
        alert("Failed to submit FIA report: " + (repResp ? repResp.error : "Unknown error"));
      }
    });
  }

  // Open Web Command Center
  if (openDashboardBtn) {
    openDashboardBtn.addEventListener("click", () => {
      chrome.tabs.create({ url: "http://127.0.0.1:3000" });
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
});
