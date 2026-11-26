"use client";

import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, AlertTriangle } from "lucide-react";

interface WaveformProps {
  audioUrl?: string;
  duration?: number;
  onDurationCalculated?: (dur: number) => void;
}

export function WaveformVisualizer({ audioUrl = "/audio/spam_test_001_Bank_OTP_Scam.wav", duration: defaultDuration = 10.6, onDurationCalculated }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(defaultDuration);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // 48 synthetic waveform amplitude bars for visualization
  const bars = useRef<number[]>(
    Array.from({ length: 48 }, (_, i) => {
      const base = Math.sin(i * 0.22) * 0.35 + 0.45;
      const noise = (Math.random() - 0.5) * 0.25;
      return Math.max(0.12, Math.min(0.95, base + noise));
    })
  ).current;

  // Initialize and synchronize HTML5 Audio Element
  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.preload = "metadata";

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
        setDuration(audio.duration);
        if (onDurationCalculated) onDurationCalculated(audio.duration);
      }
      setAudioError(null);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      console.warn("Audio load error on:", audioUrl);
      setAudioError("Audio playback error. Click Play to test synthesized waveform audio.");
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [audioUrl, onDurationCalculated]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
        setAudioError(null);
      } catch (err: any) {
        console.warn("HTML5 audio playback blocked or file missing, generating audible synthetic tone:", err);
        // Web Audio API Fallback: Synthesize speech-like telephony tone directly through speakers!
        playSyntheticTelephonyTone();
      }
    }
  };

  const playSyntheticTelephonyTone = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime); // 220Hz speech-range tone
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1.0);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 2.5);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 3.0);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 3.0);

      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 3000);
    } catch (e) {
      console.error("Web Audio failed:", e);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (fraction: number) => {
    const target = fraction * duration;
    setCurrentTime(target);
    if (audioRef.current) {
      audioRef.current.currentTime = target;
    }
  };

  // Render Waveform Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const barWidth = width / bars.length;
    const safeDuration = duration > 0 ? duration : 1.0;
    const progressIndex = Math.floor((currentTime / safeDuration) * bars.length);

    bars.forEach((val, idx) => {
      const barHeight = val * (height - 10);
      const x = idx * barWidth;
      const y = (height - barHeight) / 2;

      // Color active scrubbed bars vs remaining bars
      if (idx <= progressIndex) {
        // Red anomaly segment between bars 22 and 34
        ctx.fillStyle = idx >= 22 && idx <= 34 ? "#ef4444" : "#06b6d4";
      } else {
        ctx.fillStyle = "#334155";
      }

      ctx.beginPath();
      ctx.roundRect(x + 1, y, Math.max(2, barWidth - 2), barHeight, 2);
      ctx.fill();
    });
  }, [currentTime, duration, bars]);

  return (
    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center space-x-2">
          <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-300">Acoustic Audio Player (16 kHz PCM)</span>
        </div>
        <span className="text-cyan-400">
          {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
        </span>
      </div>

      {/* Waveform Canvas */}
      <div className="relative h-16 w-full flex items-center justify-center bg-slate-900/80 rounded-lg p-1.5 border border-slate-800/80">
        <canvas
          ref={canvasRef}
          width={480}
          height={64}
          className="w-full h-full cursor-pointer"
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const fraction = Math.max(0, Math.min(1, clickX / rect.width));
            handleSeek(fraction);
          }}
        />
        {/* Anomaly zone indicator badge */}
        <div className="absolute top-1.5 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono bg-rose-950/70 border border-rose-800/50 text-rose-300 flex items-center space-x-1 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span>Anomaly Zone Highlighted</span>
        </div>
      </div>

      {/* Player Controls Bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={togglePlay}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-md active:scale-95"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Audio</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        <span className="text-[10px] font-mono text-slate-500">
          Click waveform to scrub audio
        </span>
      </div>

      {audioError && (
        <div className="text-[10px] font-mono text-amber-400 flex items-center space-x-1 pt-1">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          <span>{audioError}</span>
        </div>
      )}
    </div>
  );
}
