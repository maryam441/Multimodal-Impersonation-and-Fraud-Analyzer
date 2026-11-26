import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Animated
} from "react-native";
import { StreamAlert, FiaReportResult, streamClient } from "../services/streamClient";

interface Props {
  alert: StreamAlert | null;
  onDismiss: () => void;
}

export const HeadsUpOverlay: React.FC<Props> = ({ alert, onDismiss }) => {
  const [showFiaConfirm, setShowFiaConfirm] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<FiaReportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!alert) return null;

  const handleReportPress = () => {
    setShowFiaConfirm(true);
    setErrorMessage(null);
    setSubmissionSuccess(null);
  };

  const handleConfirmFia = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const result = await streamClient.submitToFia(
        alert.case_id,
        alert.suspect_identifier || "+923001234567",
        notes || "Reported via Sentinel Mobile Real-Time Heads-Up Shield"
      );
      setSubmissionSuccess(result);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit FIA report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Floating Heads-Up Banner */}
      <View style={[styles.banner, alert.risk_score > 75 ? styles.bannerCritical : styles.bannerHigh]}>
        <View style={styles.headerRow}>
          <View style={styles.threatBadge}>
            <Text style={styles.threatBadgeText}>CRITICAL THREAT</Text>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreValue}>{Math.round(alert.risk_score)}</Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
        </View>

        <Text style={styles.summaryText}>{alert.threat_summary}</Text>

        {alert.suspect_identifier && (
          <Text style={styles.suspectText}>
            Source: <Text style={styles.suspectBold}>{alert.suspect_identifier}</Text>
          </Text>
        )}

        {/* Threat reasons */}
        <View style={styles.reasonsList}>
          {alert.reasons.slice(0, 2).map((reason, idx) => (
            <Text key={idx} style={styles.reasonItem}>
              • {reason}
            </Text>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.fiaButton}
            onPress={handleReportPress}
            activeOpacity={0.8}
          >
            <Text style={styles.fiaButtonText}>Report to FIA</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onDismiss}
            activeOpacity={0.8}
          >
            <Text style={styles.dismissButtonText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Human-in-the-Loop Confirmation Modal */}
      <Modal
        visible={showFiaConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => !isSubmitting && setShowFiaConfirm(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {submissionSuccess ? (
              <View style={styles.successContainer}>
                <Text style={styles.successTitle}>Official FIA Report Dispatched</Text>
                <Text style={styles.successSubtitle}>
                  Evidence affidavit sealed with SHA-256 and registered at FIA Cybercrime Wing (NR3C).
                </Text>

                <View style={styles.trackingBox}>
                  <Text style={styles.trackingLabel}>FIA Tracking ID:</Text>
                  <Text style={styles.trackingValue}>{submissionSuccess.tracking_id}</Text>
                </View>

                <View style={styles.pecaBox}>
                  <Text style={styles.pecaLabel}>PECA 2016 Invocations:</Text>
                  {submissionSuccess.peca_sections.map((sec, i) => (
                    <Text key={i} style={styles.pecaItem}>
                      § {sec}
                    </Text>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => {
                    setShowFiaConfirm(false);
                    onDismiss();
                  }}
                >
                  <Text style={styles.modalCloseButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.modalTitle}>Authorise FIA Incident Report</Text>
                <Text style={styles.modalNotice}>
                  HUMAN-IN-THE-LOOP REQUIREMENT: Sentinel never auto-reports to external law enforcement.
                  You must explicitly authorize compilation of this forensic case.
                </Text>

                <View style={styles.caseDetailsBox}>
                  <Text style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Case Reference: </Text>
                    {alert.case_id.substring(0, 12)}...
                  </Text>
                  <Text style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Suspect Target: </Text>
                    {alert.suspect_identifier || "Unknown"}
                  </Text>
                  <Text style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Assessed Risk: </Text>
                    {alert.risk_score}/100 ({alert.risk_category.toUpperCase()})
                  </Text>
                </View>

                <Text style={styles.inputLabel}>Victim Statement / Notes (Optional):</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Scammer contacted me on WhatsApp demanding bank OTP"
                  placeholderTextColor="#64748b"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                />

                {errorMessage && (
                  <Text style={styles.errorText}>Error: {errorMessage}</Text>
                )}

                <View style={styles.modalActionsRow}>
                  <TouchableOpacity
                    style={[styles.modalSubmitButton, isSubmitting && { opacity: 0.6 }]}
                    onPress={handleConfirmFia}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.modalSubmitButtonText}>Authorize & Dispatch to FIA</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setShowFiaConfirm(false)}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.modalCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 40,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  banner: {
    backgroundColor: "#090d16",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  bannerCritical: {
    borderColor: "#ef4444",
  },
  bannerHigh: {
    borderColor: "#f97316",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  threatBadge: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  threatBadgeText: {
    color: "#f87171",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  scoreValue: {
    color: "#ef4444",
    fontSize: 18,
    fontWeight: "800",
  },
  scoreMax: {
    color: "#94a3b8",
    fontSize: 12,
  },
  summaryText: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  suspectText: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 8,
  },
  suspectBold: {
    color: "#38bdf8",
    fontWeight: "600",
  },
  reasonsList: {
    marginBottom: 12,
  },
  reasonItem: {
    color: "#cbd5e1",
    fontSize: 12,
    marginBottom: 2,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  fiaButton: {
    flex: 1,
    backgroundColor: "#b91c1c",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  fiaButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
  dismissButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#1e293b",
    alignItems: "center",
  },
  dismissButtonText: {
    color: "#94a3b8",
    fontWeight: "600",
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  modalTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  modalNotice: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  caseDetailsBox: {
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  detailRow: {
    color: "#e2e8f0",
    fontSize: 13,
    marginBottom: 4,
  },
  detailLabel: {
    color: "#64748b",
  },
  inputLabel: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: "#020617",
    color: "#f8fafc",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    marginBottom: 14,
    textAlignVertical: "top",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginBottom: 10,
  },
  modalActionsRow: {
    gap: 8,
  },
  modalSubmitButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalSubmitButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  modalCancelButton: {
    paddingVertical: 10,
    alignItems: "center",
  },
  modalCancelButtonText: {
    color: "#94a3b8",
    fontSize: 13,
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  successTitle: {
    color: "#4ade80",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  successSubtitle: {
    color: "#94a3b8",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 16,
  },
  trackingBox: {
    backgroundColor: "#064e3b",
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#059669",
    width: "100%",
    alignItems: "center",
    marginBottom: 14,
  },
  trackingLabel: {
    color: "#a7f3d0",
    fontSize: 12,
    marginBottom: 4,
  },
  trackingValue: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1,
  },
  pecaBox: {
    width: "100%",
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  pecaLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  pecaItem: {
    color: "#cbd5e1",
    fontSize: 12,
  },
  modalCloseButton: {
    backgroundColor: "#334155",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  modalCloseButtonText: {
    color: "#f8fafc",
    fontWeight: "600",
  },
});
