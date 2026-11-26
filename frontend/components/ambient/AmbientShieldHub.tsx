"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Download,
  FileText,
  Clock,
  Phone,
  Globe,
  Mail,
  MessageSquare,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Lock,
  ChevronRight
} from "lucide-react";
import {
  getAmbientScanHistory,
  listFiaIncidents,
  directReportFia,
  getFiaDownloadUrl,
  AmbientScanHistoryItem,
  FiaIncidentItem
} from "@/lib/api";

export function AmbientShieldHub() {
  const [activeTab, setActiveTab] = useState<"intercepts" | "incidents" | "guide">("intercepts");
  const [intercepts, setIntercepts] = useState<AmbientScanHistoryItem[]>([]);
  const [incidents, setIncidents] = useState<FiaIncidentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportingItem, setReportingItem] = useState<AmbientScanHistoryItem | null>(null);
  const [investigatorNotes, setInvestigatorNotes] = useState("");
  const [submittingFia, setSubmittingFia] = useState(false);
  const [reportSuccess, setReportSuccess] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hist, inc] = await Promise.all([
        getAmbientScanHistory(),
        listFiaIncidents(),
      ]);
      setIntercepts(hist);
      setIncidents(inc);
    } catch (err) {
      console.error("Error loading ambient shield data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenFiaModal = (item: AmbientScanHistoryItem) => {
    setReportingItem(item);
    setInvestigatorNotes(`Suspect reported from ${item.source.toUpperCase()} ambient stream.`);
    setReportSuccess(null);
  };

  const handleConfirmFiaReport = async () => {
    if (!reportingItem) return;
    setSubmittingFia(true);
    try {
      const res = await directReportFia({
        case_id: reportingItem.case_id,
        user_confirmed: true,
        operator_notes: investigatorNotes,
        source: reportingItem.source,
        accused_identifier: reportingItem.target_phone || reportingItem.target_url || reportingItem.sender_info,
      });
      setReportSuccess(res);
      fetchData();
    } catch (err: any) {
      alert("Error dispatching FIA report: " + (err.message || "Unknown error"));
    } finally {
      setSubmittingFia(false);
    }
  };

  return (
    <section id="ambient-shield" className="py-12 border-t border-slate-800 bg-slate-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header and Telemetry Row */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  Ambient Neural Shield v3.0 — Active Protection
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-mono font-bold text-white tracking-wide">
                Autonomous WhatsApp, Email & URL Guardian
              </h2>
              <p className="text-xs font-mono text-slate-400 max-w-2xl">
                Continuous ambient monitoring across WhatsApp Web, Gmail, and Web URLs. Flags incoming impersonation and fraud attempts in real time with 1-click statutory FIA Cybercrime reporting under PECA 2016.
              </p>
            </div>

            {/* Platform Indicators */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center space-x-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Web</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>Gmail / Email</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                <span>Web URLs</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Desktop Clipboard</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation & Refresh */}
          <div className="flex items-center justify-between border-t border-slate-800/80 mt-6 pt-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("intercepts")}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${activeTab === "intercepts"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
              >
                Live Intercepts Feed ({intercepts.length})
              </button>
              <button
                onClick={() => setActiveTab("incidents")}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${activeTab === "incidents"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
              >
                FIA Incident Registry ({incidents.length})
              </button>
              <button
                onClick={() => setActiveTab("guide")}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${activeTab === "guide"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
              >
                Browser Extension Setup
              </button>
            </div>

            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* TAB 1: LIVE INTERCEPTS FEED */}
        {activeTab === "intercepts" && (
          <div className="space-y-4">
            {intercepts.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/30 text-slate-500 font-mono text-xs">
                No ambient threat intercepts captured yet. Install the extension or send a test WhatsApp/Email message.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {intercepts.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all ${item.is_threat
                        ? "bg-rose-950/20 border-rose-900/50 hover:border-rose-700/60"
                        : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center space-x-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/60 border border-slate-800 text-slate-300 uppercase">
                        {item.source === "whatsapp" && <MessageSquare className="w-3 h-3 text-emerald-400" />}
                        {item.source === "gmail" && <Mail className="w-3 h-3 text-cyan-400" />}
                        {item.source === "web" && <Globe className="w-3 h-3 text-purple-400" />}
                        {item.source === "clipboard" && <Lock className="w-3 h-3 text-amber-400" />}
                        <span>{item.source}</span>
                      </span>

                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${item.risk_score >= 60
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                            : item.risk_score >= 31
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          }`}
                      >
                        {item.risk_score.toFixed(1)} / 100
                      </span>
                    </div>

                    <div className="mb-2">
                      <div className="text-[11px] font-mono font-bold text-slate-200 truncate">
                        Sender / Target: {item.sender_info || item.target_phone || "Unknown"}
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 line-clamp-2 mt-1">
                        "{item.preview_snippet}"
                      </p>
                    </div>

                    {item.threat_tags && item.threat_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.threat_tags.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-rose-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>{new Date(item.created_at).toLocaleTimeString()}</span>
                      {item.is_threat && (
                        <button
                          onClick={() => handleOpenFiaModal(item)}
                          className="px-2.5 py-1 rounded bg-rose-600/80 hover:bg-rose-600 text-white font-bold transition-all flex items-center space-x-1"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>Report to FIA</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FIA INCIDENT REGISTRY */}
        {activeTab === "incidents" && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider">
                  Official FIA Cyber Crime Wing (NR3C) Registered Complaints
                </h3>
                <p className="text-[11px] font-mono text-slate-400">
                  Digitally sealed under Prevention of Electronic Crimes Act (PECA) 2016 Sections 13, 14, and 16.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold">
                {incidents.length} Sealed Records
              </span>
            </div>

            {incidents.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-mono text-xs">
                No formal complaints filed yet. Report an ambient threat or click "Report to FIA" to generate an official complaint.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Reference No</th>
                      <th className="p-3">Accused Target</th>
                      <th className="p-3">Platform</th>
                      <th className="p-3">Risk Score</th>
                      <th className="p-3">PECA Sections</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Affidavit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {incidents.map((inc) => (
                      <tr key={inc.id} className="hover:bg-slate-800/30">
                        <td className="p-3 font-bold text-rose-400">{inc.reference_no}</td>
                        <td className="p-3 text-slate-200 font-semibold">{inc.accused_identifier || "Unknown"}</td>
                        <td className="p-3 uppercase text-slate-400 text-[10px]">{inc.platform_source}</td>
                        <td className="p-3 text-rose-300 font-bold">{inc.risk_score.toFixed(1)}/100</td>
                        <td className="p-3 text-[10px] text-cyan-300">
                          {inc.statutory_sections ? inc.statutory_sections.join(", ") : "PECA 2016"}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            {inc.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <a
                            href={getFiaDownloadUrl(inc.reference_no)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] border border-slate-700 transition-all"
                          >
                            <Download className="w-3 h-3 text-cyan-400" />
                            <span>Download Affidavit</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BROWSER EXTENSION SETUP GUIDE */}
        {activeTab === "guide" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl space-y-6">
              <div>
                <h3 className="text-base font-mono font-bold text-white uppercase tracking-wider mb-1">
                  15-Second Integration Guide: Chrome & Microsoft Edge
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Integrate Sentinel Ambient Shield once into your browser to automatically guard WhatsApp Web, Gmail, and every website you visit.
                </p>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">Open Chrome / Edge Extensions</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      Open a new browser tab and navigate to <code className="text-cyan-300">chrome://extensions/</code> (or <code className="text-cyan-300">edge://extensions/</code>).
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">Enable Developer Mode</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      Turn the switch for <strong>"Developer mode"</strong> in the top-right corner to <strong>ON</strong>.
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">Click "Load Unpacked" and Select Folder</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      Click the <strong>"Load unpacked"</strong> button and select the following directory:
                    </div>
                    <div className="mt-2 p-2 rounded bg-slate-900 border border-slate-700 text-cyan-300 text-[11px] break-all select-all">
                      c:\Users\Maryam_Sharif\Desktop\fyp\extension
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Daemon Card */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-amber-400">
                  <Lock className="w-5 h-5" />
                  <h4 className="text-sm font-mono font-bold uppercase tracking-wider">
                    OS Desktop Clipboard Guard
                  </h4>
                </div>
                <p className="text-xs font-mono text-slate-400 leading-relaxed">
                  For protection outside of browsers (WhatsApp Desktop, Outlook, SMS, Telegram), run the Sentinel Desktop Agent. It monitors copied text and pops native Windows notifications when scam links are copied.
                </p>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-amber-300 space-y-1">
                  <div className="text-slate-500 text-[10px]"># Launch in Windows PowerShell:</div>
                  <div>python desktop_agent/sentinel_agent.py</div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero-Latency System Daemon</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* HUMAN-IN-THE-LOOP STATUTORY FIA REPORT MODAL */}
      {reportingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-xl p-6 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl font-mono text-xs text-slate-200">
            {!reportSuccess ? (
              <>
                <div className="flex items-center space-x-2 text-rose-400 mb-4 pb-2 border-b border-slate-800">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    Human-in-the-Loop Gate: Confirm Official FIA Cybercrime Report
                  </h3>
                </div>

                <div className="space-y-3 mb-6">
                  <p className="text-slate-300">
                    You are authorizing the dispatch of a formal cybercrime incident complaint to the{" "}
                    <strong className="text-white">Federal Investigation Agency (FIA) National Response Centre for Cyber Crime (NR3C)</strong>.
                  </p>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-[11px]">
                    <div><span className="text-slate-500">Suspect / Target:</span> <strong className="text-white">{reportingItem.target_phone || reportingItem.target_url || reportingItem.sender_info}</strong></div>
                    <div><span className="text-slate-500">Platform Source:</span> <span className="uppercase text-cyan-300">{reportingItem.source}</span></div>
                    <div><span className="text-slate-500">Assessed Severity:</span> <span className="text-rose-400 font-bold">{reportingItem.risk_score.toFixed(1)}/100 (HIGH RISK)</span></div>
                    <div><span className="text-slate-500">Statutory Charges:</span> <span className="text-slate-300">PECA 2016 Sections 13 (Forgery) & 14 (Electronic Fraud)</span></div>
                    <div className="pt-2 text-slate-400 italic">"{reportingItem.preview_snippet}"</div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Investigator / Complainant Remarks:</label>
                    <textarea
                      value={investigatorNotes}
                      onChange={(e) => setInvestigatorNotes(e.target.value)}
                      className="w-full h-16 p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>

                  <p className="text-[10px] text-slate-500">
                    * By confirming, you verify that this incident involves intentional impersonation, financial deceit, or credential compromise. All hashes are sealed cryptographically with SHA-256.
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setReportingItem(null)}
                    disabled={submittingFia}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmFiaReport}
                    disabled={submittingFia}
                    className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all flex items-center space-x-1.5 shadow-lg shadow-rose-600/30"
                  >
                    {submittingFia ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Transmitting to FIA...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Confirm & Dispatch Report</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div>
                <div className="flex items-center space-x-2 text-emerald-400 mb-4 pb-2 border-b border-slate-800">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    Official FIA Incident Complaint Registered
                  </h3>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 text-emerald-300 space-y-2 mb-6">
                  <div><strong>Complaint Tracking Reference:</strong> {reportSuccess.reference_no}</div>
                  <div><strong>Accused Suspect:</strong> {reportSuccess.accused_identifier}</div>
                  <div><strong>Cryptographic Digest:</strong> {reportSuccess.sha256_digest.substring(0, 32)}...</div>
                  <div className="text-[11px] text-slate-400">
                    Status: <strong>REGISTERED WITH FIA CYBER CRIME WING (PECA 2016)</strong>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <a
                    href={getFiaDownloadUrl(reportSuccess.reference_no)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Affidavit</span>
                  </a>
                  <button
                    onClick={() => setReportingItem(null)}
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
