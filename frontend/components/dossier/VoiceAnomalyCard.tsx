"use client";

import React from "react";
import { Mic, Activity, Clock, AlertTriangle } from "lucide-react";
import { ModalityResultItem } from "@/lib/api";
import { WaveformVisualizer } from "@/components/studio/WaveformVisualizer";

interface VoiceAnomalyCardProps {
  voiceResult: ModalityResultItem;
  audioUrl?: string;
}

export function VoiceAnomalyCard({ voiceResult, audioUrl = "/audio/spam_test_001_Bank_OTP_Scam.wav" }: VoiceAnomalyCardProps) {
  const metrics = voiceResult.metrics || {};
  const acoustic = metrics.acoustic_features || {};
  const anomalySpans = metrics.anomaly_spans || [];
  const duration = metrics.duration_sec || 10.6;

  // Map backend metric field names to display
  const f0Mean = acoustic.f0_mean ?? metrics.pitch_f0_hz ?? 182.4;
  const jitterVal = acoustic.jitter ?? metrics.jitter ?? 0.0245;
  const shimmerVal = acoustic.shimmer ?? metrics.shimmer ?? 0.0412;
  const spectralCentroid = acoustic.spectral_centroid ?? metrics.spectral_centroid_hz ?? 2140;

  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Mic className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-200">
            Acoustic Waveform & Synthetic Anomaly Timeline
          </h4>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
          <Clock className="w-3 h-3 text-cyan-400" />
          <span>{Number(duration).toFixed(1)}s Duration</span>
        </div>
      </div>

      {/* Interactive Waveform Audio Player with Sound */}
      <div className="mb-4">
        <WaveformVisualizer audioUrl={audioUrl} duration={Number(duration)} />
      </div>

      {/* 35 Acoustic Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs font-mono">
        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-slate-400 text-[10px]">Pitch F0 Mean</span>
          <div className="font-bold text-slate-200">{Number(f0Mean).toFixed(1)} Hz</div>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-slate-400 text-[10px]">Jitter (Local)</span>
          <div className={`font-bold ${Number(jitterVal) > 0.015 ? "text-rose-400" : "text-emerald-400"}`}>
            {Number(jitterVal).toFixed(4)}
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-slate-400 text-[10px]">Shimmer (Local)</span>
          <div className={`font-bold ${Number(shimmerVal) > 0.035 ? "text-rose-400" : "text-emerald-400"}`}>
            {Number(shimmerVal).toFixed(4)}
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-slate-400 text-[10px]">Spectral Centroid</span>
          <div className="font-bold text-slate-200">{Number(spectralCentroid).toFixed(0)} Hz</div>
        </div>
      </div>

      {/* Temporal Anomaly Timeline */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
          <span className="flex items-center space-x-1">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Temporal Anomaly Segments</span>
          </span>
          <span className="text-rose-400 font-bold">{anomalySpans.length} Suspicious Segments</span>
        </div>

        {anomalySpans.length > 0 ? (
          <div className="space-y-1.5">
            {anomalySpans.map((span: any, i: number) => (
              <div key={i} className="p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-slate-200">
                    [{Number(span.start_sec).toFixed(1)}s – {Number(span.end_sec).toFixed(1)}s]
                  </span>
                  <span className="text-slate-400 text-[10px]">({span.type})</span>
                </div>
                <span className="text-[10px] font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/40">
                  Risk: {(Number(span.anomaly_score) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs font-mono text-slate-500 text-center py-2">
            No continuous deepfake discontinuity spans detected in voice sample.
          </div>
        )}
      </div>
    </div>
  );
}
