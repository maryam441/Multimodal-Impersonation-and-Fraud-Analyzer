"use client";

import React, { useState, useRef } from "react";
import { Mic, UploadCloud, FileAudio, CheckCircle2 } from "lucide-react";
import { WaveformVisualizer } from "./WaveformVisualizer";

interface VoiceCardProps {
  onAudioChange?: (fileName: string) => void;
}

export function VoiceCard({ onAudioChange }: VoiceCardProps) {
  const [selectedFile, setSelectedFile] = useState<string>("spam_test_001_Bank_OTP_Scam.wav");
  const [audioUrl, setAudioUrl] = useState<string>("/audio/spam_test_001_Bank_OTP_Scam.wav");
  const [isDemo, setIsDemo] = useState(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectDemo = (fileName: string, url: string) => {
    setSelectedFile(fileName);
    setAudioUrl(url);
    setIsDemo(true);
    if (onAudioChange) onAudioChange(fileName);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file.name);
    setAudioUrl(objectUrl);
    setIsDemo(false);
    if (onAudioChange) onAudioChange(file.name);
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

      {/* Waveform & Real Audio Player */}
      <WaveformVisualizer audioUrl={audioUrl} />

      {/* Audio Sample Selector & Custom Upload */}
      <div className="border border-slate-800 rounded-xl p-3 bg-slate-950/80 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center space-x-1.5 text-slate-300">
            <FileAudio className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate max-w-[220px] font-bold">{selectedFile}</span>
          </span>

          <div className="flex items-center space-x-2">
            {isDemo ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                [DATASET SAMPLE]
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                [USER UPLOAD]
              </span>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 transition-colors"
            >
              <UploadCloud className="w-3 h-3" />
              <span>Upload Custom .wav</span>
            </button>
          </div>
        </div>

        {/* Preset Selector Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/60">
          <span className="text-[10px] font-mono text-slate-500">Preset Samples:</span>
          <button
            type="button"
            onClick={() => selectDemo("spam_test_001_Bank_OTP_Scam.wav", "/audio/spam_test_001_Bank_OTP_Scam.wav")}
            className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
              selectedFile.includes("Bank_OTP")
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
            }`}
          >
            Bank OTP Scam
          </button>
          <button
            type="button"
            onClick={() => selectDemo("spam_test_011_Lottery_Prize_Scam.wav", "/audio/spam_test_011_Lottery_Prize_Scam.wav")}
            className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
              selectedFile.includes("Lottery_Prize")
                ? "bg-purple-500/20 text-purple-300 border-purple-500/50"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
            }`}
          >
            Lottery Prize Scam
          </button>
          <button
            type="button"
            onClick={() => selectDemo("ham_test_001_normal_call.wav", "/audio/ham_test_001_normal_call.wav")}
            className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
              selectedFile.includes("normal_call")
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
            }`}
          >
            Legitimate Human
          </button>
        </div>
      </div>
    </div>
  );
}
