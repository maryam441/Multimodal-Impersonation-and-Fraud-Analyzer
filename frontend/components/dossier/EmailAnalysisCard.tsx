"use client";

import React from "react";
import { Mail, AlertTriangle, ShieldCheck, ShieldAlert, ExternalLink, KeyRound } from "lucide-react";
import { ModalityResultItem } from "@/lib/api";

interface EmailAnalysisCardProps {
  emailResult: ModalityResultItem;
}

export function EmailAnalysisCard({ emailResult }: EmailAnalysisCardProps) {
  const { metrics, signals, risk_score, risk_label } = emailResult;
  const isHighRisk = (risk_score || 0) >= 61;
  const isMedRisk = (risk_score || 0) >= 31 && (risk_score || 0) < 61;

  const authAlignment = metrics?.authentication_alignment || "unknown";
  const displaySpoof = metrics?.display_name_spoof_detected;
  const brandImpersonated = metrics?.brand_impersonated;
  const embeddedLinks: string[] = metrics?.embedded_links || [];

  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/40 text-cyan-400">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wide">
              Email Phishing & Header Forensics
            </h3>
            <p className="text-[11px] text-slate-400">
              RFC 2822 header spoofing, SPF/DKIM verification & brand impersonation audit
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase ${
              isHighRisk
                ? "bg-rose-950/80 border border-rose-800/60 text-rose-400"
                : isMedRisk
                ? "bg-amber-950/80 border border-amber-800/60 text-amber-400"
                : "bg-emerald-950/80 border border-emerald-800/60 text-emerald-400"
            }`}
          >
            {risk_label?.toUpperCase()} ({Math.round(risk_score || 0)}/100)
          </span>
        </div>
      </div>

      {/* Forensic Audit Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* Brand Spoofing Check */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-500">Brand Impersonation</span>
          <div className="mt-1 flex items-center space-x-1.5">
            {brandImpersonated ? (
              <>
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-xs font-mono font-bold text-rose-300">
                  Target: {brandImpersonated}
                </span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-mono text-slate-300">No Target Match</span>
              </>
            )}
          </div>
          <span className="text-[10px] font-mono text-slate-500 mt-1">
            {displaySpoof ? "Display Name ≠ Domain" : "Header Consistent"}
          </span>
        </div>

        {/* SPF/DKIM Alignment */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-500">Header Auth (SPF / DKIM)</span>
          <div className="mt-1 flex items-center space-x-1.5">
            {authAlignment === "fail" ? (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-xs font-mono font-bold text-rose-400">FAILED / UNVERIFIED</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-mono font-bold text-emerald-400">PASSED</span>
              </>
            )}
          </div>
          <span className="text-[10px] font-mono text-slate-500 mt-1">
            Sender: {metrics?.sender_domain || "Unknown Domain"}
          </span>
        </div>

        {/* Coercive Urgency */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-500">Urgency & Coercion</span>
          <div className="mt-1 flex items-center space-x-1.5">
            <KeyRound className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-xs font-mono font-bold text-slate-200">
              {metrics?.urgency_detected ? "High Urgency Coercion" : "Standard Tone"}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 mt-1">
            Links embedded: {embeddedLinks.length}
          </span>
        </div>
      </div>

      {/* Embedded Links Callout */}
      {embeddedLinks.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 mb-4">
          <div className="text-[11px] font-mono uppercase text-slate-400 mb-1 flex items-center space-x-1.5">
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span>Extracted Embedded Links:</span>
          </div>
          <div className="space-y-1">
            {embeddedLinks.map((link, idx) => (
              <code key={idx} className="block text-xs font-mono text-cyan-300 break-all bg-slate-900 px-2 py-1 rounded border border-slate-800">
                {link}
              </code>
            ))}
          </div>
        </div>
      )}

      {/* Signals Breakdown */}
      {signals && signals.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-mono uppercase text-slate-400">Forensic Signals & Triggers</div>
          <div className="space-y-1.5">
            {signals.map((sig, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start justify-between text-xs font-mono"
              >
                <div>
                  <span className="text-rose-400 font-bold mr-2">[{sig.code}]</span>
                  <span className="text-slate-200">{sig.description}</span>
                  {sig.evidence && (
                    <div className="text-[11px] text-slate-400 mt-0.5">Evidence: {sig.evidence}</div>
                  )}
                </div>
                <span
                  className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ml-2 shrink-0 ${
                    sig.severity === "critical"
                      ? "bg-rose-950 text-rose-400 border border-rose-800"
                      : sig.severity === "high"
                      ? "bg-amber-950 text-amber-400 border border-amber-800"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {sig.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
