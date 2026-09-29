import React from "react";
import { AlertTriangle } from "lucide-react";

export default function DisclaimerBanner() {
  return (
    <div style={{
      backgroundColor: "#1e293b",
      borderBottom: "1px solid #334155",
      color: "#94a3b8",
      padding: "8px 16px",
      fontSize: "13px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      textAlign: "center"
    }}>
      <AlertTriangle size={15} color="#f59e0b" style={{ shrink: 0 }} />
      <span>
        <strong style={{ color: "#f8fafc" }}>Research & Educational AI System:</strong> WoundTrack-RAG1 provides image-based assistance for research purposes only. It does not provide clinical diagnoses or replace professional healthcare evaluations.
      </span>
    </div>
  );
}
