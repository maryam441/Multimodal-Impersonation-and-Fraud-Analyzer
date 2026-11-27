"use client";

import React from "react";
import { Mic, MessageSquare, MessagesSquare, Link2, PhoneCall, Mail, ArrowRight, ShieldCheck, AlertCircle, Smartphone, Chrome } from "lucide-react";

export function Hero({ onLaunch }: { onLaunch: () => void }) {
  const modalities = [
    { name: "Voice Analysis", icon: Mic, desc: "Acoustic MFCCs, jitter & deepfake vishing detection", code: "01", accent: "border-blue-500/30 text-blue-400" },
    { name: "Message Analysis", icon: MessageSquare, desc: "Roman Urdu & English single-text scam attribution", code: "02", accent: "border-amber-500/30 text-amber-400" },
    { name: "Conversation Analysis", icon: MessagesSquare, desc: "Multi-turn urgency & authority manipulation tagging", code: "03", accent: "border-indigo-500/30 text-indigo-400" },
    { name: "Email Phishing", icon: Mail, desc: "RFC 2822 header spoofing & brand impersonation audit", code: "04", accent: "border-cyan-500/30 text-cyan-400" },
    { name: "URL Inspection", icon: Link2, desc: "Defanged domain anatomy & Shannon entropy scoring", code: "05", accent: "border-emerald-500/30 text-emerald-400" },
    { name: "Phone Reputation", icon: PhoneCall, desc: "E.164 normalization & transparent carrier verification", code: "06", accent: "border-rose-500/30 text-rose-400" },
  ];

  return (
    <div className="relative py-12 md:py-16 border-b border-[#1e294b] overflow-hidden bg-[#070a13]">
      {/* Background Subtle Gradient & Radar Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e294b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-600/15 border border-blue-500/30 text-blue-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>Cyber-Forensic Command Center • Sentinel Enterprise v3.0</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white font-sans">
            Multimodal Impersonation & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">Fraud Risk Analyzer</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
            Investigate suspicious communications across six independent modalities. Powered by transparent 
            weighted late-fusion, explainable acoustic waveforms, chat tactic highlighters, defanged URL dissection, and grounded safety guidance.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onLaunch}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold font-mono text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/25 active:scale-95"
            >
              <span>Launch Evidence Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-[#0d1326] border border-[#1e294b] text-slate-300 text-xs font-mono">
              <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>Zero-Storage Retention • Guest Mode Active</span>
            </div>
          </div>
        </div>

        {/* 6 Modality Feature Grid */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {modalities.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className="enterprise-card p-3.5 rounded-xl border border-[#1e294b] hover:border-blue-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`w-8 h-8 rounded-lg bg-[#070a13] border ${m.accent} flex items-center justify-center mb-2.5 shadow-sm`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold font-mono text-white mb-1">{m.name}</h3>
                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-3">{m.desc}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#1e294b]/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Modality {m.code}</span>
                  <span className="text-blue-400 font-semibold">Ready</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
