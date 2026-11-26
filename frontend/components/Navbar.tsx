"use client";

import React from "react";
import { ShieldCheck, Activity, Terminal, Lock } from "lucide-react";

export function Navbar() {
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
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">v3.0 Core</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans hidden sm:block">Multimodal Impersonation & Fraud Analyzer</p>
          </div>
        </div>

        <nav className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">API Online</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-mono">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Zero-Retention Vault</span>
          </div>
        </nav>
      </div>
    </header>
  );
}
