/**
 * Sentinel Ambient Shield - Service Worker / Background Script
 * Orchestrates real-time API communication, badge counts, and notifications.
 */

const DEFAULT_API_BASE = "http://127.0.0.1:8000/api/v1";

// Initialize local storage counters
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["protectionEnabled", "scannedCount", "threatsBlocked"], (data) => {
    if (data.protectionEnabled === undefined) {
      chrome.storage.local.set({
        protectionEnabled: true,
        scannedCount: 0,
        threatsBlocked: 0,
        apiBase: DEFAULT_API_BASE,
        recentThreats: []
      });
    }
  });
  console.log("Sentinel Ambient Shield service worker installed.");
});

// Update extension icon badge
function updateBadge(threatsCount) {
  if (threatsCount > 0) {
    chrome.action.setBadgeText({ text: `${threatsCount}` });
    chrome.action.setBadgeBackgroundColor({ color: "#f43f5e" }); // Rose red
  } else {
    chrome.action.setBadgeText({ text: "ON" });
    chrome.action.setBadgeBackgroundColor({ color: "#10b981" }); // Emerald
  }
}

// Handle runtime messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "SCAN_CONTENT") {
    handleAmbientScan(request.payload)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (request.type === "REPORT_FIA") {
    handleFIAReport(request.payload)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.type === "GET_STATS") {
    chrome.storage.local.get(["scannedCount", "threatsBlocked", "protectionEnabled", "recentThreats"], (data) => {
      sendResponse({ success: true, data });
    });
    return true;
  }
});

async function handleAmbientScan(payload) {
  const { content, source, sender, url, phone } = payload;
  const store = await chrome.storage.local.get(["apiBase", "protectionEnabled", "scannedCount", "threatsBlocked", "recentThreats"]);

  if (!store.protectionEnabled) {
    return { is_threat: false, bypassed: true };
  }

  const apiBase = store.apiBase || DEFAULT_API_BASE;
  const endpoint = `${apiBase}/ambient/scan`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: content || "",
      source: source || "web",
      sender: sender || null,
      url: url || null,
      phone: phone || null
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Sentinel API scan failed (${res.status}): ${errText}`);
  }

  const result = await res.json();

  // Increment scanned count
  const newScanned = (store.scannedCount || 0) + 1;
  let newThreats = store.threatsBlocked || 0;
  const recentThreats = store.recentThreats || [];

  if (result.is_threat) {
    newThreats += 1;
    recentThreats.unshift({
      id: result.case_id,
      timestamp: new Date().toISOString(),
      source: result.source,
      sender: result.sender,
      risk_score: result.risk_score,
      threat_tags: result.threat_tags,
      summary: result.summary,
      target_phone: result.target_phone,
      target_url: result.target_url
    });
    if (recentThreats.length > 20) recentThreats.pop();

    updateBadge(1);

    // Native browser toast notification
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: "🛡️ Sentinel Security Alert",
      message: `Impersonation / Fraud threat detected on ${result.source.toUpperCase()} (Risk: ${result.risk_score}/100)`,
      priority: 2
    });
  }

  await chrome.storage.local.set({
    scannedCount: newScanned,
    threatsBlocked: newThreats,
    recentThreats
  });

  return result;
}

async function handleFIAReport(payload) {
  const { case_id, operator_notes, source, accused_identifier } = payload;
  const store = await chrome.storage.local.get(["apiBase"]);
  const apiBase = store.apiBase || DEFAULT_API_BASE;
  const endpoint = `${apiBase}/incidents/direct-report`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      case_id,
      user_confirmed: true,
      operator_notes: operator_notes || "Complainant verified ambient alert via Sentinel Shield extension.",
      source: source || "whatsapp",
      accused_identifier: accused_identifier || null
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`FIA Report dispatch failed (${res.status}): ${err}`);
  }

  const report = await res.json();

  // Notification for formal registration
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: "🚨 FIA Cybercrime Complaint Registered",
    message: `Reference No: ${report.reference_no} sealed under PECA 2016.`,
    priority: 2
  });

  return report;
}
