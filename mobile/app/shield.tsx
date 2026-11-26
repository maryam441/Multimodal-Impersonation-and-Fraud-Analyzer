import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import { streamClient, StreamAlert } from "../services/streamClient";
import { HeadsUpOverlay } from "../components/HeadsUpOverlay";

interface InterceptEvent {
  id: string;
  timestamp: string;
  channel: string;
  source: string;
  preview: string;
  status: "safe" | "flagged" | "blocked";
  riskScore: number;
}

export default function ShieldScreen() {
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [activeAlert, setActiveAlert] = useState<StreamAlert | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [events, setEvents] = useState<InterceptEvent[]>([
    {
      id: "evt-01",
      timestamp: "Just now",
      channel: "WhatsApp",
      source: "+92 300 1234567",
      preview: "Screening background chat message stream...",
      status: "safe",
      riskScore: 12,
    },
    {
      id: "evt-00",
      timestamp: "2 mins ago",
      channel: "Email",
      source: "service@hbl-bank.com.pk",
      preview: "Official monthly statement notification.",
      status: "safe",
      riskScore: 5,
    },
  ]);

  useEffect(() => {
    // Connect to backend stream
    streamClient.connect();

    const unsubscribeStatus = streamClient.onStatusChange((status) => {
      setConnectionStatus(status);
    });

    const unsubscribeAlert = streamClient.onAlert((alert) => {
      setActiveAlert(alert);
      // Append to intercept events
      setEvents((prev) => [
        {
          id: alert.alert_id,
          timestamp: "Just now",
          channel: alert.stream_type === "audio_chunk" ? "Voice Call" : "WhatsApp/SMS",
          source: alert.suspect_identifier || "Suspicious Sender",
          preview: alert.threat_summary,
          status: "blocked",
          riskScore: Math.round(alert.risk_score),
        },
        ...prev,
      ]);
    });

    return () => {
      unsubscribeStatus();
      unsubscribeAlert();
    };
  }, []);

  const handleSimulateThreat = async (type: "whatsapp_otp" | "voice_police_call" | "email_phish") => {
    setIsSimulating(true);
    try {
      const alert = await streamClient.simulateThreat(type);
      setActiveAlert(alert);
      setEvents((prev) => [
        {
          id: alert.alert_id,
          timestamp: "Just now",
          channel: type === "voice_police_call" ? "Voice Call" : type === "email_phish" ? "Email" : "WhatsApp",
          source: alert.suspect_identifier || "Adversary Source",
          preview: alert.threat_summary,
          status: "blocked",
          riskScore: Math.round(alert.risk_score),
        },
        ...prev,
      ]);
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Heads-Up Alert Overlay Component */}
      <HeadsUpOverlay
        alert={activeAlert}
        onDismiss={() => setActiveAlert(null)}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Top Status Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.replace("/")} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Settings</Text>
          </TouchableOpacity>
          <View style={styles.connectionBadge}>
            <View
              style={[
                styles.statusDot,
                connectionStatus === "connected" ? styles.statusDotGreen : styles.statusDotAmber,
              ]}
            />
            <Text style={styles.connectionText}>
              {connectionStatus === "connected" ? "REAL-TIME SHIELD ON" : "CONNECTING..."}
            </Text>
          </View>
        </View>

        {/* Shield Radar / Hero Status */}
        <View style={styles.radarCard}>
          <View style={styles.shieldIconContainer}>
            <View style={styles.shieldPulseRing} />
            <Text style={styles.shieldEmoji}>🛡️</Text>
          </View>

          <Text style={styles.radarTitle}>Sentinel Shield Active</Text>
          <Text style={styles.radarSubtitle}>
            Monitoring background notifications, SMS, incoming calls, and links in real time.
          </Text>

          {/* Quick telemetry pills */}
          <View style={styles.telemetryRow}>
            <View style={styles.telemetryPill}>
              <Text style={styles.telemetryNumber}>{events.length}</Text>
              <Text style={styles.telemetryLabel}>Intercepts</Text>
            </View>
            <View style={styles.telemetryPill}>
              <Text style={[styles.telemetryNumber, { color: "#ef4444" }]}>
                {events.filter((e) => e.status === "blocked").length}
              </Text>
              <Text style={styles.telemetryLabel}>Threats Blocked</Text>
            </View>
            <View style={styles.telemetryPill}>
              <Text style={[styles.telemetryNumber, { color: "#22c55e" }]}>100%</Text>
              <Text style={styles.telemetryLabel}>Privacy Kept</Text>
            </View>
          </View>
        </View>

        {/* Simulation Controls */}
        <Text style={styles.sectionTitle}>Test Real-Time Interception</Text>
        <Text style={styles.sectionSubtitle}>
          Trigger an ambient threat scenario to test the heads-up warning and FIA 1-tap gate.
        </Text>

        <View style={styles.simulationGrid}>
          <TouchableOpacity
            style={styles.simButton}
            onPress={() => handleSimulateThreat("whatsapp_otp")}
            disabled={isSimulating}
          >
            <Text style={styles.simButtonIcon}>💬</Text>
            <Text style={styles.simButtonTitle}>Simulate Bank OTP Scam</Text>
            <Text style={styles.simButtonDesc}>Fake WhatsApp urgency claiming blocked account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.simButton}
            onPress={() => handleSimulateThreat("voice_police_call")}
            disabled={isSimulating}
          >
            <Text style={styles.simButtonIcon}>📞</Text>
            <Text style={styles.simButtonTitle}>Simulate Police Deepfake Call</Text>
            <Text style={styles.simButtonDesc}>Cloned voice impersonating police officer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.simButton}
            onPress={() => handleSimulateThreat("email_phish")}
            disabled={isSimulating}
          >
            <Text style={styles.simButtonIcon}>✉️</Text>
            <Text style={styles.simButtonTitle}>Simulate Phishing Email</Text>
            <Text style={styles.simButtonDesc}>Spoofed brand email with credential harvester</Text>
          </TouchableOpacity>
        </View>

        {isSimulating && (
          <View style={styles.simulatingIndicator}>
            <ActivityIndicator color="#38bdf8" />
            <Text style={styles.simulatingText}>Streaming threat to Sentinel Core...</Text>
          </View>
        )}

        {/* Live Intercept Stream Feed */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Live Intercept Stream</Text>

        <View style={styles.feedList}>
          {events.map((evt) => (
            <View key={evt.id} style={styles.eventItem}>
              <View style={styles.eventHeader}>
                <View style={styles.channelBadge}>
                  <Text style={styles.channelText}>{evt.channel}</Text>
                </View>
                <Text style={styles.eventTime}>{evt.timestamp}</Text>
              </View>

              <Text style={styles.eventSource}>{evt.source}</Text>
              <Text style={styles.eventPreview}>{evt.preview}</Text>

              <View style={styles.eventFooter}>
                <View
                  style={[
                    styles.statusBadge,
                    evt.status === "blocked" ? styles.statusBadgeRed : styles.statusBadgeGreen,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      evt.status === "blocked" ? styles.statusRedText : styles.statusGreenText,
                    ]}
                  >
                    {evt.status === "blocked" ? `THREAT FLAGGED (${evt.riskScore}%)` : "CLEAN"}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#030712",
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#0f172a",
    borderRadius: 8,
  },
  backButtonText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
  },
  connectionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#064e3b",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#059669",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusDotGreen: {
    backgroundColor: "#34d399",
  },
  statusDotAmber: {
    backgroundColor: "#fbbf24",
  },
  connectionText: {
    color: "#a7f3d0",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  radarCard: {
    backgroundColor: "#090d16",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  shieldIconContainer: {
    position: "relative",
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  shieldPulseRing: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(14, 165, 233, 0.15)",
    borderWidth: 1.5,
    borderColor: "#0284c7",
  },
  shieldEmoji: {
    fontSize: 32,
  },
  radarTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  radarSubtitle: {
    color: "#94a3b8",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  telemetryRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    paddingTop: 14,
  },
  telemetryPill: {
    alignItems: "center",
  },
  telemetryNumber: {
    color: "#38bdf8",
    fontSize: 18,
    fontWeight: "800",
  },
  telemetryLabel: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 2,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 12,
  },
  simulationGrid: {
    gap: 10,
  },
  simButton: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 10,
    padding: 12,
  },
  simButtonIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  simButtonTitle: {
    color: "#f1f5f9",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  simButtonDesc: {
    color: "#64748b",
    fontSize: 11,
  },
  simulatingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    gap: 8,
  },
  simulatingText: {
    color: "#38bdf8",
    fontSize: 12,
  },
  feedList: {
    gap: 10,
  },
  eventItem: {
    backgroundColor: "#090d16",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  channelBadge: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  channelText: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "600",
  },
  eventTime: {
    color: "#64748b",
    fontSize: 10,
  },
  eventSource: {
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  eventPreview: {
    color: "#94a3b8",
    fontSize: 11,
    marginBottom: 8,
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeRed: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  statusBadgeGreen: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  statusRedText: {
    color: "#f87171",
  },
  statusGreenText: {
    color: "#4ade80",
  },
});
