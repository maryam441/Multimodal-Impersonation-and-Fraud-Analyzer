"use client";

import React, { useState } from "react";
import { Link2, ShieldCheck, AlertTriangle } from "lucide-react";
import { defangURL } from "@/lib/utils";

interface URLCardProps {
  initialURL?: string;
  onURLChange?: (url: string) => void;
}

export function URLCard({ initialURL = "http://secure-hbl.phish.pk/verify?token=8942", onURLChange }: URLCardProps) {
  const [url, setURL] = useState(initialURL);

  const defanged = defangURL(url);

  // Structural anatomy extraction
  const extractAnatomy = (u: string) => {
    try {
      const match = u.match(/^(https?|hxxps?):\/\/([^/?#]+)([^?#]*)(?:\?([^#]*))?/i);
      if (match) {
        return {
          protocol: match[1],
          host: match[2],
          path: match[3] || "/",
          query: match[4] || "",
        };
      }
    } catch {}
    return { protocol: "http", host: u, path: "/", query: "" };
  };

  const anatomy = extractAnatomy(url);

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Link2 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold font-mono text-white">Safe Defanged URL Inspector</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          Zero Live Outbound Fetch
        </span>
      </div>

      <div>
        <label className="text-[11px] font-mono text-slate-400 block mb-1">Raw Target URL</label>
        <input
          type="text"
          value={url}
          onChange={e => {
            setURL(e.target.value);
            if (onURLChange) onURLChange(e.target.value);
          }}
          className="w-full text-xs font-mono p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500/60"
        />
      </div>

      {/* Defanged Safe Display */}
      <div className="p-2.5 rounded-lg bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-500 text-[11px]">Safe Defanged Notation:</span>
        <span className="text-emerald-300 font-bold select-all">{defanged}</span>
      </div>

      {/* URL Anatomy Token X-Ray */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[10px] font-mono text-slate-500">Structural Anatomy Breakdown:</span>
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <span className="px-2 py-1 rounded bg-slate-800 text-cyan-300 border border-slate-700">
            proto: {anatomy.protocol}
          </span>
          <span className="px-2 py-1 rounded bg-slate-800 text-amber-300 border border-slate-700">
            host: {anatomy.host}
          </span>
          <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            path: {anatomy.path}
          </span>
          {anatomy.query && (
            <span className="px-2 py-1 rounded bg-slate-800 text-purple-300 border border-slate-700">
              query: ?{anatomy.query}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
