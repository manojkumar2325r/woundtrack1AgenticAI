import React, { useEffect, useState } from "react";
import { History, Search, Eye, Trash2, FileText, ArrowUpDown, RefreshCcw } from "lucide-react";
import { api } from "../services/api";

export default function HistoryPage({ setActiveTab, setSelectedAnalysisId }) {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getHistory(100, 0);
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

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete analysis record '${id}'?`)) return;
    try {
      await api.deleteHistoryItem(id);
      setHistory((prev) => prev.filter((item) => item.analysis_id !== id));
    } catch (err) {
      alert(`Failed to delete record: ${err.message}`);
    }
  };

  const filtered = history.filter((item) => {
    const term = search.toLowerCase();
    return (
      item.analysis_id?.toLowerCase().includes(term) ||
      item.patient_id?.toLowerCase().includes(term) ||
      item.visit_date?.toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header & Search */}
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
            <History size={20} color="#00b4d8" />
            Analysis History Registry
          </h2>
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>
            {history.length} Saved Records in SQLite Database
          </span>
        </div>

        {/* Search Input */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ position: "relative" }}>
            <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID or Patient..."
              style={{
                backgroundColor: "#0b132b",
                border: "1px solid #2a3860",
                borderRadius: "8px",
                padding: "8px 14px 8px 36px",
                color: "#f8fafc",
                fontSize: "13px",
                outline: "none",
                width: "220px"
              }}
            />
          </div>

          <button
            onClick={fetchHistory}
            style={{ backgroundColor: "#2a3860", color: "#f8fafc", border: "none", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}
          >
            <RefreshCcw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* History Table */}
      <div style={{ backgroundColor: "#1c2541", border: "1px solid #2a3860", borderRadius: "14px", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>Loading history records...</div>
        ) : error ? (
          <div style={{ padding: "20px", color: "#ef4444" }}>Error: {error}</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
            No matching analysis records found.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", color: "#f8fafc", fontSize: "13px", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "#0b132b", borderBottom: "1px solid #2a3860", color: "#94a3b8", fontSize: "12px" }}>
                  <th style={{ padding: "12px 16px" }}>Thumbnail</th>
                  <th style={{ padding: "12px 16px" }}>Analysis ID</th>
                  <th style={{ padding: "12px 16px" }}>Patient ID</th>
                  <th style={{ padding: "12px 16px" }}>Date</th>
                  <th style={{ padding: "12px 16px" }}>Wound Area (px²)</th>
                  <th style={{ padding: "12px 16px" }}>Dimensions (px)</th>
                  <th style={{ padding: "12px 16px" }}>Coverage %</th>
                  <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const origUrl = api.getMediaUrl(item.images?.original);
                  const m = item.measurements || {};
                  return (
                    <tr key={item.analysis_id} style={{ borderBottom: "1px solid #2a3860" }}>
                      <td style={{ padding: "10px 16px" }}>
                        <img src={origUrl} alt="Thumbnail" style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px", border: "1px solid #2a3860" }} />
                      </td>
                      <td style={{ padding: "10px 16px", fontWeight: 600, color: "#00b4d8" }}>{item.analysis_id}</td>
                      <td style={{ padding: "10px 16px", color: "#94a3b8" }}>{item.patient_id || "patient_01"}</td>
                      <td style={{ padding: "10px 16px", color: "#94a3b8" }}>{item.created_at?.split("T")[0] || item.visit_date}</td>
                      <td style={{ padding: "10px 16px", fontWeight: 700 }}>{m.wound_area_pixels?.toLocaleString()} px²</td>
                      <td style={{ padding: "10px 16px", color: "#94a3b8" }}>{m.bounding_width_pixels} × {m.bounding_height_pixels}</td>
                      <td style={{ padding: "10px 16px", color: "#94a3b8" }}>{m.wound_coverage_percentage}%</td>
                      <td style={{ padding: "10px 16px", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                          <button
                            onClick={() => {
                              setSelectedAnalysisId(item.analysis_id);
                              setActiveTab("analysis");
                            }}
                            style={{ backgroundColor: "rgba(0,180,216,0.15)", color: "#00b4d8", border: "none", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                            title="View Analysis"
                          >
                            <Eye size={14} />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => handleDelete(item.analysis_id)}
                            style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#ef4444", border: "none", padding: "6px 8px", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}
                            title="Delete Record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
