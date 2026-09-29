import React, { useEffect, useState } from "react";
import { Activity, Cpu, Database, BookOpen, CheckCircle, AlertTriangle, RefreshCcw } from "lucide-react";
import { api } from "../services/api";

export default function StatusPage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
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
    fetchHealth();
  }, []);

  const components = [
    {
      name: "Flask Backend REST Server",
      status: health?.status === "online" ? "ONLINE" : "OFFLINE",
      isOk: health?.status === "online",
      detail: "Listening on http://localhost:5000",
      icon: Activity
    },
    {
      name: "WSNet Neural Model Singleton",
      status: health?.components?.wsnet_model?.status === "ready" ? "READY" : "NOT LOADED",
      isOk: health?.components?.wsnet_model?.status === "ready",
      detail: `Load Time: ${health?.components?.wsnet_model?.load_time_seconds || 0}s (${health?.components?.wsnet_model?.compute_device || 'CPU'})`,
      icon: Cpu
    },
    {
      name: "SQLite Analysis Database",
      status: health?.components?.database?.status === "connected" ? "CONNECTED" : "ERROR",
      isOk: health?.components?.database?.status === "connected",
      detail: "data/user_data/woundtrack.db",
      icon: Database
    },
    {
      name: "PubMed RAG Knowledge Corpus",
      status: health?.components?.rag_engine?.status === "ready" ? "READY" : "DEGRADED",
      isOk: health?.components?.rag_engine?.status === "ready",
      detail: `${health?.components?.rag_engine?.corpus_documents || 0} Grounded PubMed Articles`,
      icon: BookOpen
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{
        backgroundColor: "#1c2541",
        border: "1px solid #2a3860",
        borderRadius: "14px",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#f8fafc", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={20} color="#00b4d8" />
            Realtime Diagnostic Monitor
          </h2>
          <p style={{ fontSize: "12px", color: "#94a3b8", margin: "4px 0 0 0" }}>
            Live status of backend server, WSNet neural network, SQLite database, and PubMed RAG engine.
          </p>
        </div>

        <button
          onClick={fetchHealth}
          style={{ backgroundColor: "#2a3860", color: "#f8fafc", border: "none", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}
        >
          <RefreshCcw size={14} />
          <span>Refresh Diagnostic</span>
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
        {components.map((comp, idx) => {
          const Icon = comp.icon;
          return (
            <div
              key={idx}
              style={{
                backgroundColor: "#1c2541",
                border: `1px solid ${comp.isOk ? "#2a3860" : "#ef4444"}`,
                borderRadius: "12px",
                padding: "20px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <Icon size={22} color={comp.isOk ? "#00b4d8" : "#ef4444"} />
                <span style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  backgroundColor: comp.isOk ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                  color: comp.isOk ? "#10b981" : "#ef4444",
                  padding: "4px 10px",
                  borderRadius: "12px"
                }}>
                  {comp.status}
                </span>
              </div>

              <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#f8fafc", marginBottom: "4px" }}>
                {comp.name}
              </h4>
              <p style={{ fontSize: "12px", color: "#94a3b8" }}>{comp.detail}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
