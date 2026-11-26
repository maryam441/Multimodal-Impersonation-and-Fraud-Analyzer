/**
 * Sentinel Mobile Shield - Real-Time Streaming Client
 * Connects to FastAPI WebSocket (/api/v1/stream/live) for live ambient fraud interception.
 */

export interface StreamAlert {
  alert_id: string;
  timestamp: string;
  stream_type: "text_chunk" | "audio_chunk" | "composite";
  risk_score: number;
  risk_category: "low" | "medium" | "high";
  threat_summary: string;
  reasons: string[];
  signals: Array<{ name: string; score: number; weight: number }>;
  case_id: string;
  suspect_identifier?: string;
  recommended_actions: string[];
}

export interface FiaReportResult {
  status: string;
  tracking_id: string;
  sha256_seal: string;
  peca_sections: string[];
  reported_at: string;
}

export class StreamClient {
  private ws: WebSocket | null = null;
  private backendWsUrl: string;
  private backendHttpUrl: string;
  private alertCallbacks: Array<(alert: StreamAlert) => void> = [];
  private statusCallbacks: Array<(status: string) => void> = [];
  private isConnected: boolean = false;
  private reconnectInterval: any = null;

  constructor(
    wsUrl = "ws://10.0.2.2:8000/api/v1/stream/live", // Default Android emulator host
    httpUrl = "http://10.0.2.2:8000/api/v1"
  ) {
    // In React Native web or local testing, fallback to localhost if 10.0.2.2 is not reachable
    if (typeof window !== "undefined" && window.location?.hostname === "localhost") {
      this.backendWsUrl = "ws://localhost:8000/api/v1/stream/live";
      this.backendHttpUrl = "http://localhost:8000/api/v1";
    } else {
      this.backendWsUrl = wsUrl;
      this.backendHttpUrl = httpUrl;
    }
  }

  public connect(clientId = "mobile-shield-device-01"): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.notifyStatus("connecting");
      this.ws = new WebSocket(this.backendWsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.notifyStatus("connected");
        // Send Stream Init frame
        this.send({
          type: "STREAM_INIT",
          client_id: clientId,
          device_os: "android_ios_companion",
          active_modalities: ["message", "voice", "url", "email", "phone"]
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "STREAM_ALERT") {
            const alert: StreamAlert = {
              alert_id: data.alert_id,
              timestamp: data.timestamp,
              stream_type: data.stream_type || "text_chunk",
              risk_score: data.risk_score,
              risk_category: data.risk_category,
              threat_summary: data.threat_summary,
              reasons: data.reasons || [],
              signals: data.signals || [],
              case_id: data.case_id,
              suspect_identifier: data.suspect_identifier,
              recommended_actions: data.recommended_actions || []
            };
            this.alertCallbacks.forEach((cb) => cb(alert));
          } else if (data.type === "STREAM_STATUS") {
            this.notifyStatus(data.status);
          }
        } catch (err) {
          console.warn("[StreamClient] Failed to parse message:", err);
        }
      };

      this.ws.onerror = (err) => {
        console.warn("[StreamClient] WebSocket error:", err);
        this.notifyStatus("error");
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.notifyStatus("disconnected");
        // Retry connection after 5 seconds
        if (!this.reconnectInterval) {
          this.reconnectInterval = setTimeout(() => {
            this.reconnectInterval = null;
            this.connect(clientId);
          }, 5000);
        }
      };
    } catch (e) {
      console.error("[StreamClient] Connection exception:", e);
      this.notifyStatus("error");
    }
  }

  public disconnect(): void {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.notifyStatus("disconnected");
  }

  public onAlert(callback: (alert: StreamAlert) => void): () => void {
    this.alertCallbacks.push(callback);
    return () => {
      this.alertCallbacks = this.alertCallbacks.filter((cb) => cb !== callback);
    };
  }

  public onStatusChange(callback: (status: string) => void): () => void {
    this.statusCallbacks.push(callback);
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter((cb) => cb !== callback);
    };
  }

  private notifyStatus(status: string): void {
    this.statusCallbacks.forEach((cb) => cb(status));
  }

  public send(payload: any): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }

  public streamText(text: string, channel: "whatsapp" | "sms" | "email" = "whatsapp", sender = "+923001234567"): boolean {
    return this.send({
      type: "STREAM_DATA",
      stream_type: "text_chunk",
      channel,
      sender,
      timestamp: new Date().toISOString(),
      content: text
    });
  }

  /**
   * Dispatches human-approved evidence to FIA NR3C.
   * STRICT SAFETY GATE: user_confirmed MUST be true.
   */
  public async submitToFia(caseId: string, suspectIdentifier: string, notes: string): Promise<FiaReportResult> {
    const res = await fetch(`${this.backendHttpUrl}/fia/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        case_id: caseId,
        user_confirmed: true,
        incident_type: "financial_impersonation_scam",
        suspect_identifier: suspectIdentifier,
        investigator_notes: notes
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to submit FIA report");
    }

    return await res.json();
  }

  /**
   * Triggers test threat simulation on the backend
   */
  public async simulateThreat(threatType: "whatsapp_otp" | "voice_police_call" | "email_phish"): Promise<StreamAlert> {
    const res = await fetch(`${this.backendHttpUrl}/stream/simulate-threat?threat_type=${threatType}`, {
      method: "POST"
    });
    if (!res.ok) {
      throw new Error("Failed to trigger simulation");
    }
    const data = await res.json();
    return {
      alert_id: data.alert_id,
      timestamp: data.timestamp,
      stream_type: data.stream_type,
      risk_score: data.risk_score,
      risk_category: data.risk_category,
      threat_summary: data.threat_summary,
      reasons: data.reasons,
      signals: data.signals,
      case_id: data.case_id,
      suspect_identifier: data.suspect_identifier,
      recommended_actions: data.recommended_actions
    };
  }
}

export const streamClient = new StreamClient();
