"use client";

import React, { useState } from "react";
import { Bot, Send, ShieldAlert, BookOpen, CheckCircle, Sparkles } from "lucide-react";
import { AssistantResponse, querySafetyAssistant } from "@/lib/api";

interface GroundedAssistantDrawerProps {
  caseId: string;
  initialAssistantData?: AssistantResponse | null;
}

export function GroundedAssistantDrawer({ caseId, initialAssistantData }: GroundedAssistantDrawerProps) {
  const [data, setData] = useState<AssistantResponse | null>(initialAssistantData || null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (customQuery?: string) => {
    const q = customQuery !== undefined ? customQuery : query;
    if (!q.trim() && !customQuery) return;
    setLoading(true);
    try {
      const res = await querySafetyAssistant(caseId, q);
      setData(res);
      setQuery("");
    } catch (e) {
      console.error("Failed to query safety assistant:", e);
    } finally {
      setLoading(false);
    }
  };

  const presetQuestions = [
    "What should I do about the OTP request?",
    "How do I report this number to PTA?",
    "Is this a legitimate banking notice?",
  ];

  return (
    <div className="h-full flex flex-col p-5 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl">
      {/* Drawer Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-200">
              Grounded AI Safety Assistant
            </h4>
            <span className="text-[10px] font-mono text-cyan-400/80 flex items-center space-x-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Grounded RAG Decision Support</span>
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
          Zero Hallucination
        </span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs font-mono">
        {data ? (
          <>
            {/* Explanation Narrative */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-300 leading-relaxed whitespace-pre-line">
              {data.explanation}
            </div>

            {/* Regulatory Citations */}
            {data.citations && data.citations.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center space-x-1.5 text-cyan-400 mb-2 font-bold text-[11px] uppercase">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Verified Regulatory Citations</span>
                </div>
                <ul className="space-y-1 text-[11px] text-slate-400">
                  {data.citations.map((c, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-cyan-400">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Remedial Checklist */}
            {data.remedial_actions && data.remedial_actions.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center space-x-1.5 text-emerald-400 mb-2 font-bold text-[11px] uppercase">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Immediate Incident Response Protocol</span>
                </div>
                <ul className="space-y-2 text-[11px] text-slate-300">
                  {data.remedial_actions.map((act, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="shrink-0 w-4 h-4 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center text-[10px] font-bold">
                        {i + 1}
                      </span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 text-center py-8">
            <Bot className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p>Ready to explain deterministic forensic signals and provide official regulatory mitigation guidance.</p>
          </div>
        )}
      </div>

      {/* Preset Chips */}
      <div className="pt-3 border-t border-slate-800/80">
        <div className="text-[10px] font-mono text-slate-500 uppercase mb-1.5">Suggested Inquiries:</div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {presetQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[10px] font-mono transition-colors text-left"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Ask safety assistant for guidance..."
            className="flex-1 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !query.trim()}
            className="p-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-40 transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
