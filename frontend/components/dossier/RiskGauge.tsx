"use client";

import React from "react";
import { ShieldAlert, ShieldCheck, Shield, HelpCircle } from "lucide-react";

interface RiskGaugeProps {
  score: number | null;
  category: "low" | "medium" | "high" | "inconclusive";
  confidence: number;
  confidenceInterval?: [number, number];
}

export function RiskGauge({ score, category, confidence, confidenceInterval }: RiskGaugeProps) {
  const isScoreValid = score !== null && category !== "inconclusive";
  const displayScore = isScoreValid ? score : 0;

  // Calibrated SVG needle/arc calculations
  // Angle: -90deg (0 score) to +90deg (100 score) -> 180 degree semi-circle
  const rotation = isScoreValid ? -90 + (displayScore / 100) * 180 : -90;

  const getStatusColor = () => {
    switch (category) {
      case "low":
        return {
          text: "text-emerald-400",
          border: "border-emerald-500/40",
          bg: "bg-emerald-950/40",
          glow: "from-emerald-500/20",
          stroke: "#10b981",
        };
      case "medium":
        return {
          text: "text-amber-400",
          border: "border-amber-500/40",
          bg: "bg-amber-950/40",
          glow: "from-amber-500/20",
          stroke: "#f59e0b",
        };
      case "high":
        return {
          text: "text-rose-400",
          border: "border-rose-500/40",
          bg: "bg-rose-950/40",
          glow: "from-rose-500/20",
          stroke: "#f43f5e",
        };
      default:
        return {
          text: "text-slate-400",
          border: "border-slate-700",
          bg: "bg-slate-900/60",
          glow: "from-slate-700/20",
          stroke: "#64748b",
        };
    }
  };

  const style = getStatusColor();

  return (
    <div className={`p-6 rounded-2xl border ${style.border} ${style.bg} relative overflow-hidden flex flex-col items-center justify-center text-center shadow-2xl backdrop-blur-xl`}>
      {/* Background radial glow */}
      <div className={`absolute -top-12 inset-x-0 h-32 bg-gradient-to-b ${style.glow} to-transparent pointer-events-none blur-2xl`} />

      <div className="flex items-center space-x-2 mb-2 z-10">
        {category === "high" && <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />}
        {category === "medium" && <Shield className="w-5 h-5 text-amber-400" />}
        {category === "low" && <ShieldCheck className="w-5 h-5 text-emerald-400" />}
        {category === "inconclusive" && <HelpCircle className="w-5 h-5 text-slate-400" />}
        <span className="text-xs font-mono tracking-widest uppercase font-semibold text-slate-300">
          Composite Forensic Risk
        </span>
      </div>

      {/* Semi-Circle SVG Meter */}
      <div className="relative w-56 h-28 my-2 flex items-end justify-center">
        <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
          {/* Base Background Track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#1e293b"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Active Calibrated Arc */}
          {isScoreValid && (
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={style.stroke}
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (251.2 * (displayScore / 100))}
              className="transition-all duration-1000 ease-out"
            />
          )}
          {/* Needle Center Pin */}
          <circle cx="100" cy="100" r="6" fill="#f8fafc" />
          {/* Needle Pointer */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="30"
            stroke="#f8fafc"
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${rotation} 100 100)`}
            className="transition-transform duration-1000 ease-out origin-bottom"
          />
        </svg>

        {/* Big Score Readout */}
        <div className="absolute -bottom-2 flex flex-col items-center">
          <div className={`text-4xl font-extrabold font-mono tracking-tight ${style.text}`}>
            {isScoreValid ? Math.round(displayScore) : "--"}
            <span className="text-sm font-sans text-slate-400 font-normal">/100</span>
          </div>
        </div>
      </div>

      {/* Category Badge & Boundaries */}
      <div className="mt-4 flex flex-col items-center space-y-1.5 z-10">
        <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${style.border} ${style.bg} ${style.text}`}>
          {category === "inconclusive" ? "Inconclusive Risk" : `${category} Risk Level`}
        </div>

        {/* Confidence & Interval */}
        <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-2">
          <span>Certainty: {(confidence * 100).toFixed(0)}%</span>
          {confidenceInterval && isScoreValid && (
            <span>
              CI: [{confidenceInterval[0].toFixed(0)} – {confidenceInterval[1].toFixed(0)}]
            </span>
          )}
        </div>
      </div>

      {/* Boundary Legend */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 w-full flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span className="text-emerald-400">0–30 Low</span>
        <span className="text-amber-400">31–60 Med</span>
        <span className="text-rose-400">61–100 High</span>
      </div>
    </div>
  );
}
