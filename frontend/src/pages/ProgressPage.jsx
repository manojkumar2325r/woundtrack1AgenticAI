import React, { useEffect, useState } from "react";
import { TrendingUp, RefreshCw, AlertCircle } from "lucide-react";
import ProgressionChart from "../components/ProgressionChart";
import { api } from "../services/api";

export default function ProgressPage() {
  const [progressionData, setProgressionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgression = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getProgression();
      setProgressionData(res.progression);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgression();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{
        backgroundColor: "#1c2541",
        border: "1px solid #2a3860",
        borderRadius: "14px",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#f8fafc", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <TrendingUp size={20} color="#00b4d8" />
            Wound Progression Intelligence
          </h2>
          <p style={{ fontSize: "12px", color: "#94a3b8", margin: "2px 0 0 0" }}>
            Tracks serial wound surface area deltas and percentage changes over multiple visits.
          </p>
        </div>

        <button
          onClick={fetchProgression}
          style={{ backgroundColor: "#2a3860", color: "#f8fafc", border: "none", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}
        >
          <RefreshCw size={14} />
          <span>Refresh Trend</span>
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div style={{ backgroundColor: "#1c2541", border: "1px solid #2a3860", borderRadius: "14px", padding: "40px", textAlign: "center", color: "#94a3b8" }}>
          Calculating visit sequence progression...
        </div>
      ) : error ? (
        <div style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", borderRadius: "12px", padding: "20px", color: "#f8fafc" }}>
          Error calculating progression: {error}
        </div>
      ) : (
        <ProgressionChart progressionData={progressionData} />
      )}
    </div>
  );
}
