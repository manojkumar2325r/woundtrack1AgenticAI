import React, { useEffect, useState } from "react";
import { PlusCircle, History, TrendingUp, Activity, Layers, ArrowRight, FolderOpen, RefreshCcw } from "lucide-react";
import { api } from "../services/api";

export default function DashboardPage({ setActiveTab, setSelectedAnalysisId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getHistory(10, 0);
      setHistory(res.history || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const totalAnalyses = history.length;
  const latestAnalysis = history[0];
  const avgArea = history.length > 0
    ? Math.round(history.reduce((acc, h) => acc + (h.measurements?.wound_area_pixels || 0), 0) / history.length)
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner */}
      <div style={{
        backgroundColor: "#1c2541",
        border: "1px solid #2a3860",
        borderRadius: "14px",
        padding: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#f8fafc", marginBottom: "4px" }}>
            Welcome to WoundTrack Dashboard
          </h2>
          <p style={{ fontSize: "13px", color: "#94a3b8" }}>
            Real-time multimodal AI monitoring for wound segmentation, measurements, and progress tracking.
          </p>
        </div>

        <button
          onClick={() => setActiveTab("analysis")}
          style={{
            backgroundColor: "#00b4d8",
            color: "#0b132b",
            fontWeight: 700,
            fontSize: "14px",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 0 16px rgba(0, 180, 216, 0.3)"
          }}
        >
          <PlusCircle size={18} />
          <span>New Image Analysis</span>
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: "13px", marginBottom: "8px" }}>
            <span>Total Saved Analyses</span>
            <History size={18} color="#00b4d8" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#f8fafc" }}>{totalAnalyses}</div>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Recorded in SQLite database</span>
        </div>

        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: "13px", marginBottom: "8px" }}>
            <span>Latest Wound Area</span>
            <Layers size={18} color="#48cae4" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#00b4d8" }}>
            {latestAnalysis ? `${latestAnalysis.measurements?.wound_area_pixels?.toLocaleString()} px²` : "N/A"}
          </div>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Most recent measurement</span>
        </div>

        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: "13px", marginBottom: "8px" }}>
            <span>Average Observed Area</span>
            <TrendingUp size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#f8fafc" }}>
            {avgArea > 0 ? `${avgArea.toLocaleString()} px²` : "N/A"}
          </div>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Across all session records</span>
        </div>

        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: "13px", marginBottom: "8px" }}>
            <span>Neural Model Status</span>
            <Activity size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#10b981", marginTop: "6px" }}>WSNet Ready</div>
          <span style={{ fontSize: "11px", color: "#64748b" }}>192x192 U-Net In-Memory</span>
        </div>
      </div>

      {/* Recent Analyses List */}
      <div style={{ backgroundColor: "#1c2541", border: "1px solid #2a3860", borderRadius: "14px", padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#f8fafc" }}>Recent Saved Analyses</h3>
          <button
            onClick={fetchHistory}
            style={{ backgroundColor: "transparent", border: "none", color: "#00b4d8", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
          >
            <RefreshCcw size={14} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "30px", textAlign: "center", color: "#94a3b8" }}>Loading analyses...</div>
        ) : error ? (
          <div style={{ padding: "20px", color: "#ef4444", fontSize: "13px" }}>Error loading history: {error}</div>
        ) : history.length === 0 ? (
          /* Empty State */
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8" }}>
            <FolderOpen size={36} color="#00b4d8" style={{ margin: "0 auto 12px auto" }} />
            <h4 style={{ color: "#f8fafc", fontSize: "16px", marginBottom: "4px" }}>No Wound Analyses Yet</h4>
            <p style={{ fontSize: "13px", marginBottom: "16px" }}>Upload your first wound image to start segmenting and tracking measurements.</p>
            <button
              onClick={() => setActiveTab("analysis")}
              style={{ backgroundColor: "#00b4d8", color: "#0b132b", border: "none", padding: "8px 20px", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}
            >
              Analyze First Image
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {history.slice(0, 5).map((item) => {
              const origUrl = api.getMediaUrl(item.images?.original);
              return (
                <div
                  key={item.analysis_id}
                  style={{
                    backgroundColor: "#0b132b",
                    border: "1px solid #2a3860",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img
                      src={origUrl}
                      alt="Thumbnail"
                      style={{ width: "44px", height: "44px", objectFit: "cover", borderRadius: "6px", border: "1px solid #2a3860" }}
                    />
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#f8fafc" }}>
                        ID: {item.analysis_id}
                      </div>
                      <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                        Date: {item.created_at?.split("T")[0]} • Area: <strong style={{ color: "#00b4d8" }}>{item.measurements?.wound_area_pixels?.toLocaleString()} px²</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedAnalysisId(item.analysis_id);
                      setActiveTab("analysis");
                    }}
                    style={{
                      backgroundColor: "rgba(0,180,216,0.15)",
                      color: "#00b4d8",
                      border: "none",
                      padding: "6px 14px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    <span>View Analysis</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
