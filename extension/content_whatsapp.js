/**
 * Sentinel Ambient Shield - WhatsApp Web Content Script
 * Real-time DOM observation and inline threat protection for WhatsApp Web.
 */

(function () {
  console.log("🛡️ Sentinel Ambient Shield: WhatsApp Web monitor activated.");

  const processedMessages = new Set();

  // Create hash for message deduplication
  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return String(hash);
  }

  // Get active sender or chat title
  function getActiveChatTitle() {
    const titleEl = document.querySelector('header span[data-testid="conversation-info-header-chat-title"]') ||
      document.querySelector('header [title]') ||
      document.querySelector('header ._amig');
    return titleEl ? (titleEl.getAttribute('title') || titleEl.innerText) : "Unknown WhatsApp Contact";
  }

  // Scan an individual message element
  function inspectMessageElement(msgEl) {
    if (!msgEl || msgEl.hasAttribute('data-sentinel-scanned')) return;

    // Check if incoming message (typically contains 'message-in')
    const isIncoming = msgEl.classList.contains('message-in') ||
      msgEl.closest('.message-in') ||
      !msgEl.classList.contains('message-out');

    if (!isIncoming) return;

    const textEl = msgEl.querySelector('.selectable-text') ||
      msgEl.querySelector('span.selectable-text') ||
      msgEl.querySelector('div.copyable-text');

    if (!textEl) return;

    const text = (textEl.innerText || "").trim();
    if (text.length < 5) return;

    const msgHash = hashString(text);
    if (processedMessages.has(msgHash)) return;

    processedMessages.add(msgHash);
    msgEl.setAttribute('data-sentinel-scanned', 'true');

    const sender = getActiveChatTitle();

    // Dispatch scan to background service worker
    chrome.runtime.sendMessage({
      type: "SCAN_CONTENT",
      payload: {
        content: text,
        source: "whatsapp",
        sender: sender
      }
    }, (response) => {
      if (chrome.runtime.lastError || !response || !response.success) {
        return;
      }

      const data = response.data;
      if (data && data.is_threat) {
        attachThreatBadge(msgEl, textEl, data, text, sender);
      }
    });
  }

  // Attach interactive threat badge directly onto message
  function attachThreatBadge(msgEl, textEl, data, messageText, sender) {
    if (msgEl.querySelector('.sentinel-threat-badge')) return;

    const badge = document.createElement('div');
    badge.className = 'sentinel-threat-badge';

    const tagsHtml = (data.threat_tags || []).slice(0, 3).map(t => `<span>• ${escapeHtml(t)}</span>`).join(' ');

    badge.innerHTML = `
      <div>
        <div class="sentinel-badge-header">
          <span>⚠️ Scam / Impersonation Alert (${data.risk_score}%)</span>
        </div>
        <div class="sentinel-threat-tags">${tagsHtml}</div>
      </div>
      <div>
        <button class="sentinel-report-btn">Report to FIA</button>
      </div>
    `;

    const reportBtn = badge.querySelector('.sentinel-report-btn');
    reportBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openFIAReportModal(data, messageText, sender);
    });

    textEl.parentNode.insertBefore(badge, textEl.nextSibling);
  }

  // Human-in-the-Loop Confirmation Modal
  function openFIAReportModal(data, messageText, sender) {
    const existing = document.getElementById('sentinel-modal-root');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'sentinel-modal-root';
    overlay.className = 'sentinel-modal-overlay';

    overlay.innerHTML = `
      <div class="sentinel-modal-card">
        <div class="sentinel-modal-title">
          <span>🚨 FIA Cybercrime Statutory Report (PECA 2016)</span>
        </div>
        <div class="sentinel-modal-body">
          <p>Sentinel Core has detected a high-probability social engineering / impersonation fraud attempt from <strong>${escapeHtml(sender)}</strong>.</p>
          <div class="sentinel-modal-evidence-box">
            <div><strong>Suspect / Target:</strong> ${escapeHtml(data.target_phone || sender)}</div>
            <div><strong>Threat Severity:</strong> Risk Score ${data.risk_score}/100</div>
            <div><strong>Violations:</strong> PECA 2016 Sec 13 (Forgery), Sec 14 (Fraud), Sec 16 (Identity Theft)</div>
            <div style="margin-top:6px; color:#cbd5e1;"><strong>Message Evidence:</strong> "${escapeHtml(messageText)}"</div>
          </div>
          <p style="font-size:11px; color:#94a3b8;">
            By confirming, you authorize Sentinel Core to seal the forensic evidence with SHA-256 and register an official complaint with the Federal Investigation Agency (FIA) National Response Centre for Cyber Crime (NR3C).
          </p>
        </div>
        <div class="sentinel-modal-actions">
          <button class="sentinel-btn-secondary" id="sentinel-cancel-btn">Dismiss</button>
          <button class="sentinel-btn-primary" id="sentinel-confirm-btn">Confirm & Report to FIA</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('sentinel-cancel-btn').addEventListener('click', () => {
      overlay.remove();
    });

    const confirmBtn = document.getElementById('sentinel-confirm-btn');
    confirmBtn.addEventListener('click', () => {
      confirmBtn.disabled = true;
      confirmBtn.innerText = "Transmitting to FIA...";

      chrome.runtime.sendMessage({
        type: "REPORT_FIA",
        payload: {
          case_id: data.case_id,
          source: "whatsapp",
          accused_identifier: data.target_phone || sender,
          operator_notes: `Reported via Sentinel WhatsApp Web Extension from chat: ${sender}`
        }
      }, (resp) => {
        if (resp && resp.success) {
          const rep = resp.data;
          overlay.querySelector('.sentinel-modal-card').innerHTML = `
            <div class="sentinel-modal-title" style="color:#10b981;">
              <span>✅ Complaint Successfully Registered</span>
            </div>
            <div class="sentinel-modal-body">
              <p>Your incident has been formally recorded under <strong>PECA 2016</strong>.</p>
              <div class="sentinel-modal-evidence-box" style="color:#34d399;">
                <div><strong>FIA Tracking Number:</strong> ${rep.reference_no}</div>
                <div><strong>Evidence SHA-256:</strong> ${rep.sha256_digest.substring(0, 24)}...</div>
                <div><strong>Status:</strong> REGISTERED WITH NR3C</div>
              </div>
              <p style="font-size:11px; color:#94a3b8;">
                You can review the full cryptographically sealed forensic dossier in your Sentinel Core Command Center.
              </p>
            </div>
            <div class="sentinel-modal-actions">
              <button class="sentinel-btn-primary" id="sentinel-close-success-btn">Done</button>
            </div>
          `;
          document.getElementById('sentinel-close-success-btn').addEventListener('click', () => overlay.remove());
        } else {
          alert("Error dispatching FIA report: " + (resp ? resp.error : "Unknown error"));
          confirmBtn.disabled = false;
          confirmBtn.innerText = "Confirm & Report to FIA";
        }
      });
    });
  }

  function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }

  // MutationObserver for live WhatsApp chats
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.classList && (node.classList.contains('message-in') || node.classList.contains('focusable-list-item'))) {
            inspectMessageElement(node);
          }
          const subMessages = node.querySelectorAll ? node.querySelectorAll('.message-in, [data-testid="msg-container"]') : [];
          subMessages.forEach(inspectMessageElement);
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Initial pass on loaded messages
  setTimeout(() => {
    document.querySelectorAll('.message-in, [data-testid="msg-container"]').forEach(inspectMessageElement);
  }, 2500);

})();
