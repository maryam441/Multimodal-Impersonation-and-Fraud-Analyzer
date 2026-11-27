"use client";

import React, { useState, useEffect } from "react";
import { Shield, Radio, FileText, Download, CheckCircle, Smartphone } from "lucide-react";

export function MobileNavBar() {
  const [activeTab, setActiveTab] = useState<"studio" | "shield" | "fia" | "install">("studio");

  const scrollTo = (id: string, tab: "studio" | "shield" | "fia") => {
    setActiveTab(tab);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleInstallClick = () => {
    setActiveTab("install");
    const event = new CustomEvent("trigger-pwa-install");
    window.dispatchEvent(event);
  };

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#070a13]/95 backdrop-blur-xl border-t border-[#1e294b] px-2 py-1.5 shadow-2xl">
      <div className="grid grid-cols-4 items-center text-center">
        <button
          onClick={() => scrollTo("evidence-studio", "studio")}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === "studio" ? "text-blue-400 font-semibold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <Shield className="w-5 h-5" />
            {activeTab === "studio" && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            )}
          </div>
          <span className="text-[10px] mt-1 font-mono">Studio</span>
        </button>

        <button
          onClick={() => scrollTo("ambient-shield", "shield")}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === "shield" ? "text-blue-400 font-semibold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <Radio className="w-5 h-5 text-emerald-400" />
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className="text-[10px] mt-1 font-mono">Shield</span>
        </button>

        <button
          onClick={() => scrollTo("ambient-shield", "fia")}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === "fia" ? "text-blue-400 font-semibold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-mono">FIA Portal</span>
        </button>

        <button
          onClick={handleInstallClick}
          className={`flex flex-col items-center justify-center py-1 transition-colors ${
            activeTab === "install" ? "text-blue-400 font-semibold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Smartphone className="w-5 h-5 text-indigo-400" />
          <span className="text-[10px] mt-1 font-mono">Install App</span>
        </button>
      </div>
    </nav>
  );
}
