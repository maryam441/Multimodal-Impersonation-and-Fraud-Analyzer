"use client";

import React, { useState, useEffect } from "react";
import { Download, Smartphone, X, Check, ShieldAlert } from "lucide-react";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [instructionOpen, setInstructionOpen] = useState<boolean>(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed as PWA)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    const handleCustomTrigger = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === "accepted") {
            setShowPrompt(false);
          }
          setDeferredPrompt(null);
        });
      } else {
        setInstructionOpen(true);
      }
    };

    window.addEventListener("trigger-pwa-install", handleCustomTrigger);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("trigger-pwa-install", handleCustomTrigger);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else {
      setInstructionOpen(true);
    }
  };

  if (isInstalled) return null;

  return (
    <>
      {/* Floating Bottom Install Banner for Mobile */}
      {showPrompt && !instructionOpen && (
        <div className="fixed bottom-14 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 z-50 animate-fade-in-up">
          <div className="p-3.5 rounded-xl bg-[#0d1326]/95 border border-[#1e294b] shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-sans">Install AegisAI Android App</h4>
                <p className="text-[11px] text-slate-300">Add to your Home Screen for real-time mobile protection</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold shadow-md shadow-blue-600/30 transition-all shrink-0"
              >
                Install
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Installation Instructions Modal (for Android Chrome / iOS Safari) */}
      {instructionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up">
          <div className="w-full max-w-sm rounded-2xl bg-[#0d1326] border border-[#1e294b] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e294b]">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white font-mono">Install on Mobile / Android</h3>
              </div>
              <button
                onClick={() => setInstructionOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Install <strong>AegisAI Shield</strong> directly onto your phone as a native app with zero store downloads required:
            </p>

            <div className="space-y-2.5 text-xs text-slate-300 font-sans">
              <div className="p-2.5 rounded-lg bg-[#070a13] border border-[#1e294b] flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-mono text-[10px] shrink-0 font-bold">1</span>
                <div>
                  <strong className="text-white">Android (Chrome):</strong> Tap the three dots menu (<span className="font-mono text-blue-400">⋮</span>) at the top-right of your browser.
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#070a13] border border-[#1e294b] flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-mono text-[10px] shrink-0 font-bold">2</span>
                <div>
                  Tap <span className="font-semibold text-white">"Install app"</span> or <span className="font-semibold text-white">"Add to Home screen"</span>.
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#070a13] border border-[#1e294b] flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-mono text-[10px] shrink-0 font-bold">3</span>
                <div>
                  Launch from your home screen like any native Android application with offline caching and standalone display.
                </div>
              </div>
            </div>

            <button
              onClick={() => setInstructionOpen(false)}
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold transition-all"
            >
              Got it, Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
