import React from "react";
import AIChatDrawer from "../components/AIChatDrawer";

export default function AssistantPage({ selectedAnalysisId }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{
        backgroundColor: "#1c2541",
        border: "1px solid #2a3860",
        borderRadius: "14px",
        padding: "20px 24px"
      }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#f8fafc", margin: 0 }}>
          Citation-Grounded Medical AI Assistant
        </h2>
        <p style={{ fontSize: "12px", color: "#94a3b8", margin: "4px 0 0 0" }}>
          Interact with our RAG system trained on peer-reviewed PubMed literature regarding chronic wound healing, antiseptics, and area reduction metrics.
        </p>
      </div>

      <AIChatDrawer currentAnalysisId={selectedAnalysisId} />
    </div>
  );
}
