"use client";

import React from "react";
import { Mic, MessageSquare, MessagesSquare, Link2, PhoneCall, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export function Hero({ onLaunch }: { onLaunch: () => void }) {
  const modalities = [
    { name: "Voice Analysis", icon: Mic, desc: "Acoustic MFCCs, jitter & deepfake vishing detection", color: "cyan" },
    { name: "Message Analysis", icon: MessageSquare, desc: "Roman Urdu & English single-text scam attribution", color: "amber" },
    { name: "Conversation Analysis", icon: MessagesSquare, desc: "Multi-turn urgency & authority manipulation tagging", color: "purple" },
    { name: "URL Analysis", icon: Link2, desc: "Safe defanged anatomy inspection & PhiUSIIL ML", color: "emerald" },
    { name: "Phone Reputation", icon: PhoneCall, desc: "E.164 normalization & transparent carrier metadata", color: "rose" },
  ];

  return (
    <div className="relative py-12 md:py-16 border-b border-forensic-border overflow-hidden bg-gradient-to-b from-[#0e1422] to-[#090d16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cyber-Forensic Command Center • Sentinel Core 3.0</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white font-sans">
            Multimodal Impersonation & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">Fraud Risk Analyzer</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
            Investigate suspicious communications across five independent modalities. Powered by transparent 
            weighted late-fusion, explainable acoustic waveforms, chat tactic highlighters, and grounded safety guidance.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onLaunch}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-semibold font-mono text-sm hover:from-cyan-400 hover:to-teal-400 transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <span>Launch Evidence Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Zero-Storage Retention • Guest Mode Active</span>
            </div>
          </div>
        </div>

        {/* 5 Modality Feature Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {modalities.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400 mb-2">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold font-mono text-white mb-1">{m.name}</h3>
                  <p className="text-[11px] text-slate-400 leading-snug">{m.desc}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Modality 0{idx + 1}</span>
                  <span className="text-cyan-400">Ready</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
