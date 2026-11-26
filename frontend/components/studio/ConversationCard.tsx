"use client";

import React, { useState } from "react";
import { MessagesSquare, Plus, Trash2 } from "lucide-react";

interface Turn {
  speaker: "Caller" | "User";
  text: string;
}

interface ConversationCardProps {
  value?: string;
  onTextChange?: (text: string) => void;
}

export function ConversationCard({ value, onTextChange }: ConversationCardProps = {}) {
  const [turns, setTurns] = useState<Turn[]>([
    { speaker: "Caller", text: "Officer Tariq from Police HQ. Your son has been detained in a severe accident." },
    { speaker: "User", text: "Is he okay? Where are you taking him?" },
    { speaker: "Caller", text: "Transfer PKR 50,000 via EasyPaisa to this number within 10 minutes or we register the FIR!" },
  ]);

  const [rawMode, setRawMode] = useState(false);
  const [rawText, setRawText] = useState(
    value || "Caller: Officer Tariq from Police HQ. Your son has been detained.\nUser: Is he okay?\nCaller: Transfer PKR 50,000 immediately or we register the FIR!"
  );

  React.useEffect(() => {
    if (value !== undefined) {
      setRawText(value);
    }
  }, [value]);

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <MessagesSquare className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold font-mono text-white">Multi-Turn Conversation</h3>
        </div>
        <button
          type="button"
          onClick={() => setRawMode(!rawMode)}
          className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:text-white"
        >
          {rawMode ? "Switch to Bubble View" : "Switch to Raw Paste"}
        </button>
      </div>

      {rawMode ? (
        <textarea
          rows={5}
          value={rawText}
          onChange={e => {
            setRawText(e.target.value);
            if (onTextChange) onTextChange(e.target.value);
          }}
          placeholder="Paste conversation (e.g., Sender: ... / Me: ...)"
          className="w-full text-xs font-mono p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500/60"
        />
      ) : (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {turns.map((turn, i) => (
            <div
              key={i}
              className={`p-2.5 rounded-xl text-xs font-mono border ${
                turn.speaker === "Caller"
                  ? "bg-purple-950/30 border-purple-800/40 text-purple-200"
                  : "bg-slate-950 border-slate-800 text-slate-300 ml-4"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                <span className="font-bold text-slate-400">{turn.speaker}</span>
                <span>Turn 0{i + 1}</span>
              </div>
              <p className="leading-snug">{turn.text}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
        <span>Turn-by-turn social-engineering escalation analysis</span>
        <span>{turns.length} turns</span>
      </div>
    </div>
  );
}
