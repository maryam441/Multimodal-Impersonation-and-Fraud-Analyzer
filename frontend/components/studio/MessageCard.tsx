"use client";

import React, { useState } from "react";
import { MessageSquare, Sparkles } from "lucide-react";

interface MessageCardProps {
  value?: string;
  onTextChange?: (text: string) => void;
  onDetectEntities?: (url?: string, phone?: string) => void;
}

export function MessageCard({ value, onTextChange, onDetectEntities }: MessageCardProps) {
  const [text, setText] = useState<string>(
    value || "Apka HBL account blocked hai biometric na hone ki waja se. Fori is link per click kr k update krain: http://secure-hbl.phish.pk/verify ya helpline 0300-1234567 pr rabta krain."
  );

  React.useEffect(() => {
    if (value !== undefined) setText(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    if (onTextChange) onTextChange(val);

    // Instant client-side entity extraction preview
    const urlMatch = val.match(/https?:\/\/[^\s]+/i);
    const phoneMatch = val.match(/(?:\+?92\s*|0)?3\d{2}[\s-]?\d{7}/);
    if (onDetectEntities && (urlMatch || phoneMatch)) {
      onDetectEntities(urlMatch ? urlMatch[0] : undefined, phoneMatch ? phoneMatch[0] : undefined);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold font-mono text-white">Single Message Modality</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
          Roman Urdu & English
        </span>
      </div>

      <textarea
        rows={4}
        value={text}
        onChange={handleChange}
        placeholder="Paste suspicious SMS, WhatsApp message, or bank notice..."
        className="w-full text-xs font-mono p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500/60 leading-relaxed"
      />

      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span className="flex items-center space-x-1 text-cyan-400">
          <Sparkles className="w-3 h-3" />
          <span>Smart entity auto-detection enabled</span>
        </span>
        <span>{text.length} chars</span>
      </div>
    </div>
  );
}
