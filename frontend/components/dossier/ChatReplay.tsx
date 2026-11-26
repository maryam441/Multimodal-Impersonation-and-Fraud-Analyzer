"use client";

import React from "react";
import { MessagesSquare, Flame, AlertCircle } from "lucide-react";
import { ModalityResultItem } from "@/lib/api";

interface ChatReplayProps {
  conversationResult: ModalityResultItem;
}

export function ChatReplay({ conversationResult }: ChatReplayProps) {
  const metrics = conversationResult.metrics || {};
  const turns = metrics.turns || [];
  const velocity = metrics.escalation_velocity || 0;
  const tactics = conversationResult.signals || [];

  const getTacticBadge = (code: string) => {
    switch (code) {
      case "AUTHORITY_IMPERSONATION":
        return "bg-rose-950/80 text-rose-300 border-rose-800/60";
      case "OTP_CREDENTIAL_SOLICITATION":
        return "bg-red-950/80 text-red-300 border-red-800/60";
      case "FINANCIAL_TRANSFER_DEMAND":
        return "bg-amber-950/80 text-amber-300 border-amber-800/60";
      case "ARTIFICIAL_URGENCY":
        return "bg-orange-950/80 text-orange-300 border-orange-800/60";
      case "PLATFORM_MIGRATION":
        return "bg-purple-950/80 text-purple-300 border-purple-800/60";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <MessagesSquare className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-200">
            Annotated Multi-Turn Dialogue Replay
          </h4>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
            <Flame className={`w-3 h-3 ${velocity >= 0.5 ? "text-rose-400 animate-pulse" : "text-amber-400"}`} />
            <span>Escalation: {(velocity * 100).toFixed(0)}%</span>
          </span>
          <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
            {turns.length} Turns
          </span>
        </div>
      </div>

      {/* Replay Dialogue Sequence */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {turns.length > 0 ? (
          turns.map((t: any, idx: number) => {
            const isCaller = t.speaker?.toLowerCase().includes("caller") || t.speaker?.toLowerCase().includes("support") || t.speaker?.toLowerCase().includes("officer");
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex flex-col space-y-1.5 ${
                  isCaller
                    ? "bg-slate-950/90 border-slate-800 ml-0 mr-6"
                    : "bg-slate-900 border-slate-800/80 ml-6 mr-0"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className={`font-bold ${isCaller ? "text-rose-400" : "text-cyan-400"}`}>
                    Turn {idx + 1} • {t.speaker}
                  </span>
                  {t.timestamp && <span className="text-slate-500">{t.timestamp}</span>}
                </div>

                <div className="text-xs font-mono text-slate-300 leading-relaxed">
                  {t.text}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-xs font-mono text-slate-500 text-center py-6">
            Multi-turn transcript parsed from conversation input.
          </div>
        )}
      </div>

      {/* Detected Social Engineering Tactics Breakdown */}
      {tactics.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide block mb-2">
            Identified Social-Engineering Tactical Spans:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {tactics.map((sig, i) => (
              <span
                key={i}
                className={`px-2 py-0.5 rounded text-[11px] font-mono border font-medium ${getTacticBadge(sig.code)}`}
                title={sig.description}
              >
                {sig.code}: &quot;{sig.evidence}&quot;
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
