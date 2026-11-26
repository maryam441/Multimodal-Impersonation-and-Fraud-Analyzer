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
