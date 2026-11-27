/**
 * Sentinel Ambient Shield - Service Worker / Background Script
 * Orchestrates real-time API communication, badge counts, context menus, and notifications.
 */

const DEFAULT_API_BASE = "http://127.0.0.1:8000/api/v1";

// Initialize local storage counters & Context Menu on install
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

  // Register Right-Click Context Menu for scanning selection or link
  chrome.contextMenus.create({
    id: "sentinel_scan_selection",
    title: "🛡️ Scan selection with AegisAI Anti-Fraud",
    contexts: ["selection", "link"]
  });

  console.log("Sentinel Ambient Shield service worker and context menu installed.");
});

// Handle Context Menu click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "sentinel_scan_selection") {
    const targetText = info.selectionText || info.linkUrl;
    if (!targetText) return;

    try {
      const result = await handleAmbientScan({
        content: targetText,
        source: "context_menu",
        url: info.linkUrl || null
      });

      if (result && result.is_threat) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon128.png",
          title: "🚨 AegisAI Fraud Warning",
          message: `High Threat Detected (Risk: ${result.risk_score}%). Flagged: ${(result.threat_tags || []).join(", ") || "Suspicious content"}`,
          priority: 2
        });
      } else {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon128.png",
          title: "✅ AegisAI Safety Check",
          message: "No obvious fraud or impersonation indicators found in the selected content.",
          priority: 1
        });
      }
    } catch (err) {
      console.error("Context menu scan error:", err);
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon128.png",
        title: "⚠️ AegisAI Scan Warning",
        message: "Failed to connect to backend at http://127.0.0.1:8000. Ensure Sentinel Core is running.",
        priority: 1
      });
    }
  }
});

// Update extension icon badge
function updateBadge(threatsCount) {
  if (threatsCount > 0) {
    chrome.action.setBadgeText({ text: `${threatsCount}` });
    chrome.action.setBadgeBackgroundColor({ color: "#dc2626" }); // Crimson red
  } else {
    chrome.action.setBadgeText({ text: "ON" });
    chrome.action.setBadgeBackgroundColor({ color: "#2563eb" }); // Cobalt blue
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
      threat_tags: result.threat_tags
    });
    // Keep max 20 threats
    if (recentThreats.length > 20) recentThreats.pop();

    updateBadge(newThreats);

    // Trigger Chrome desktop notification for severe threat
    if (result.risk_score >= 60) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon128.png",
        title: "🚨 SENTINEL FRAUD ALERT",
        message: `High risk scam flagged (${result.risk_score}%). Threat: ${(result.threat_tags || []).join(", ")}`,
        priority: 2
      });
    }
  }

  await chrome.storage.local.set({
    scannedCount: newScanned,
    threatsBlocked: newThreats,
    recentThreats: recentThreats
  });

  return result;
}

async function handleFIAReport(payload) {
  const { case_id, source, accused_identifier, operator_notes } = payload;
  const store = await chrome.storage.local.get(["apiBase"]);
  const apiBase = store.apiBase || DEFAULT_API_BASE;
  const endpoint = `${apiBase}/fia/report`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      case_id: case_id,
      user_confirmed: true,
      operator_notes: operator_notes || "Reported via Sentinel Chrome Extension",
      source: source || "chrome_extension",
      accused_identifier: accused_identifier || null
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`FIA report dispatch failed (${res.status}): ${errText}`);
  }

  return await res.json();
}
