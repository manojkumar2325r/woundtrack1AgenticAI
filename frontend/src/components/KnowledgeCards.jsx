import React from "react";
import { BookOpen, ExternalLink, FileText, CheckCircle2 } from "lucide-react";

export default function KnowledgeCards({ ragData }) {
  if (!ragData || !ragData.citations || ragData.citations.length === 0) {
    return (
      <div style={{
        marginTop: "24px",
        backgroundColor: "#1c2541",
        border: "1px solid #2a3860",
        borderRadius: "12px",
        padding: "20px",
        color: "#94a3b8",
        fontSize: "13px"
      }}>
        Medical knowledge retrieval is currently unavailable or returned no direct references.
      </div>
    );
  }

  return (
    <div style={{ marginTop: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
          <BookOpen size={18} color="#00b4d8" />
          Retrieved Medical Knowledge (PubMed RAG Grounding)
        </h3>
        <span style={{ fontSize: "12px", color: "#10b981", backgroundColor: "rgba(16, 185, 129, 0.12)", padding: "4px 10px", borderRadius: "12px", fontWeight: 500 }}>
          {ragData.citations.length} Grounded References
        </span>
      </div>

      {/* RAG Answer Summary Box */}
      {ragData.answer && (
        <div style={{
          backgroundColor: "#161e38",
          border: "1px solid #2a3860",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "16px",
          fontSize: "13px",
          lineHeight: "1.6",
          color: "#cbd5e1"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#00b4d8", fontWeight: 600, marginBottom: "8px" }}>
            <CheckCircle2 size={16} />
            AI Research Synthesis
          </div>
          <p style={{ whiteSpace: "pre-line" }}>{ragData.answer}</p>
        </div>
      )}

      {/* Citations List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {ragData.citations.map((cite, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: "#1c2541",
              border: "1px solid #2a3860",
              borderRadius: "10px",
              padding: "16px",
              transition: "border-color 0.15s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "#00b4d8"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "#2a3860"}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#f8fafc", marginBottom: "4px" }}>
                  [{cite.citation_id || idx + 1}] {cite.title}
                </h4>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "8px" }}>
                  <span>{cite.authors}</span> • <span>{cite.journal} ({cite.year})</span>
                </div>
              </div>

              {cite.url && (
                <a
                  href={cite.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: "rgba(0, 180, 216, 0.15)",
                    color: "#00b4d8",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 500,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    flexShrink: 0
                  }}
                >
                  <span>PMID: {cite.pmid}</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>

            <p style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic", marginTop: "4px" }}>
              "{cite.excerpt}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
