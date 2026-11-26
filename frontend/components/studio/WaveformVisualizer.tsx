"use client";

import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, Info } from "lucide-react";

interface WaveformProps {
  audioUrl?: string;
  duration?: number;
  onDurationCalculated?: (dur: number) => void;
}

export function WaveformVisualizer({ audioUrl, duration = 10.6, onDurationCalculated }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Generate synthetic acoustic waveform bars
  const bars = useRef<number[]>(
    Array.from({ length: 48 }, (_, i) => {
      const base = Math.sin(i * 0.2) * 0.4 + 0.5;
      const noise = (Math.random() - 0.5) * 0.2;
      return Math.max(0.15, Math.min(1.0, base + noise));
    })
  ).current;

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const barWidth = width / bars.length;
    const progressIndex = Math.floor((currentTime / duration) * bars.length);

    bars.forEach((val, idx) => {
      const barHeight = val * (height - 8);
      const x = idx * barWidth;
      const y = (height - barHeight) / 2;

      // Color active scrubbed bars vs remaining bars
      if (idx <= progressIndex) {
        ctx.fillStyle = idx > 25 && idx < 38 ? "#ef4444" : "#06b6d4"; // Anomaly region highlighted in red
      } else {
        ctx.fillStyle = "#334155";
      }

      ctx.beginPath();
      ctx.roundRect(x + 1, y, Math.max(2, barWidth - 2), barHeight, 2);
      ctx.fill();
    });
  }, [currentTime, duration, bars]);

  return (
    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center space-x-2">
          <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Acoustic Waveform Preview (16 kHz PCM)</span>
        </div>
        <span>{currentTime.toFixed(1)}s / {duration.toFixed(1)}s</span>
      </div>

      <div className="relative h-16 w-full flex items-center justify-center bg-slate-900/60 rounded-lg p-1">
        <canvas
          ref={canvasRef}
          width={480}
          height={64}
          className="w-full h-full cursor-pointer"
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const fraction = clickX / rect.width;
            setCurrentTime(fraction * duration);
          }}
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono hover:bg-cyan-500/30 transition-colors"
        >
          {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
          <span>{isPlaying ? "Pause Scrub" : "Play Waveform"}</span>
        </button>

        <span className="text-[10px] font-mono text-slate-500">
          Red region: Potential acoustic perturbation anomaly
        </span>
      </div>
    </div>
  );
}
