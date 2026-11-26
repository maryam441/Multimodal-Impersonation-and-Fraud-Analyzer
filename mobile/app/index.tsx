import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  SafeAreaView
} from "react-native";
import { useRouter } from "expo-router";

export default function OnboardingScreen() {
  const router = useRouter();

  const [notificationConsent, setNotificationConsent] = useState(true);
  const [smsEmailConsent, setSmsEmailConsent] = useState(true);
  const [callScreeningConsent, setCallScreeningConsent] = useState(false);

  const canProceed = notificationConsent || smsEmailConsent || callScreeningConsent;

  const handleActivateShield = () => {
    router.replace("/shield");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Branding */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>SENTINEL MOBILE SHIELD v4.0</Text>
          </View>
          <Text style={styles.title}>Real-Time Anti-Fraud & Deepfake Shield</Text>
          <Text style={styles.subtitle}>
            Continuous in-conversation protection across WhatsApp, SMS, Email, and incoming calls.
          </Text>
        </View>

        {/* Privacy First Banner */}
        <View style={styles.privacyCard}>
          <Text style={styles.privacyTitle}>Privacy-Preserving Edge Architecture</Text>
          <Text style={styles.privacyText}>
            Sentinel operates under strict zero-knowledge principles. Messages and voice snippets are
            analyzed for mathematical scam embeddings only and are never permanently stored or shared
            with third parties.
          </Text>
        </View>

        {/* Permissions / Shields Configuration */}
        <Text style={styles.sectionHeader}>Required Security Permissions</Text>

        {/* 1. Notification Listener */}
        <View style={styles.permissionCard}>
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionTitle}>WhatsApp & Chat Notifications</Text>
            <Text style={styles.permissionDesc}>
              Intercepts incoming WhatsApp, Telegram, and chat notifications to detect impersonation,
              urgent prize claims, and fake OTP demands mid-chat.
            </Text>
          </View>
          <Switch
            value={notificationConsent}
            onValueChange={setNotificationConsent}
            trackColor={{ false: "#334155", true: "#0284c7" }}
            thumbColor={notificationConsent ? "#38bdf8" : "#94a3b8"}
          />
        </View>

        {/* 2. SMS & Email Scammer Screen */}
        <View style={styles.permissionCard}>
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionTitle}>SMS & Email Phishing Filter</Text>
            <Text style={styles.permissionDesc}>
              Scans banking SMS alerts and email bodies for brand spoofing (e.g. fake HBL, Faysal, NADRA)
              and malicious defanged links.
            </Text>
          </View>
          <Switch
            value={smsEmailConsent}
            onValueChange={setSmsEmailConsent}
            trackColor={{ false: "#334155", true: "#0284c7" }}
            thumbColor={smsEmailConsent ? "#38bdf8" : "#94a3b8"}
          />
        </View>

        {/* 3. Call Screening & Acoustic Voice */}
        <View style={styles.permissionCard}>
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionTitle}>Live Call Audio & Synthetic Voice</Text>
            <Text style={styles.permissionDesc}>
              Screens incoming unknown phone calls for AI voice cloning and acoustic playback artifacts
              using on-device streaming feature extractors.
            </Text>
          </View>
          <Switch
            value={callScreeningConsent}
            onValueChange={setCallScreeningConsent}
            trackColor={{ false: "#334155", true: "#0284c7" }}
            thumbColor={callScreeningConsent ? "#38bdf8" : "#94a3b8"}
          />
        </View>

        {/* Legal & PECA 2016 Notice */}
        <View style={styles.legalBox}>
          <Text style={styles.legalTitle}>FIA NR3C Integration Notice (PECA 2016)</Text>
          <Text style={styles.legalText}>
            When high-risk fraud (risk &gt; 60) is intercepted, Sentinel displays a heads-up banner with a
            1-tap Human-in-the-Loop gate. An official cybercrime affidavit is submitted to FIA NR3C ONLY
            after your explicit confirmation.
          </Text>
        </View>

        {/* Activation Button */}
        <TouchableOpacity
          style={[styles.activateButton, !canProceed && styles.activateButtonDisabled]}
          onPress={handleActivateShield}
          disabled={!canProceed}
          activeOpacity={0.8}
        >
          <Text style={styles.activateButtonText}>Activate Sentinel Shield</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          You can adjust or revoke these permissions anytime in Settings.
        </Text>
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
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(14, 165, 233, 0.15)",
    borderColor: "#0284c7",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  badgeText: {
    color: "#38bdf8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  title: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
    marginBottom: 8,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 20,
  },
  privacyCard: {
    backgroundColor: "#091326",
    borderColor: "#1e3a8a",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  privacyTitle: {
    color: "#60a5fa",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  privacyText: {
    color: "#93c5fd",
    fontSize: 12,
    lineHeight: 18,
  },
  sectionHeader: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 14,
  },
  permissionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  permissionInfo: {
    flex: 1,
    paddingRight: 12,
  },
  permissionTitle: {
    color: "#f1f5f9",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  permissionDesc: {
    color: "#64748b",
    fontSize: 12,
    lineHeight: 16,
  },
  legalBox: {
    backgroundColor: "#18181b",
    borderColor: "#27272a",
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
    marginBottom: 24,
  },
  legalTitle: {
    color: "#fbbf24",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  legalText: {
    color: "#a1a1aa",
    fontSize: 11,
    lineHeight: 16,
  },
  activateButton: {
    backgroundColor: "#0284c7",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  activateButtonDisabled: {
    backgroundColor: "#1e293b",
  },
  activateButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  footerText: {
    color: "#64748b",
    fontSize: 11,
    textAlign: "center",
    marginTop: 14,
  },
});
