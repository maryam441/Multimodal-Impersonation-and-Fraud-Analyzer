const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface CaseResponse {
  case_id: string;
  client_token: string;
  status: string;
  created_at: string;
  expires_at: string;
  active_modalities: string[];
}

export interface ExtractionResponse {
  extracted_urls: Array<{
    raw_url: string;
    defanged_url: string;
    domain: string;
    span: [number, number];
  }>;
  extracted_phones: Array<{
    raw_number: string;
    normalized_e164?: string;
    country_code?: string;
    carrier_guess?: string;
    span: [number, number];
  }>;
  urls_count: number;
  phones_count: number;
}

export interface EvidenceSignal {
  code: string;
  category: string;
  description: string;
  evidence: string;
  severity: "low" | "medium" | "high" | "critical";
  span?: {
    start: number;
    end: number;
    text_snippet?: string;
    timestamp_start_sec?: number;
    timestamp_end_sec?: number;
  };
}

export interface ModalityResultItem {
  modality: "voice" | "message" | "conversation" | "url" | "phone";
  status: "analyzed" | "inconclusive" | "failed" | "insufficient_data";
  risk_score: number | null;
  risk_label: "low" | "medium" | "high" | "inconclusive" | null;
  confidence: number | null;
  signals: EvidenceSignal[];
  metrics: Record<string, any>;
  model: Record<string, string>;
  limitations: string[];
  processing_ms: number;
}

export interface FusionAssessment {
  fused_score: number | null;
  risk_category: "low" | "medium" | "high" | "inconclusive";
  status: string;
  confidence: number;
  confidence_interval: [number, number];
  active_modalities: string[];
  missing_modalities: string[];
  missing_policy: string;
  rationale: string;
  weights_used: Record<string, number>;
  ablation_comparison: Record<string, {
    score_without_modality: number | null;
    delta: number;
    relative_contribution: number;
  }>;
  cross_modality_divergence: boolean;
  flags: string[];
}

export interface ForensicReportResponse {
  case_id: string;
  status: string;
  created_at: string;
  expires_at: string;
  fusion_assessment: FusionAssessment;
  modality_results: ModalityResultItem[];
}

export interface AssistantResponse {
  case_id: string;
  fused_score: number | null;
  risk_category: string;
  explanation: string;
  remedial_actions: string[];
  citations: string[];
  is_grounded: boolean;
  deterministic_assurance: string;
  generated_at: string;
}

export async function createCase(retentionHours = 24): Promise<CaseResponse> {
  const res = await fetch(`${API_BASE}/cases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ retention_hours: retentionHours }),
  });
  if (!res.ok) throw new Error("Failed to create case");
  return res.json();
}

export async function extractEntities(caseId: string, text: string): Promise<ExtractionResponse> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Failed to extract entities");
  return res.json();
}

export async function purgeCase(caseId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/cases/${caseId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to purge case");
}

export async function analyzePhone(caseId: string, phoneNumber: string, countryCode = "PK"): Promise<ModalityResultItem> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/phone`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number: phoneNumber, country_code: countryCode }),
  });
  if (!res.ok) throw new Error("Failed to analyze phone number");
  return res.json();
}

export async function analyzeMessage(caseId: string, text: string): Promise<ModalityResultItem> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Failed to analyze message");
  return res.json();
}

export async function analyzeUrl(caseId: string, url: string): Promise<ModalityResultItem> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error("Failed to analyze URL");
  return res.json();
}

export async function analyzeConversation(caseId: string, rawText: string): Promise<ModalityResultItem> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/conversation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ raw_text: rawText }),
  });
  if (!res.ok) throw new Error("Failed to analyze conversation");
  return res.json();
}

export async function analyzeVoice(caseId: string, file?: File, preset = "sample_audio.wav"): Promise<ModalityResultItem> {
  const formData = new FormData();
  if (file) {
    formData.append("file", file);
  } else {
    formData.append("preset_file", preset);
  }
  const res = await fetch(`${API_BASE}/cases/${caseId}/voice`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to analyze voice audio");
  return res.json();
}

export async function getForensicReport(caseId: string): Promise<ForensicReportResponse> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/report`);
  if (!res.ok) throw new Error("Failed to retrieve forensic report");
  return res.json();
}

export async function querySafetyAssistant(caseId: string, query?: string): Promise<AssistantResponse> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/assistant/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error("Failed to query safety assistant");
  return res.json();
}

export async function exportCaseDossier(caseId: string): Promise<{ case_id: string; sha256_digest: string; dossier: any; status: string }> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/actions/export-dossier`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to export case dossier");
  return res.json();
}

export async function dispatchFiaReport(caseId: string, userConfirmed: boolean, notes?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/actions/report-fia`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_confirmed: userConfirmed, investigator_notes: notes }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to dispatch FIA report");
  }
  return res.json();
}

export interface AmbientScanHistoryItem {
  id: string;
  case_id: string;
  source: string;
  sender_info: string;
  preview_snippet: string;
  risk_score: number;
  is_threat: boolean;
  threat_tags: string[];
  target_phone?: string;
  target_url?: string;
  created_at: string;
}

export interface FiaIncidentItem {
  id: string;
  reference_no: string;
  case_id: string;
  accused_identifier: string;
  platform_source: string;
  risk_score: number;
  risk_category: string;
  statutory_sections: string[];
  sha256_digest: string;
  status: string;
  created_at: string;
}

export async function getAmbientScanHistory(): Promise<AmbientScanHistoryItem[]> {
  const res = await fetch(`${API_BASE}/ambient/history`);
  if (!res.ok) return [];
  return res.json();
}

export async function listFiaIncidents(): Promise<FiaIncidentItem[]> {
  const res = await fetch(`${API_BASE}/incidents`);
  if (!res.ok) return [];
  return res.json();
}

export async function directReportFia(payload: {
  case_id: string;
  user_confirmed: boolean;
  operator_notes?: string;
  source: string;
  accused_identifier?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/incidents/direct-report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to submit FIA report");
  }
  return res.json();
}

export function getFiaDownloadUrl(referenceNo: string): string {
  return `${API_BASE}/incidents/${referenceNo}/download`;
}
