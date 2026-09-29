import React, { useEffect, useState } from "react";
import { FileText, Printer, Eye, Search } from "lucide-react";
import ReportPreviewModal from "../components/ReportPreviewModal";
import { api } from "../services/api";

export default function ReportsPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  useEffect(() => {
    api.getHistory(100, 0)
      .then((res) => setHistory(res.history || []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{
        backgroundColor: "#1c2541",
        border: "1px solid #2a3860",
        borderRadius: "14px",
        padding: "20px 24px"
      }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#f8fafc", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          <FileText size={20} color="#00b4d8" />
          Analysis Reports & Export Center
        </h2>
        <p style={{ fontSize: "12px", color: "#94a3b8", margin: "4px 0 0 0" }}>
          Generate, preview, and print official research reports containing segmentation overlays, spatial metrics, and PubMed citations.
        </p>
      </div>

      <div style={{ backgroundColor: "#1c2541", border: "1px solid #2a3860", borderRadius: "14px", padding: "20px" }}>
        {loading ? (
          <div style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>Loading report registry...</div>
        ) : history.length === 0 ? (
          <div style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>No analyses available for report generation.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
            {history.map((item) => {
              const origUrl = api.getMediaUrl(item.images?.original);
              return (
                <div
                  key={item.analysis_id}
                  style={{
                    backgroundColor: "#0b132b",
                    border: "1px solid #2a3860",
                    borderRadius: "12px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img src={origUrl} alt="Report Thumbnail" style={{ width: "56px", height: "56px", objectFit: "cover", borderRadius: "8px", border: "1px solid #2a3860" }} />
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#f8fafc" }}>{item.analysis_id}</div>
                      <div style={{ fontSize: "12px", color: "#94a3b8" }}>Date: {item.created_at?.split("T")[0]}</div>
                      <div style={{ fontSize: "12px", color: "#00b4d8", fontWeight: 600 }}>Area: {item.measurements?.wound_area_pixels?.toLocaleString()} px²</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedAnalysis(item)}
                    style={{
                      backgroundColor: "#00b4d8",
                      color: "#0b132b",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px",
                      fontWeight: 600,
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    <Printer size={15} />
                    <span>Preview & Print Report</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedAnalysis && (
        <ReportPreviewModal
          analysisData={selectedAnalysis}
          onClose={() => setSelectedAnalysis(null)}
        />
      )}
    </div>
  );
}
