"use client";

import React, { useState } from "react";
import { PhoneCall, ShieldAlert, Check } from "lucide-react";

interface PhoneCardProps {
  initialPhone?: string;
  onPhoneChange?: (phone: string) => void;
}

export function PhoneCard({ initialPhone = "+92 300 1234567", onPhoneChange }: PhoneCardProps) {
  const [phone, setPhone] = useState(initialPhone);

  React.useEffect(() => {
    if (initialPhone) setPhone(initialPhone);
  }, [initialPhone]);

  const getCarrier = (p: string) => {
    if (p.includes("300") || p.includes("301") || p.includes("302")) return "Jazz / Mobilink (Pakistan)";
    if (p.includes("312") || p.includes("313") || p.includes("314")) return "Zong 4G (Pakistan)";
    if (p.includes("333") || p.includes("334") || p.includes("335")) return "Ufone (Pakistan)";
    if (p.includes("345") || p.includes("346")) return "Telenor (Pakistan)";
    return "E.164 International Line";
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <PhoneCall className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold font-mono text-white">Phone Reputation & Carrier Check</h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
          E.164 Standard
        </span>
      </div>

      <div>
        <label className="text-[11px] font-mono text-slate-400 block mb-1">Target Telephone Number</label>
        <input
          type="text"
          value={phone}
          onChange={e => {
            setPhone(e.target.value);
            if (onPhoneChange) onPhoneChange(e.target.value);
          }}
          className="w-full text-xs font-mono p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500/60"
        />
      </div>

      {/* Structural Metadata Badges */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs font-mono">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Carrier Identification:</span>
          <span className="text-rose-300 font-bold">{getCarrier(phone)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Format Validity:</span>
          <span className="text-emerald-400 flex items-center space-x-1">
            <Check className="w-3 h-3" />
            <span>Possible E.164 Mobile</span>
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
          <span>Reputation Adapter Status:</span>
          <span className="text-slate-400">Unverified Real Number (insufficient_data)</span>
        </div>
      </div>
    </div>
  );
}
