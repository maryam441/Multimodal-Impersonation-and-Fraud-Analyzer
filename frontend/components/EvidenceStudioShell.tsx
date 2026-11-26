"use client";

import React, { useState } from "react";
import { Mic, MessageSquare, MessagesSquare, Link2, PhoneCall, Sparkles, ShieldAlert, Play, CheckCircle2, ArrowRight } from "lucide-react";
import { VoiceCard } from "./studio/VoiceCard";
import { MessageCard } from "./studio/MessageCard";
import { ConversationCard } from "./studio/ConversationCard";
import { URLCard } from "./studio/URLCard";
import { PhoneCard } from "./studio/PhoneCard";

export function EvidenceStudioShell() {
  const [activeModalities, setActiveModalities] = useState<{ [key: string]: boolean }>({
    voice: true,
    message: true,
    conversation: false,
    url: true,
    phone: false,
  });

  const [consentGiven, setConsentGiven] = useState(true);
  const [extractedURL, setExtractedURL] = useState<string | null>("http://secure-hbl.phish.pk/verify");
  const [extractedPhone, setExtractedPhone] = useState<string | null>("0300-1234567");

  const toggleModality = (key: string) => {
    setActiveModalities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const loadPreset = (preset: "bank" | "family" | "benign") => {
    if (preset === "bank") {
      setActiveModalities({ voice: true, message: true, conversation: false, url: true, phone: false });
      setExtractedURL("http://secure-hbl.phish.pk/verify");
      setExtractedPhone("0300-1234567");
    } else if (preset === "family") {
      setActiveModalities({ voice: false, message: false, conversation: true, url: false, phone: true });
      setExtractedURL(null);
      setExtractedPhone("+92 321 9876543");
    } else {
      setActiveModalities({ voice: false, message: true, conversation: false, url: true, phone: false });
      setExtractedURL("https://www.meezanbank.com");
      setExtractedPhone(null);
    }
  };

  const handleEntityDetection = (url?: string, phone?: string) => {
    if (url) setExtractedURL(url);
    if (phone) setExtractedPhone(phone);
  };

  const applyExtractedEntity = (type: "url" | "phone") => {
    if (type === "url") {
      setActiveModalities(prev => ({ ...prev, url: true }));
    } else {
      setActiveModalities(prev => ({ ...prev, phone: true }));
    }
  };

  const activeCount = Object.values(activeModalities).filter(Boolean).length;

  return (
    <section id="evidence-studio" className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-forensic-border gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold font-mono text-white">Unified Evidence Studio</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
              Active: {activeCount}/5 Modalities
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Activate one or more evidence modalities. Smart cross-modality extraction auto-populates embedded links and numbers.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500">Preset Demos:</span>
          <button
            type="button"
            onClick={() => loadPreset("bank")}
            className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-mono transition-colors"
          >
            [DEMO] Bank Scam
          </button>
          <button
            type="button"
            onClick={() => loadPreset("family")}
            className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 font-mono transition-colors"
          >
            [DEMO] Family Emergency
          </button>
          <button
            type="button"
            onClick={() => loadPreset("benign")}
            className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 font-mono transition-colors"
          >
            [DEMO] Legitimate Bank
          </button>
        </div>
      </div>

      {/* Modality Toggles Bar */}
      <div className="my-6 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {[
          { id: "voice", label: "Voice Audio", icon: Mic },
          { id: "message", label: "Single Message", icon: MessageSquare },
          { id: "conversation", label: "Multi-Turn Chat", icon: MessagesSquare },
          { id: "url", label: "Phishing URL", icon: Link2 },
          { id: "phone", label: "Phone Number", icon: PhoneCall },
        ].map(item => {
          const Icon = item.icon;
          const active = activeModalities[item.id];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleModality(item.id)}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                active
                  ? "bg-slate-900 border-cyan-500/60 shadow-md shadow-cyan-950/40 text-white"
                  : "bg-slate-950/60 border-slate-800 text-slate-500 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${active ? "text-cyan-400" : "text-slate-600"}`} />
                <span className="text-xs font-mono font-semibold">{item.label}</span>
              </div>
              <span className={`w-2 h-2 rounded-full ${active ? "bg-cyan-400" : "bg-slate-700"}`} />
            </button>
          );
        })}
      </div>

      {/* Smart Cross-Modality Extraction Chip Banner */}
      {(extractedURL || extractedPhone) && (
        <div className="mb-6 p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 animate-pulse" />
            <span className="text-xs text-cyan-200 font-mono">
              Smart Extraction Discovered Embedded Entities in Message Text:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {extractedURL && (
              <button
                type="button"
                onClick={() => applyExtractedEntity("url")}
                className="inline-flex items-center space-x-1.5 text-xs font-mono px-3 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-colors"
              >
                <span>⚡ Populate URL:</span>
                <span className="underline max-w-[150px] truncate">{extractedURL}</span>
              </button>
            )}
            {extractedPhone && (
              <button
                type="button"
                onClick={() => applyExtractedEntity("phone")}
                className="inline-flex items-center space-x-1.5 text-xs font-mono px-3 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition-colors"
              >
                <span>⚡ Populate Phone:</span>
                <span>{extractedPhone}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active Modality Input Cards Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeModalities.voice && <VoiceCard />}
        {activeModalities.message && <MessageCard onDetectEntities={handleEntityDetection} />}
        {activeModalities.conversation && <ConversationCard />}
        {activeModalities.url && <URLCard initialURL={extractedURL || undefined} />}
        {activeModalities.phone && <PhoneCard initialPhone={extractedPhone || undefined} />}
      </div>

      {/* Unprovided Modality Indicator Bar (Missingness Neutrality) */}
      <div className="mt-6 p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
        <span>Missing Modality Policy:</span>
        <span>
          {5 - activeCount > 0
            ? `${5 - activeCount} unprovided modalities are treated as Neutral (Never imputed as zero risk)`
            : "All 5 modalities active"}
        </span>
      </div>

      {/* Consent & Submission Bar */}
      <div className="mt-6 p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <label className="flex items-center space-x-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={consentGiven}
            onChange={e => setConsentGiven(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
          />
          <span className="text-xs text-slate-300">
            I consent to ephemeral analysis of submitted evidence under the zero-retention privacy charter.
          </span>
        </label>

        <button
          type="button"
          disabled={!consentGiven || activeCount === 0}
          className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold font-mono text-xs hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Execute Multimodal Analysis ({activeCount})</span>
        </button>
      </div>
    </section>
  );
}
