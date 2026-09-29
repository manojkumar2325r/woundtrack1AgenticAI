import React, { useEffect, useState } from "react";
import { Activity, Cpu, Database, RefreshCw, Sparkles } from "lucide-react";
import { api } from "../services/api";

export default function Navbar({ activeTab, setActiveTab }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await api.getHealth();
      setHealth(data);
    } catch (e) {
      setHealth({ status: "offline", error: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getTabTitle = () => {
    switch (activeTab) {
      case "dashboard": return "System Overview & Dashboard";
      case "analysis": return "AI Wound Analysis Workspace";
      case "history": return "Analysis History Registry";
      case "progress": return "Multi-Visit Progress Intelligence";
      case "assistant": return "Citation-Grounded Medical AI Assistant";
      case "reports": return "Analysis Reports & Export Center";
      case "status": return "Realtime Diagnostic Monitor";
      case "about": return "About WoundTrack-RAG1";
      default: return "WoundTrack-RAG1";
    }
  };

  const isOnline = health?.status === "online";
  const wsnetReady = health?.components?.wsnet_model?.status === "ready";

  return (
    <header style={{
      height: "64px",
      backgroundColor: "#1c2541",
      borderBottom: "1px solid #2a3860",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      position: "sticky",
      top: 0,
      zIndex: 30
    }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: "18px", fontWeight: 600, color: "#f8fafc", margin: 0 }}>
          {getTabTitle()}
        </h1>
        <span style={{ fontSize: "12px", color: "#94a3b8" }}>
          Multimodal AI for Wound Analysis and Progress Intelligence
        </span>
      </div>

      {/* Right Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* WSNet Status Badge */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "#0b132b",
          border: "1px solid #2a3860",
          borderRadius: "20px",
          padding: "6px 12px",
          fontSize: "12px"
        }}>
          <div style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: wsnetReady ? "#10b981" : "#ef4444",
            boxShadow: wsnetReady ? "0 0 8px #10b981" : "0 0 8px #ef4444"
          }} />
          <span style={{ color: "#f8fafc", fontWeight: 500 }}>
            WSNet: {wsnetReady ? "Ready" : "Offline"}
          </span>
          {health?.components?.wsnet_model?.compute_device && (
            <span style={{ color: "#94a3b8", fontSize: "11px" }}>
              ({health.components.wsnet_model.compute_device})
            </span>
          )}
        </div>

        {/* New Analysis Quick Button */}
        {activeTab !== "analysis" && (
          <button
            onClick={() => setActiveTab("analysis")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#00b4d8",
              color: "#0b132b",
              fontWeight: 600,
              fontSize: "13px",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 12px rgba(0, 180, 216, 0.3)",
              transition: "transform 0.15s ease"
            }}
          >
            <Sparkles size={16} />
            <span>New Analysis</span>
          </button>
        )}
      </div>
    </header>
  );
}
