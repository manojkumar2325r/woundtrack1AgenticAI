import React from "react";
import {
  LayoutDashboard,
  PlusCircle,
  History,
  TrendingUp,
  MessageSquareText,
  FileText,
  Activity,
  Info,
  ChevronRight,
  ShieldAlert
} from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab, isMobileOpen, setIsMobileOpen }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "analysis", label: "New Analysis", icon: PlusCircle, badge: "AI" },
    { id: "history", label: "Analysis History", icon: History },
    { id: "progress", label: "Progress Tracking", icon: TrendingUp },
    { id: "assistant", label: "AI Assistant", icon: MessageSquareText },
    { id: "reports", label: "Reports & Export", icon: FileText },
    { id: "status", label: "System Status", icon: Activity },
    { id: "about", label: "About System", icon: Info },
  ];

  const handleSelect = (id) => {
    setActiveTab(id);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <aside style={{
      width: "250px",
      backgroundColor: "#1c2541",
      borderRight: "1px solid #2a3860",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      position: "sticky",
      top: 0,
      zIndex: 40,
      flexShrink: 0
    }}>
      {/* Brand Header */}
      <div style={{
        padding: "20px 18px",
        borderBottom: "1px solid #2a3860",
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}>
        <div style={{
          width: "36px",
          height: "36px",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 12px rgba(0,180,216,0.4)"
        }}>
          <Activity size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "16px", color: "#f8fafc", letterSpacing: "-0.3px" }}>
            WoundTrack<span style={{ color: "#00b4d8" }}>-RAG1</span>
          </div>
          <div style={{ fontSize: "11px", color: "#94a3b8" }}>
            Multimodal Intelligence
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto" }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: isActive ? "rgba(0, 180, 216, 0.15)" : "transparent",
                color: isActive ? "#00b4d8" : "#94a3b8",
                fontWeight: isActive ? 600 : 400,
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.15s ease-in-out",
                width: "100%",
                textAlign: "left"
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)";
                if (!isActive) e.currentTarget.style.color = "#f8fafc";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                if (!isActive) e.currentTarget.style.color = "#94a3b8";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Icon size={18} color={isActive ? "#00b4d8" : "#94a3b8"} />
                <span>{item.label}</span>
              </div>
              {item.badge ? (
                <span style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  backgroundColor: "#00b4d8",
                  color: "#0b132b",
                  padding: "2px 6px",
                  borderRadius: "4px"
                }}>
                  {item.badge}
                </span>
              ) : isActive ? (
                <ChevronRight size={14} color="#00b4d8" />
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div style={{
        padding: "16px",
        borderTop: "1px solid #2a3860",
        fontSize: "12px",
        color: "#64748b",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}>
        <ShieldAlert size={14} color="#00b4d8" />
        <span>WSNet Pretrained Model v1.0</span>
      </div>
    </aside>
  );
}
