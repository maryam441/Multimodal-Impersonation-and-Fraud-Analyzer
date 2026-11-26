"use client";

import React from "react";
import { Mic, MessageSquare, MessagesSquare, Globe, Phone, Network, AlertCircle } from "lucide-react";
import { FusionAssessment, ModalityResultItem } from "@/lib/api";

interface FusionConstellationProps {
  assessment: FusionAssessment;
  modalityResults: ModalityResultItem[];
}

export function FusionConstellation({ assessment, modalityResults }: FusionConstellationProps) {
  const allModalities = [
    { id: "voice", label: "Voice Acoustic", icon: Mic },
    { id: "message", label: "Message NLP", icon: MessageSquare },
    { id: "conversation", label: "Multi-Turn Thread", icon: MessagesSquare },
    { id: "url", label: "URL Anatomy", icon: Globe },
    { id: "phone", label: "Phone Identifier", icon: Phone },
  ];

  return (
    <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Network className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-slate-200">
            Multimodal Fusion Constellation
          </h3>
        </div>
        <span className="text-[11px] font-mono text-cyan-400/80 px-2.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
          Late Fusion Engine v1.0
        </span>
      </div>

      {/* Active vs Neutral Policy Notice */}
      <div className="mb-4 text-xs font-mono text-slate-400 flex items-center space-x-2">
        <AlertCircle className="w-4 h-4 text-teal-400 shrink-0" />
        <span>{assessment.missing_policy}</span>
      </div>

      {/* Constellation Grid of 5 Modalities */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 my-auto">
        {allModalities.map(mod => {
          const result = modalityResults.find(r => r.modality === mod.id);
          const isActive = assessment.active_modalities.includes(mod.id);
          const isScored = result && result.status === "analyzed" && result.risk_score !== null;
          const isInsufficient = result && result.status === "insufficient_data";
          const weight = assessment.weights_used[mod.id];
          const ablation = assessment.ablation_comparison[mod.id];

          const IconComponent = mod.icon;

          return (
            <div
              key={mod.id}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                isScored
                  ? (result.risk_score || 0) >= 61
                    ? "border-rose-500/50 bg-rose-950/20"
                    : (result.risk_score || 0) >= 31
                    ? "border-amber-500/50 bg-amber-950/20"
                    : "border-emerald-500/50 bg-emerald-950/20"
                  : isInsufficient
                  ? "border-amber-500/30 bg-slate-900/40"
                  : "border-dashed border-slate-800 bg-slate-950/40 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <IconComponent className={`w-4 h-4 ${isScored ? "text-cyan-400" : isInsufficient ? "text-amber-400" : "text-slate-600"}`} />
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300">
                  {isScored ? "Active" : isInsufficient ? "Unverified" : "Omitted"}
                </span>
              </div>

              <div>
                <div className="text-xs font-medium text-slate-200">{mod.label}</div>
                <div className="text-lg font-bold font-mono my-1">
                  {isScored ? (
                    <span className={
                      (result.risk_score || 0) >= 61
                        ? "text-rose-400"
                        : (result.risk_score || 0) >= 31
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }>
                      {Math.round(result.risk_score || 0)}
                      <span className="text-xs font-normal text-slate-400">/100</span>
                    </span>
                  ) : isInsufficient ? (
                    <span className="text-amber-400 text-xs">Insufficient Data</span>
                  ) : (
                    <span className="text-slate-600 text-xs font-normal">Neutral</span>
                  )}
                </div>
              </div>

              {/* Weight & Ablation Delta */}
              <div className="mt-2 pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-400 flex flex-col space-y-0.5">
                <div>Weight: {weight ? `${(weight * 100).toFixed(0)}%` : "0% (Excl.)"}</div>
                {ablation && ablation.delta !== 0 && (
                  <div className="text-cyan-400/90">
                    Ablation: {ablation.delta > 0 ? `+${ablation.delta}` : ablation.delta} pts
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cross-Modality Divergence Warning */}
      {assessment.cross_modality_divergence && (
        <div className="mt-4 p-2.5 rounded-lg border border-rose-500/40 bg-rose-950/30 text-rose-300 text-xs font-mono flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>
            <strong>CROSS_MODALITY_DIVERGENCE:</strong> Significant conflict between modalities (e.g. synthetic voice paired with benign text). Classic synthetic impersonation pattern.
          </span>
        </div>
      )}
    </div>
  );
}
