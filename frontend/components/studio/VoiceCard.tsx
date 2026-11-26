"use client";

import React, { useState } from "react";
import { Mic, UploadCloud, FileAudio, CheckCircle2 } from "lucide-react";
import { WaveformVisualizer } from "./WaveformVisualizer";

interface VoiceCardProps {
  onAudioChange?: (fileName: string) => void;
}

export function VoiceCard({ onAudioChange }: VoiceCardProps) {
  const [selectedFile, setSelectedFile] = useState<string>("spam_test_001_Bank_OTP_Scam.wav");
  const [isDemo, setIsDemo] = useState(true);

  const selectDemo = (fileName: string) => {
    setSelectedFile(fileName);
    setIsDemo(true);
    if (onAudioChange) onAudioChange(fileName);
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Mic className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold font-mono text-white">Voice & Audio Modality</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          16 kHz Telephony
        </span>
      </div>

      {/* Waveform Renderer */}
      <WaveformVisualizer duration={10.65} />

      {/* Audio Sample Selector / Dropzone */}
      <div className="border border-slate-800 rounded-xl p-3 bg-slate-950/80 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center space-x-1.5 text-slate-300">
            <FileAudio className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate max-w-[200px]">{selectedFile}</span>
          </span>
          {isDemo && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              [DEMO FIXTURE]
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/60">
          <span className="text-[10px] font-mono text-slate-500">Preset Audio:</span>
          <button
            type="button"
            onClick={() => selectDemo("spam_test_001_Bank_OTP_Scam.wav")}
            className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
          >
            Bank OTP Call
          </button>
          <button
            type="button"
            onClick={() => selectDemo("spam_test_011_Lottery_Prize_Scam.wav")}
            className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700"
          >
            Lottery Prize Call
          </button>
          <button
            type="button"
            onClick={() => selectDemo("ham_test_001_Legitimate.wav")}
            className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700"
          >
            Legitimate Human
          </button>
        </div>
      </div>
    </div>
  );
}
