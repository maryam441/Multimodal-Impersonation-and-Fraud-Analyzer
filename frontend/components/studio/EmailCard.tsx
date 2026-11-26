"use client";

import React from "react";
import { Mail, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";

interface EmailCardProps {
  sender: string;
  setSender: (val: string) => void;
  subject: string;
  setSubject: (val: string) => void;
  body: string;
  setBody: (val: string) => void;
  isActive: boolean;
  onToggle: () => void;
}

export function EmailCard({
  sender,
  setSender,
  subject,
  setSubject,
  body,
  setBody,
  isActive,
  onToggle,
}: EmailCardProps) {
  const loadPreset = (type: "bank" | "nadra" | "benign") => {
    if (type === "bank") {
      setSender("Habib Bank Security <security-alert@hbl-banking-notice.pk>");
      setSubject("URGENT: Temporary suspension of your HBL digital banking");
      setBody(
        "Dear Valued Customer,\n\nWe noticed unauthorized login attempts from IP 182.176.45.12. Your account has been temporarily restricted.\n\nPlease verify your biometric credentials immediately at our secure portal:\nhttp://hbl-update-security.com/login\n\nFailure to verify within 4 hours will lead to permanent card blocking.\n\nRegards,\nHBL Cyber Fraud Operations"
      );
    } else if (type === "nadra") {
      setSender("NADRA Verification Wing <alerts@nadra-cnic-verify.org>");
      setSubject("ACTION REQUIRED: CNIC Renewal & Biometric Verification");
      setBody(
        "Moaziz Shehri,\n\nApka CNIC record block honay k qareeb hai. Baraye meherbani foran apni biometric tasdeeq krain taakay sim cards or bank accounts active rahain.\n\nTasdeeqi Link: http://nadra-pakistan-biometric.com/verify\n\nShukriya,\nNADRA Verification Cell"
      );
    } else {
      setSender("State Bank of Pakistan <info@sbp.org.pk>");
      setSubject("Public Awareness: Guidelines on Safe Digital Banking");
      setBody(
        "Dear Citizens,\n\nNever share your banking OTP, PIN, or passwords with anyone claiming to be from your bank or government agencies.\n\nOfficial advisory is available at https://www.sbp.org.pk\n\nState Bank of Pakistan"
      );
    }
  };

  return (
    <div
      className={`p-5 rounded-2xl border transition-all ${
        isActive
          ? "border-cyan-500/50 bg-slate-900/80 shadow-lg shadow-cyan-950/20"
          : "border-slate-800 bg-slate-900/40 opacity-70"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/40 text-cyan-400">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono text-slate-200">Email Phishing & Header Analyzer</h3>
            <p className="text-[11px] text-slate-400">SPF/DKIM alignment, display spoofing & urgency detection</p>
          </div>
        </div>

        <button
          onClick={onToggle}
          className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-colors ${
            isActive
              ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700"
          }`}
        >
          {isActive ? "Active (20%)" : "Enable"}
        </button>
      </div>

      {/* Preset Quick Selectors */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <button
          type="button"
          onClick={() => loadPreset("bank")}
          className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-rose-950/40 border border-rose-800/40 text-rose-300 hover:bg-rose-900/60 transition-colors"
        >
          ⚡ Spoofed HBL Notice
        </button>
        <button
          type="button"
          onClick={() => loadPreset("nadra")}
          className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-amber-950/40 border border-amber-800/40 text-amber-300 hover:bg-amber-900/60 transition-colors"
        >
          ⚡ NADRA Biometric Phish
        </button>
        <button
          type="button"
          onClick={() => loadPreset("benign")}
          className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 hover:bg-emerald-900/60 transition-colors"
        >
          ⚡ Safe SBP Advisory
        </button>
      </div>

      {/* Form Fields */}
      <div className="space-y-3">
        <div>
          <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
            Sender (From Header)
          </label>
          <input
            type="text"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            placeholder="e.g. Bank Security <security@hbl-verification.com>"
            disabled={!isActive}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
            Subject Line
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. URGENT: Account blocked - action required"
            disabled={!isActive}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
            Email Body Content
          </label>
          <textarea
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Paste raw email body with embedded links and extortion demands..."
            disabled={!isActive}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 disabled:opacity-50 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
