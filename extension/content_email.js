/**
 * Sentinel Ambient Shield - Gmail & Webmail Content Script
 * Scans email bodies, subject lines, and sender headers for phishing & authority impersonation.
 */

(function () {
  console.log("🛡️ Sentinel Ambient Shield: Email Guardian activated.");

  const scannedEmails = new Set();

  function scanEmailView() {
    // Target Gmail email body containers
    const emailContainers = document.querySelectorAll('.ii.gt, div[role="listitem"] .adn');

    emailContainers.forEach(container => {
      if (container.hasAttribute('data-sentinel-email-scanned')) return;

      const bodyText = (container.innerText || "").trim();
      if (bodyText.length < 20) return;

      // Extract subject line if present
      const subjectEl = document.querySelector('h2.hP') || document.querySelector('.ha h2');
      const subject = subjectEl ? subjectEl.innerText : "Email Conversation";

      // Extract sender email if present
      const senderEl = document.querySelector('span.gD') || document.querySelector('[email]');
      const sender = senderEl ? (senderEl.getAttribute('email') || senderEl.innerText) : "Unknown Sender";

      const hash = bodyText.substring(0, 100) + sender;
      if (scannedEmails.has(hash)) return;

      scannedEmails.add(hash);
      container.setAttribute('data-sentinel-email-scanned', 'true');

      // Dispatch scan to background
      chrome.runtime.sendMessage({
        type: "SCAN_CONTENT",
        payload: {
          content: `${subject}\n\n${bodyText}`,
          source: "gmail",
          sender: sender
        }
      }, (response) => {
        if (!response || !response.success || !response.data) return;

        const data = response.data;
        if (data.is_threat) {
          injectEmailBanner(container, data, subject, sender, bodyText);
        }
      });
    });
  }

  function injectEmailBanner(container, data, subject, sender, bodyText) {
    if (container.querySelector('.sentinel-gmail-banner')) return;

    const banner = document.createElement('div');
    banner.className = 'sentinel-gmail-banner';
    banner.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px;">
        <span style="font-size:20px;">⚠️</span>
        <div>
          <div style="font-weight:700; color:#fca5a5; font-size:13px; text-transform:uppercase;">
            Sentinel Security Alert: Potential Phishing / Impersonation (${data.risk_score}% Risk)
          </div>
          <div style="font-size:11px; color:#cbd5e1; margin-top:2px;">
            ${(data.threat_tags || []).join(' • ')}
          </div>
        </div>
      </div>
      <div>
        <button class="sentinel-report-btn" id="sentinel-email-fia-btn">Report Sender to FIA</button>
      </div>
    `;

    banner.querySelector('#sentinel-email-fia-btn').addEventListener('click', () => {
      openEmailFIAModal(data, subject, sender, bodyText);
    });

    container.insertBefore(banner, container.firstChild);
  }

  function openEmailFIAModal(data, subject, sender, bodyText) {
    const overlay = document.createElement('div');
    overlay.className = 'sentinel-modal-overlay';
    overlay.innerHTML = `
      <div class="sentinel-modal-card">
        <div class="sentinel-modal-title">
          <span>🚨 FIA Cybercrime Statutory Report (PECA 2016)</span>
        </div>
        <div class="sentinel-modal-body">
          <p>Formal statutory complaint against phishing / fraudulent email from <strong>${escapeHtml(sender)}</strong>.</p>
          <div class="sentinel-modal-evidence-box">
            <div><strong>Suspect / Sender:</strong> ${escapeHtml(sender)}</div>
            <div><strong>Subject:</strong> ${escapeHtml(subject)}</div>
            <div><strong>Threat Risk Score:</strong> ${data.risk_score} / 100.0</div>
            <div><strong>PECA Charges:</strong> Sections 13 (Forgery) & 14 (Electronic Fraud)</div>
          </div>
          <p style="font-size:11px; color:#94a3b8;">
            Submitting this report will seal all cryptographic hashes and dispatch the official affidavit to the FIA National Response Centre for Cyber Crime (NR3C).
          </p>
        </div>
        <div class="sentinel-modal-actions">
          <button class="sentinel-btn-secondary" id="sentinel-email-cancel">Cancel</button>
          <button class="sentinel-btn-primary" id="sentinel-email-confirm">Transmit to FIA</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#sentinel-email-cancel').addEventListener('click', () => overlay.remove());

    const confirmBtn = overlay.querySelector('#sentinel-email-confirm');
    confirmBtn.addEventListener('click', () => {
      confirmBtn.disabled = true;
      confirmBtn.innerText = "Transmitting...";

      chrome.runtime.sendMessage({
        type: "REPORT_FIA",
        payload: {
          case_id: data.case_id,
          source: "email",
          accused_identifier: sender,
          operator_notes: `Reported via Sentinel Email Guardian. Subject: ${subject}`
        }
      }, (resp) => {
        if (resp && resp.success) {
          const rep = resp.data;
          overlay.querySelector('.sentinel-modal-card').innerHTML = `
            <div class="sentinel-modal-title" style="color:#10b981;">
              <span>✅ Formal Complaint Dispatched</span>
            </div>
            <div class="sentinel-modal-body">
              <div class="sentinel-modal-evidence-box" style="color:#34d399;">
                <div><strong>Tracking Reference:</strong> ${rep.reference_no}</div>
                <div><strong>Evidence Digest:</strong> ${rep.sha256_digest.substring(0, 24)}...</div>
              </div>
            </div>
            <div class="sentinel-modal-actions">
              <button class="sentinel-btn-primary" id="sentinel-email-done">Done</button>
            </div>
          `;
          overlay.querySelector('#sentinel-email-done').addEventListener('click', () => overlay.remove());
        } else {
          alert("Submission error: " + (resp ? resp.error : "Unknown"));
          confirmBtn.disabled = false;
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

  // Observe Gmail navigation changes
  setInterval(scanEmailView, 2000);
})();
