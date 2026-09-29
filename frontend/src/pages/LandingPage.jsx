import React from "react";
import { Sparkles, Layers, Ruler, TrendingUp, BookOpen, ShieldCheck, ArrowRight, Activity, Bot } from "lucide-react";

export default function LandingPage({ onStartAnalysis, onExploreDashboard }) {
  const features = [
    {
      icon: Layers,
      title: "WSNet Neural Segmentation",
      desc: "Pretrained multi-scale U-Net architecture combining 9 local spatial 64x64 patches with a global 192x192 contextual branch."
    },
    {
      icon: Ruler,
      title: "Exact Spatial Measurements",
      desc: "Derives non-zero wound area (px²), bounding dimensions (px), contour perimeter (px), aspect ratio, and image coverage %."
    },
    {
      icon: TrendingUp,
      title: "Multi-Visit Progress Intelligence",
      desc: "Tracks serial wound surface area deltas and percentage changes across visits to visualize image-based progression."
    },
    {
      icon: BookOpen,
      title: "PubMed RAG Grounding",
      desc: "Retrieves peer-reviewed medical research articles from PubMed to ground AI explanations with verifiable citations."
    },
    {
      icon: Bot,
      title: "Interactive AI Chatbot",
      desc: "Engage in citation-grounded dialogue regarding wound characteristics, measurements, and relevant literature."
    },
    {
      icon: ShieldCheck,
      title: "Responsible AI & Privacy",
      desc: "Built with persistent disclaimers distinguishing AI research assistance from clinical medical diagnosis."
    }
  ];

  return (
    <div style={{ padding: "32px 0", maxWidth: "1100px", margin: "0 auto" }}>
      {/* Hero Section */}
      <div style={{
        textAlign: "center",
        padding: "60px 24px",
        background: "radial-gradient(circle at top center, rgba(0,180,216,0.15) 0%, rgba(11,19,43,0) 70%)",
        borderRadius: "20px",
        marginBottom: "48px"
      }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "rgba(0,180,216,0.15)",
          color: "#00b4d8",
          padding: "6px 14px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: 600,
          marginBottom: "20px",
          border: "1px solid rgba(0,180,216,0.3)"
        }}>
          <Sparkles size={14} />
          <span>Multimodal AI Research Platform</span>
        </div>

        <h1 style={{ fontSize: "42px", fontWeight: 700, color: "#f8fafc", marginBottom: "16px", letterSpacing: "-1px" }}>
          WoundTrack<span style={{ color: "#00b4d8" }}>-RAG1</span>
        </h1>
        <p style={{ fontSize: "20px", color: "#48cae4", fontWeight: 500, marginBottom: "12px" }}>
          AI-Powered Wound Analysis & Progress Intelligence
        </p>
        <p style={{ fontSize: "15px", color: "#94a3b8", maxWidth: "700px", margin: "0 auto 32px auto", lineHeight: "1.6" }}>
          Analyze wound images, visualize neural segmentation, measure spatial metrics, track multi-visit progression, and retrieve relevant PubMed medical knowledge through an intelligent multimodal AI workflow.
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
          <button
            onClick={onStartAnalysis}
            style={{
              backgroundColor: "#00b4d8",
              color: "#0b132b",
              fontWeight: 700,
              fontSize: "15px",
              padding: "12px 28px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 20px rgba(0, 180, 216, 0.4)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <span>Analyze a Wound Now</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={onExploreDashboard}
            style={{
              backgroundColor: "#1c2541",
              color: "#f8fafc",
              fontWeight: 600,
              fontSize: "15px",
              padding: "12px 24px",
              borderRadius: "10px",
              border: "1px solid #2a3860",
              cursor: "pointer"
            }}
          >
            Explore Dashboard
          </button>
        </div>
      </div>

      {/* Multimodal Workflow Visual Diagram */}
      <div style={{
        backgroundColor: "#1c2541",
        border: "1px solid #2a3860",
        borderRadius: "16px",
        padding: "28px",
        marginBottom: "48px",
        textAlign: "center"
      }}>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#f8fafc", marginBottom: "20px" }}>
          End-to-End Multimodal Workflow
        </h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
          alignItems: "center"
        }}>
          {[
            { step: "1", title: "Image Upload", detail: "Wound RGB Capture" },
            { step: "2", title: "WSNet Inference", detail: "Neural Segmentation" },
            { step: "3", title: "Spatial Metrics", detail: "Area, Width & Height" },
            { step: "4", title: "Progress Track", detail: "Multi-Visit Deltas" },
            { step: "5", title: "PubMed RAG", detail: "Grounded Literature" },
          ].map((item, i) => (
            <div key={i} style={{
              backgroundColor: "#0b132b",
              border: "1px solid #2a3860",
              borderRadius: "10px",
              padding: "14px 10px"
            }}>
              <div style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                backgroundColor: "#00b4d8",
                color: "#0b132b",
                fontWeight: 700,
                fontSize: "12px",
                margin: "0 auto 8px auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {item.step}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#f8fafc" }}>{item.title}</div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>{item.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Capabilities Grid */}
      <div style={{ marginBottom: "48px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#f8fafc", marginBottom: "20px", textAlign: "center" }}>
          Core System Capabilities
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                style={{
                  backgroundColor: "#1c2541",
                  border: "1px solid #2a3860",
                  borderRadius: "12px",
                  padding: "20px",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(0,180,216,0.15)",
                  color: "#00b4d8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "14px"
                }}>
                  <Icon size={22} />
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#f8fafc", marginBottom: "8px" }}>{f.title}</h3>
                <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.5" }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
