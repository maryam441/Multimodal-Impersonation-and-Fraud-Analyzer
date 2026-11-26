"use client";

import React, { useState } from "react";
import { AlertTriangle, Lock, ShieldCheck, X } from "lucide-react";

interface HumanGateModalProps {
  isOpen: boolean;
  actionType: "export" | "fia";
  onClose: () => void;
  onConfirm: (notes?: string) => Promise<void>;
}

export function HumanGateModal({ isOpen, actionType, onClose, onConfirm }: HumanGateModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAction = async () => {
    if (!confirmed) return;
    setSubmitting(true);
    try {
      await onConfirm(notes);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const isFia = actionType === "fia";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg p-6 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-800/40 text-amber-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold uppercase text-slate-100">
              Human-in-the-Loop Safety Gate
            </h3>
            <p className="text-xs text-slate-400">
              {isFia
                ? "Formal Incident Dispatch Authorization (FIA Cyber Crime Wing)"
                : "Cryptographic Forensic Dossier Export (SHA-256 Seal)"}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed mb-4">
          {isFia ? (
            <p>
              <strong>Warning:</strong> You are preparing an official cybercrime report under PECA 2016 Sections 13 & 14. This action will generate a formal evidence package and log an immutable audit event with your investigator identity.
            </p>
          ) : (
            <p>
              Exporting this forensic dossier compiles all raw extracted features, acoustic spans, and fusion assessments into a sealed JSON artifact hashed with SHA-256 for chain-of-custody verification.
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
            Investigator Authorization Notes:
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Verified by Senior Forensic Investigator prior to dispatch"
            className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <label className="flex items-center space-x-2.5 mb-6 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={e => setConfirmed(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
          />
          <span className="text-xs font-mono text-slate-300 font-semibold">
            I explicitly confirm this consequential action as authorized operator.
          </span>
        </label>

        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!confirmed || submitting}
            onClick={handleAction}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-mono text-xs font-bold hover:from-cyan-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? "Processing..." : isFia ? "Dispatch Complaint" : "Seal & Export Dossier"}
          </button>
        </div>
      </div>
    </div>
  );
}
