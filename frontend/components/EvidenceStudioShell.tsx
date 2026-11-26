"use client";

import React, { useState } from "react";
import { Mic, MessageSquare, MessagesSquare, Link2, PhoneCall, Sparkles, CheckCircle2, ShieldAlert, Play, RefreshCw, Trash2 } from "lucide-react";

export function EvidenceStudioShell() {
  const [activeModalities, setActiveModalities] = useState<{ [key: string]: boolean }>({
    voice: true,
    message: true,
    conversation: false,
    url: true,
    phone: false,
  });

  const [consentGiven, setConsentGiven] = useState(true);
  const [caseId, setCaseId] = useState<string>("case-demo-init");
  const [extracting, setExtracting] = useState(false);
  const [extractedLinks, setExtractedLinks] = useState<string[]>([]);
  const [extractedPhones, setExtractedPhones] = useState<string[]>([]);

  const toggleModality = (key: string) => {
    setActiveModalities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const loadPreset = (preset: "bank" | "family" | "benign") => {
    if (preset === "bank") {
      setActiveModalities({ voice: true, message: true, conversation: false, url: true, phone: false });
      setExtractedLinks(["hxxp://secure-hbl[.]phish[.]pk/verify"]);
      setExtractedPhones(["+923001234567"]);
    } else if (preset === "family") {
      setActiveModalities({ voice: false, message: false, conversation: true, url: false, phone: true });
      setExtractedLinks([]);
      setExtractedPhones(["+923219876543"]);
    } else {
      setActiveModalities({ voice: false, message: true, conversation: false, url: true, phone: false });
      setExtractedLinks(["hxxps://www[.]meezanbank[.]com"]);
      setExtractedPhones([]);
    }
  };

  return (
    <section id="evidence-studio" className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-forensic-border gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold font-mono text-white">Unified Evidence Studio</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">Case Dock</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Activate one or more evidence modalities. Smart cross-modality extraction auto-populates embedded links and phone numbers.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500">Preset Demos:</span>
          <button
            onClick={() => loadPreset("bank")}
            className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-mono transition-colors"
          >
            [DEMO] Bank Scam
          </button>
          <button
            onClick={() => loadPreset("family")}
            className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 font-mono transition-colors"
          >
            [DEMO] Family Emergency
          </button>
          <button
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
      {(extractedLinks.length > 0 || extractedPhones.length > 0) && (
        <div className="mb-6 p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span className="text-xs text-cyan-200 font-mono">Smart Extraction Discovered Embedded Entities:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {extractedLinks.map((l, i) => (
              <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-600/40">
                URL: {l}
              </span>
            ))}
            {extractedPhones.map((p, i) => (
              <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-600/40">
                Phone: {p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Active Modality Input Cards Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voice Card */}
        {activeModalities.voice && (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mic className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold font-mono text-white">Voice Recording Analysis</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">16kHz Acoustic</span>
            </div>
            <div className="border-2 border-dashed border-slate-800 rounded-xl p-6 text-center hover:border-cyan-500/40 transition-colors">
              <p className="text-xs text-slate-300 font-mono">Drag & drop telephony voice recording (.wav, .mp3)</p>
              <p className="text-[11px] text-slate-500 mt-1">Sample rate auto-resampled to 16kHz mono • 1-180 seconds</p>
              <div className="mt-4 flex items-center justify-center space-x-2">
                <span className="text-xs px-3 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  [DEMO] spam_test_001_Bank_OTP_Scam.wav
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Message Card */}
        {activeModalities.message && (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold font-mono text-white">Message Text Analysis</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">Roman Urdu & English</span>
            </div>
            <textarea
              rows={4}
              defaultValue="Apka HBL account blocked hai biometric na hone ki waja se. Fori is link per click kr k update krain: http://secure-hbl.phish.pk/verify"
              className="w-full text-xs font-mono p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500/60"
            />
          </div>
        )}

        {/* Conversation Card */}
        {activeModalities.conversation && (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessagesSquare className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold font-mono text-white">Multi-Turn Conversation</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">Tactic Tagger</span>
            </div>
            <textarea
              rows={4}
              defaultValue={"Caller: Your son is in police custody. Send PKR 50,000 immediately.\nUser: Is he safe?\nCaller: Pay right now or he will be locked up!"}
              className="w-full text-xs font-mono p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500/60"
            />
          </div>
        )}

        {/* URL Card */}
        {activeModalities.url && (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Link2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold font-mono text-white">Safe Defanged URL Inspector</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Zero Outbound Fetch</span>
            </div>
            <input
              type="text"
              defaultValue="hxxp://secure-hbl[.]phish[.]pk/verify"
              className="w-full text-xs font-mono p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 focus:outline-none focus:border-cyan-500/60"
            />
          </div>
        )}

        {/* Phone Card */}
        {activeModalities.phone && (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <PhoneCall className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold font-mono text-white">Phone Number Verification</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">E.164 Metadata</span>
            </div>
            <input
              type="text"
              defaultValue="+92 300 1234567"
              className="w-full text-xs font-mono p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500/60"
            />
          </div>
        )}
      </div>

      {/* Consent & Submission Bar */}
      <div className="mt-8 p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
          disabled={!consentGiven}
          className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold font-mono text-xs hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Execute Multimodal Analysis</span>
        </button>
      </div>
    </section>
  );
}
