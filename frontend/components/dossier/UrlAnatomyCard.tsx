"use client";

import React, { useState } from "react";
import { Globe, Copy, Check, ExternalLink, AlertTriangle, ShieldCheck } from "lucide-react";
import { ModalityResultItem } from "@/lib/api";

interface UrlAnatomyCardProps {
  urlResult: ModalityResultItem;
}

export function UrlAnatomyCard({ urlResult }: UrlAnatomyCardProps) {
  const [copied, setCopied] = useState(false);
  const metrics = urlResult.metrics || {};
  const defangedUrl = metrics.defanged_url || "hxxp://unspecified[.]domain";
  const matchedKeywords = metrics.matched_keywords || [];
  const flags = urlResult.signals || [];

  const handleCopy = () => {
    navigator.clipboard.writeText(defangedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-200">
            Defanged URL Anatomy & Host Security
          </h4>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
          Zero-Crawl Safe Defanged
        </span>
      </div>

      {/* Defanged Target Bar */}
      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 mb-4">
        <div className="font-mono text-xs text-rose-300 break-all select-all">
          {defangedUrl}
        </div>
        <button
          onClick={handleCopy}
          className="shrink-0 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Copy safe defanged URL"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Host Metrics Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs font-mono">
        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-slate-400 text-[10px]">TLD Identification</span>
          <div className="font-bold text-slate-200 flex items-center space-x-1">
            <span>.{metrics.tld || "unknown"}</span>
            {metrics.has_suspicious_tld && <AlertTriangle className="w-3 h-3 text-amber-400" />}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-slate-400 text-[10px]">Shannon Entropy</span>
          <div className="font-bold text-slate-200">
            {metrics.domain_entropy ? `${metrics.domain_entropy} bits` : "N/A"}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-slate-400 text-[10px]">Subdomain Depth</span>
          <div className="font-bold text-slate-200">{metrics.subdomain_depth ?? 0} levels</div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-slate-400 text-[10px]">IP Literal Host</span>
          <div className={`font-bold ${metrics.is_ip_literal ? "text-rose-400" : "text-emerald-400"}`}>
            {metrics.is_ip_literal ? "True (High Risk)" : "False (Domain)"}
          </div>
        </div>
      </div>

      {/* Detected Brand / Phishing Tokens */}
      {matchedKeywords.length > 0 && (
        <div className="mb-3">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">
            Deceptive Brand & Credential Tokens:
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {matchedKeywords.map((kw: string) => (
              <span key={kw} className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-950/60 border border-rose-800/40 text-rose-300">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Signal Flags */}
      {flags.length > 0 && (
        <div className="space-y-1.5">
          {flags.map((sig, i) => (
            <div key={i} className="text-xs font-mono p-2 rounded bg-slate-950/80 border border-slate-800/80 flex items-start space-x-2">
              <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold shrink-0 ${
                sig.severity === "critical" ? "bg-rose-950 text-rose-400 border border-rose-800/60" : "bg-amber-950 text-amber-400 border border-amber-800/60"
              }`}>
                {sig.code}
              </span>
              <span className="text-slate-300">{sig.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
