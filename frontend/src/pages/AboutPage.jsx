import React from "react";
import { Info, ShieldAlert, Cpu, Layers, BookOpen } from "lucide-react";

export default function AboutPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}>
      <div style={{
        backgroundColor: "#1c2541",
        border: "1px solid #2a3860",
        borderRadius: "14px",
        padding: "24px"
      }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#f8fafc", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Info size={22} color="#00b4d8" />
          About WoundTrack-RAG1
        </h2>
        <p style={{ fontSize: "14px", color: "#94a3b8", lineHeight: "1.6" }}>
          WoundTrack-RAG1 is a multimodal research software system combining deep learning computer vision (WSNet) for wound image segmentation and spatial metric extraction with Retrieval-Augmented Generation (RAG) over PubMed literature.
        </p>
      </div>

      {/* Model Specifications */}
      <div style={{ backgroundColor: "#1c2541", border: "1px solid #2a3860", borderRadius: "14px", padding: "24px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#00b4d8", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Cpu size={18} />
          WSNet Model Architecture & Metrics
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "13px", color: "#cbd5e1" }}>
          <div style={{ backgroundColor: "#0b132b", padding: "14px", borderRadius: "8px" }}>
            <strong style={{ color: "#f8fafc" }}>Input / Output Dimensions</strong>
            <div style={{ marginTop: "4px", color: "#94a3b8" }}>192 × 192 × 3 RGB input / 192 × 192 × 1 Sigmoid output</div>
          </div>

          <div style={{ backgroundColor: "#0b132b", padding: "14px", borderRadius: "8px" }}>
            <strong style={{ color: "#f8fafc" }}>Multi-Scale Patch Fusion</strong>
            <div style={{ marginTop: "4px", color: "#94a3b8" }}>9 local 64x64 spatial patches + 1 global 192x192 branch</div>
          </div>

          <div style={{ backgroundColor: "#0b132b", padding: "14px", borderRadius: "8px" }}>
            <strong style={{ color: "#f8fafc" }}>Diagnostic Validation Metrics</strong>
            <div style={{ marginTop: "4px", color: "#94a3b8" }}>Validation Dice: 0.4233 | Validation IoU: 0.2994</div>
          </div>

          <div style={{ backgroundColor: "#0b132b", padding: "14px", borderRadius: "8px" }}>
            <strong style={{ color: "#f8fafc" }}>Checkpoint Integrity</strong>
            <div style={{ marginTop: "4px", color: "#94a3b8" }}>best_wsnet.weights.h5 (~187 MB weight file)</div>
          </div>
        </div>
      </div>

      {/* Research Disclaimer Notice */}
      <div style={{
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        border: "1px solid #f59e0b",
        borderRadius: "14px",
        padding: "20px",
        color: "#f8fafc"
      }}>
        <h4 style={{ color: "#f59e0b", fontSize: "15px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
          <ShieldAlert size={18} />
          Important Clinical Disclaimer
        </h4>
        <p style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.6" }}>
          This system is strictly designed for educational, research, and technical evaluation purposes. The spatial metrics (reported in pixels and square pixels) and neural segmentation overlays represent artificial intelligence model outputs and do not constitute a clinical diagnosis, medical evaluation, or treatment plan.
        </p>
      </div>
    </div>
  );
}
