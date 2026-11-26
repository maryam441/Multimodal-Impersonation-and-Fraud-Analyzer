"use client";

import React from "react";
import { ShieldCheck, Lock, Radio, MessageSquare } from "lucide-react";

export function Navbar() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-forensic-border bg-forensic-dark/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white tracking-wider text-sm font-mono">AEGIS·AI</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">v3.0 Ambient</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans hidden sm:block">Multimodal Impersonation & Fraud Analyzer</p>
          </div>
        </div>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center space-x-6 text-xs font-mono">
          <button
            onClick={() => scrollTo("evidence-studio")}
            className="text-slate-400 hover:text-cyan-400 transition-colors"
          >
            Forensic Studio
          </button>
          <button
            onClick={() => scrollTo("ambient-shield")}
            className="text-slate-400 hover:text-rose-400 transition-colors flex items-center space-x-1"
          >
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Ambient Shield & FIA</span>
          </button>
        </div>

        <nav className="flex items-center space-x-3">
          <button
            onClick={() => scrollTo("ambient-shield")}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono hover:bg-emerald-500/20 transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Shield Active</span>
          </button>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-mono hidden sm:flex">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>PECA 2016 Compliant</span>
          </div>
        </nav>
      </div>
    </header>
  );
}
