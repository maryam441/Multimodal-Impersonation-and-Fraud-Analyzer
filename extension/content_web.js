/**
 * Sentinel Ambient Shield - Web & URL Protection Content Script
 * Defends against malicious landing pages, brand spoofing, and credential harvesters.
 */

(function () {
  const currentUrl = window.location.href;
  if (!currentUrl.startsWith('http')) return;

  // Scan current page URL via background service worker
  chrome.runtime.sendMessage({
    type: "SCAN_CONTENT",
    payload: {
      content: document.title || currentUrl,
      source: "web",
      url: currentUrl
    }
  }, (response) => {
    if (!response || !response.success || !response.data) return;

    const data = response.data;
    if (data.is_threat && data.risk_score >= 60.0) {
      injectWebWarningBanner(data);
    }
  });

  function injectWebWarningBanner(data) {
    if (document.getElementById('sentinel-web-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'sentinel-web-banner';
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      background: #881337;
      border-bottom: 2px solid #f43f5e;
      color: #fff;
      padding: 10px 20px;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 13px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    `;

    banner.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:18px;">🛑</span>
        <span>
          <strong>SENTINEL FRAUD ALERT:</strong> This webpage has been flagged as suspicious / deceptive (${data.risk_score}% Risk). 
          Do not enter OTPs, passwords, or CNIC.
        </span>
      </div>
      <div style="display:flex; gap:10px;">
        <button id="sentinel-dismiss-web" style="background:#475569; color:#fff; border:none; padding:4px 10px; border-radius:4px; cursor:pointer;">Dismiss</button>
        <button id="sentinel-report-web-fia" style="background:#e11d48; color:#fff; border:1px solid #fda4af; padding:4px 12px; border-radius:4px; font-weight:bold; cursor:pointer;">Report Domain to FIA</button>
      </div>
    `;

    document.body.appendChild(banner);

    document.getElementById('sentinel-dismiss-web').addEventListener('click', () => banner.remove());
    document.getElementById('sentinel-report-web-fia').addEventListener('click', () => {
      chrome.runtime.sendMessage({
        type: "REPORT_FIA",
        payload: {
          case_id: data.case_id,
          source: "web",
          accused_identifier: data.target_url || window.location.hostname,
          operator_notes: `Malicious domain flagged via Sentinel Web Guardian: ${window.location.href}`
        }
      }, (resp) => {
        if (resp && resp.success) {
          alert(`Official FIA Complaint Registered! Reference No: ${resp.data.reference_no}`);
          banner.remove();
        }
      });
    });
  }
})();
