import React from "react";
import { ShieldAlert, Cpu } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-forensic-border bg-[#070a10] py-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p>
            <strong className="text-slate-300">Decision-Support Disclaimer:</strong> This system is strictly an investigative aid. 
            It never claims 100% certainty, legal verification, or definitive guilt.
          </p>
        </div>
        <div className="flex items-center space-x-4 font-mono text-[11px] text-slate-500">
          <span>SRS v3.0 Certified</span>
          <span>•</span>
          <span>5-Modality Late Fusion</span>
          <span>•</span>
          <span>PTA & Global Guardrails</span>
        </div>
      </div>
    </footer>
  );
}
