"use client";

import React, { useState } from "react";
import { Mic, MessageSquare, MessagesSquare, Link2, PhoneCall, Mail, Sparkles, Play, Loader2 } from "lucide-react";
import { VoiceCard } from "./studio/VoiceCard";
import { MessageCard } from "./studio/MessageCard";
import { ConversationCard } from "./studio/ConversationCard";
import { URLCard } from "./studio/URLCard";
import { PhoneCard } from "./studio/PhoneCard";
import { EmailCard } from "./studio/EmailCard";
import { ForensicDossierView } from "./dossier/ForensicDossierView";
import {
  createCase,
  analyzeVoice,
  analyzeMessage,
  analyzeConversation,
  analyzeUrl,
  analyzePhone,
  analyzeEmail,
  getForensicReport,
  ForensicReportResponse
} from "@/lib/api";

export function EvidenceStudioShell() {
  const [activeModalities, setActiveModalities] = useState<{ [key: string]: boolean }>({
    voice: true,
    message: true,
    conversation: false,
    url: true,
    phone: false,
    email: true,
  });

  // User input states across modalities
  const [messageText, setMessageText] = useState(
    "Apka HBL account blocked hai biometric na hone ki waja se. Fori is link per click kr k update krain: http://secure-hbl.phish.pk/verify ya helpline 0300-1234567 pr rabta krain."
  );
  const [urlText, setUrlText] = useState("http://secure-hbl.phish.pk/verify");
  const [phoneText, setPhoneText] = useState("0300-1234567");
  const [emailSender, setEmailSender] = useState("Habib Bank Security <security-alert@hbl-banking-notice.pk>");
  const [emailSubject, setEmailSubject] = useState("URGENT: Temporary suspension of your HBL digital banking");
  const [emailBody, setEmailBody] = useState(
    "Dear Valued Customer,\n\nWe noticed unauthorized login attempts. Your account has been temporarily restricted.\n\nPlease verify your biometric credentials immediately at our secure portal:\nhttp://hbl-update-security.com/login\n\nFailure to verify within 4 hours will lead to permanent card blocking."
  );
  const [conversationText, setConversationText] = useState(
    "[10:14] Officer: This is Sub-Inspector Farooq from FIA. Your account has an FIR.\n[10:15] Citizen: What FIR?\n[10:16] Officer: Settle Rs. 50,000 immediately via Easypaisa or face arrest."
  );
  const [voiceFile, setVoiceFile] = useState("spam_test_001_Bank_OTP_Scam.wav");

  const [consentGiven, setConsentGiven] = useState(true);
  const [extractedURL, setExtractedURL] = useState<string | null>("http://secure-hbl.phish.pk/verify");
  const [extractedPhone, setExtractedPhone] = useState<string | null>("0300-1234567");

  // State for analysis progress and dossier result
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState<string>("");
  const [dossierReport, setDossierReport] = useState<ForensicReportResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleModality = (key: string) => {
    setActiveModalities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const loadPreset = (preset: "bank" | "family" | "benign") => {
    if (preset === "bank") {
      setActiveModalities({ voice: true, message: true, conversation: false, url: true, phone: false });
      setMessageText("Apka HBL account blocked hai biometric na hone ki waja se. Fori is link per click kr k update krain: http://secure-hbl.phish.pk/verify ya helpline 0300-1234567 pr rabta krain.");
      setUrlText("http://secure-hbl.phish.pk/verify");
      setPhoneText("0300-1234567");
      setExtractedURL("http://secure-hbl.phish.pk/verify");
      setExtractedPhone("0300-1234567");
    } else if (preset === "family") {
      setActiveModalities({ voice: false, message: false, conversation: true, url: false, phone: true });
      setConversationText("[10:14] Officer: This is Sub-Inspector Farooq from FIA. Your account has an FIR.\n[10:15] Citizen: What FIR?\n[10:16] Officer: Settle Rs. 50,000 immediately via Easypaisa or face arrest.");
      setPhoneText("+92 321 9876543");
      setExtractedURL(null);
      setExtractedPhone("+92 321 9876543");
    } else {
      setActiveModalities({ voice: false, message: true, conversation: false, url: true, phone: false });
      setMessageText("Dear Customer, thank you for banking with Meezan Bank. Visit our official portal for secure online banking services.");
      setUrlText("https://www.meezanbank.com");
      setPhoneText("");
      setExtractedURL("https://www.meezanbank.com");
      setExtractedPhone(null);
    }
  };

  const handleEntityDetection = (url?: string, phone?: string) => {
    if (url) {
      setExtractedURL(url);
      setUrlText(url);
    }
    if (phone) {
      setExtractedPhone(phone);
      setPhoneText(phone);
    }
  };

  const applyExtractedEntity = (type: "url" | "phone") => {
    if (type === "url" && extractedURL) {
      setActiveModalities(prev => ({ ...prev, url: true }));
      setUrlText(extractedURL);
    } else if (type === "phone" && extractedPhone) {
      setActiveModalities(prev => ({ ...prev, phone: true }));
      setPhoneText(extractedPhone);
    }
  };

  const handleExecuteAnalysis = async () => {
    if (!consentGiven) return;
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      setAnalysisStage("Initializing ephemeral case container...");
      const caseObj = await createCase(24);
      const caseId = caseObj.case_id;

      const tasks: Promise<any>[] = [];

      if (activeModalities.voice) {
        setAnalysisStage("Extracting 35 acoustic metrics & deepfake spans...");
        tasks.push(analyzeVoice(caseId, undefined, voiceFile).catch(err => console.warn("Voice error", err)));
      }

      if (activeModalities.message) {
        setAnalysisStage("Tokenizing Roman Urdu & English phrase attributions...");
        tasks.push(analyzeMessage(caseId, messageText).catch(err => console.warn("Message error", err)));
      }

      if (activeModalities.conversation) {
        setAnalysisStage("Parsing multi-turn escalation velocity...");
        tasks.push(analyzeConversation(caseId, conversationText).catch(err => console.warn("Conversation error", err)));
      }

      if (activeModalities.url) {
        setAnalysisStage("Defanging URL and calculating Shannon entropy...");
        tasks.push(analyzeUrl(caseId, urlText).catch(err => console.warn("URL error", err)));
      }

      if (activeModalities.phone) {
        setAnalysisStage("Standardizing E.164 & resolving PTA carrier plan...");
        tasks.push(analyzePhone(caseId, phoneText).catch(err => console.warn("Phone error", err)));
      }

      if (activeModalities.email) {
        setAnalysisStage("Inspecting RFC 2822 header spoofing & brand alignment...");
        tasks.push(analyzeEmail(caseId, emailSender, emailSubject, emailBody).catch(err => console.warn("Email error", err)));
      }

      await Promise.all(tasks);

      setAnalysisStage("Evaluating transparent weighted late fusion...");
      const report = await getForensicReport(caseId);
      setDossierReport(report);
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setErrorMessage(err.message || "Failed to complete multimodal analysis. Please ensure backend is running.");
    } finally {
      setIsAnalyzing(false);
      setAnalysisStage("");
    }
  };

  const activeCount = Object.values(activeModalities).filter(Boolean).length;

  if (dossierReport) {
    return (
      <section id="evidence-dossier" className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ForensicDossierView report={dossierReport} onReset={() => setDossierReport(null)} />
      </section>
    );
  }

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
            Type or paste your suspicious message, link, phone number, or chat below. You can also select pre-configured benchmarks.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-400">Benchmarks:</span>
          <button
            type="button"
            onClick={() => loadPreset("bank")}
            className="px-2.5 py-1 text-xs rounded font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            Bank Scam
          </button>
          <button
            type="button"
            onClick={() => loadPreset("family")}
            className="px-2.5 py-1 text-xs rounded font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            Emergency Call
          </button>
          <button
            type="button"
            onClick={() => loadPreset("benign")}
            className="px-2.5 py-1 text-xs rounded font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            Clean Portal
          </button>
        </div>
      </div>

      {/* Modality Toggles Dock */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 my-6">
        {[
          { id: "voice", label: "Voice / Audio", icon: Mic },
          { id: "message", label: "Single Message", icon: MessageSquare },
          { id: "conversation", label: "Multi-Turn Chat", icon: MessagesSquare },
          { id: "email", label: "Email Modality", icon: Mail },
          { id: "url", label: "Suspicious URL", icon: Link2 },
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
        {activeModalities.voice && <VoiceCard onAudioChange={setVoiceFile} />}
        {activeModalities.message && (
          <MessageCard
            value={messageText}
            onTextChange={setMessageText}
            onDetectEntities={handleEntityDetection}
          />
        )}
        {activeModalities.conversation && (
          <ConversationCard
            value={conversationText}
            onTextChange={setConversationText}
          />
        )}
        {activeModalities.url && (
          <URLCard
            initialURL={urlText}
            onURLChange={setUrlText}
          />
        )}
        {activeModalities.email && (
          <EmailCard
            sender={emailSender}
            setSender={setEmailSender}
            subject={emailSubject}
            setSubject={setEmailSubject}
            body={emailBody}
            setBody={setEmailBody}
            isActive={activeModalities.email}
            onToggle={() => toggleModality("email")}
          />
        )}
        {activeModalities.phone && (
          <PhoneCard
            initialPhone={phoneText}
            onPhoneChange={setPhoneText}
          />
        )}
      </div>

      {/* Unprovided Modality Indicator Bar (Missingness Neutrality) */}
      <div className="mt-6 p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
        <span>Missing Modality Policy:</span>
        <span>
          {6 - activeCount > 0
            ? `${6 - activeCount} unprovided modalities are treated as Neutral (Never imputed as zero risk)`
            : "All 6 modalities active"}
        </span>
      </div>

      {/* Error message display if any */}
      {errorMessage && (
        <div className="mt-4 p-3 rounded-xl border border-rose-500/40 bg-rose-950/40 text-rose-300 text-xs font-mono">
          {errorMessage}
        </div>
      )}

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
          disabled={!consentGiven || activeCount === 0 || isAnalyzing}
          onClick={handleExecuteAnalysis}
          className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold font-mono text-xs hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 shrink-0"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{analysisStage || "Analyzing..."}</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Execute Multimodal Analysis ({activeCount})</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
