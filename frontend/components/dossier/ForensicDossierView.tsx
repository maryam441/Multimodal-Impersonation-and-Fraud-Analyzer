"use client";

import React, { useState } from "react";
import { Download, Send, RotateCcw, ShieldCheck, Check, AlertCircle } from "lucide-react";
import { ForensicReportResponse, exportCaseDossier, dispatchFiaReport } from "@/lib/api";
import { RiskGauge } from "./RiskGauge";
import { FusionConstellation } from "./FusionConstellation";
import { UrlAnatomyCard } from "./UrlAnatomyCard";
import { ChatReplay } from "./ChatReplay";
import { VoiceAnomalyCard } from "./VoiceAnomalyCard";
import { EmailAnalysisCard } from "./EmailAnalysisCard";
import { GroundedAssistantDrawer } from "./GroundedAssistantDrawer";
import { HumanGateModal } from "./HumanGateModal";

interface ForensicDossierViewProps {
  report: ForensicReportResponse;
  onReset: () => void;
}

export function ForensicDossierView({ report, onReset }: ForensicDossierViewProps) {
  const [modalAction, setModalAction] = useState<"export" | "fia" | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const { fusion_assessment, modality_results, case_id } = report;

  const urlResult = modality_results.find(m => m.modality === "url");
  const conversationResult = modality_results.find(m => m.modality === "conversation");
  const voiceResult = modality_results.find(m => m.modality === "voice");
  const messageResult = modality_results.find(m => m.modality === "message");
  const phoneResult = modality_results.find(m => m.modality === "phone");
  const emailResult = modality_results.find(m => m.modality === "email");

  const handleConfirmAction = async (notes?: string) => {
    if (modalAction === "export") {
      const res = await exportCaseDossier(case_id);
      setActionSuccess(`Dossier sealed with SHA-256 digest: ${res.sha256_digest.slice(0, 16)}...`);
    } else if (modalAction === "fia") {
      await dispatchFiaReport(case_id, true, notes);
      setActionSuccess("Formal incident complaint dispatched to FIA Cyber Crime Wing queue.");
    }
    setTimeout(() => setActionSuccess(null), 5000);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Dossier Top Bar */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-sm font-mono uppercase font-bold text-slate-100 tracking-wider">
              Forensic Intelligence Dossier
            </h2>
            <span className="text-[11px] font-mono text-slate-500">
              ID: {case_id.slice(0, 8)}...
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic late-fusion evaluation with grounded regulatory decision support.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setModalAction("export")}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Dossier</span>
          </button>

          <button
            onClick={() => setModalAction("fia")}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-mono transition-colors border border-rose-800/60"
          >
            <Send className="w-3.5 h-3.5 text-rose-400" />
            <span>Report to FIA</span>
          </button>

          <button
            onClick={onReset}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono transition-colors"
            title="Start new analysis"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionSuccess && (
        <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 text-xs font-mono flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Primary Dashboard Grid: Left Explainability / Right Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Master Metrics & Modality Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Row: Risk Gauge & Fusion Constellation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-1">
              <RiskGauge
                score={fusion_assessment.fused_score}
                category={fusion_assessment.risk_category}
                confidence={fusion_assessment.confidence}
                confidenceInterval={fusion_assessment.confidence_interval}
              />
            </div>
            <div className="sm:col-span-2">
              <FusionConstellation
                assessment={fusion_assessment}
                modalityResults={modality_results}
              />
            </div>
          </div>

          {/* Modality Specific Explainability Cards */}
          {emailResult && emailResult.status === "analyzed" && (
            <EmailAnalysisCard emailResult={emailResult} />
          )}

          {urlResult && urlResult.status === "analyzed" && (
            <UrlAnatomyCard urlResult={urlResult} />
          )}

          {conversationResult && conversationResult.status === "analyzed" && (
            <ChatReplay conversationResult={conversationResult} />
          )}

          {voiceResult && voiceResult.status === "analyzed" && (
            <VoiceAnomalyCard voiceResult={voiceResult} />
          )}

          {/* Single Message Card Summary if present */}
          {messageResult && messageResult.status === "analyzed" && (
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800 text-xs font-mono">
                <span className="font-bold text-slate-200 uppercase">Single Message Phrase Attribution</span>
                <span className="text-cyan-400">Score: {messageResult.risk_score}/100</span>
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                {messageResult.signals.map((sig, i) => (
                  <div key={i} className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-rose-300 font-bold">{sig.code}</span>
                    <span className="text-slate-400">{sig.evidence}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phone Modality Card */}
          {phoneResult && (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-xs font-mono flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">Phone Caller Resolution</span>
                <span className="font-bold text-slate-200">
                  {phoneResult.metrics.normalized_e164 || phoneResult.metrics.raw || "N/A"}
                </span>
                <span className="text-slate-400 ml-2">({phoneResult.metrics.carrier || "Unverified"})</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                phoneResult.status === "insufficient_data" ? "bg-amber-950/60 text-amber-400 border border-amber-800/40" : "bg-rose-950/60 text-rose-400"
              }`}>
                {phoneResult.status === "insufficient_data" ? "insufficient_data" : "analyzed"}
              </span>
            </div>
          )}
        </div>

        {/* Right 1 Col: Grounded Safety Assistant (RAG) */}
        <div className="lg:col-span-1">
          <GroundedAssistantDrawer caseId={case_id} />
        </div>
      </div>

      {/* Human Gate Modal Dialog */}
      {modalAction && (
        <HumanGateModal
          isOpen={true}
          actionType={modalAction}
          onClose={() => setModalAction(null)}
          onConfirm={handleConfirmAction}
        />
      )}
    </div>
  );
}
