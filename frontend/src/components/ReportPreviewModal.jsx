import React from "react";
import { X, Printer, BookOpen, ExternalLink, Activity, Clock, Layers, ShieldCheck } from "lucide-react";
import { api } from "../services/api";

export default function ReportPreviewModal({ analysisData, onClose }) {
  if (!analysisData) return null;

  const handlePrint = () => {
    window.print();
  };

  const origUrl = api.getMediaUrl(analysisData.images?.original);
  const maskUrl = api.getMediaUrl(analysisData.images?.mask);
  const overlayUrl = api.getMediaUrl(analysisData.images?.overlay);
  const m = analysisData.measurements || {};
  const rag = analysisData.rag || {};
  const citations = rag.citations || [];
  const similarCases = rag.similar_cases || [];
  const timeframe = rag.healing_timeframe_insights || {};

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.85)",
      backdropFilter: "blur(6px)",
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        backgroundColor: "#1c2541",
        border: "1px solid #2a3860",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "880px",
        maxHeight: "92vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
      }}>
        {/* Header Bar */}
        <div style={{
          padding: "16px 24px",
          backgroundColor: "#0b132b",
          borderBottom: "1px solid #2a3860",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Activity size={20} color="#00b4d8" />
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc", margin: 0 }}>
              WoundTrack-RAG1 Official Analysis & Medical Literature Report
            </h3>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={handlePrint}
              style={{
                backgroundColor: "#00b4d8",
                color: "#0b132b",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <Printer size={15} />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              style={{
                backgroundColor: "#2a3860",
                color: "#f8fafc",
                border: "none",
                borderRadius: "8px",
                padding: "8px",
                cursor: "pointer"
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Report Content Body */}
        <div id="printable-report" style={{
          flex: 1,
          padding: "28px",
          overflowY: "auto",
          color: "#f8fafc",
          fontSize: "13px",
          lineHeight: "1.6"
        }}>
          {/* Document Header Banner */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "16px",
            marginBottom: "20px",
            borderBottom: "2px solid #00b4d8"
          }}>
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#f8fafc", margin: 0 }}>
                WoundTrack<span style={{ color: "#00b4d8" }}>-RAG1</span> Comprehensive Report
              </h2>
              <div style={{ fontSize: "12px", color: "#00b4d8" }}>Multimodal AI for Wound Segmentation & Medical RAG Intelligence</div>
            </div>
            <div style={{ textAlign: "right", fontSize: "12px", color: "#94a3b8" }}>
              <div>Analysis ID: <strong style={{ color: "#f8fafc" }}>{analysisData.analysis_id}</strong></div>
              <div>Date: {analysisData.created_at?.split("T")[0] || analysisData.visit_date}</div>
              <div>Patient ID: {analysisData.patient_id || "patient_01"}</div>
            </div>
          </div>

          {/* 1. Visual Neural Segmentation Imagery */}
          <div style={{ marginBottom: "24px" }}>
            <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#00b4d8", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Layers size={16} />
              1. Visual Neural Segmentation Imagery (WSNet Architecture)
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              <div style={{ textAlign: "center", backgroundColor: "#0b132b", padding: "10px", borderRadius: "8px", border: "1px solid #2a3860" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "6px" }}>Original Image</div>
                <img src={origUrl} alt="Original" style={{ width: "100%", height: "150px", objectFit: "contain", borderRadius: "4px" }} />
              </div>
              <div style={{ textAlign: "center", backgroundColor: "#0b132b", padding: "10px", borderRadius: "8px", border: "1px solid #2a3860" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "6px" }}>Binary Segmentation Mask</div>
                <img src={maskUrl} alt="Mask" style={{ width: "100%", height: "150px", objectFit: "contain", borderRadius: "4px" }} />
              </div>
              <div style={{ textAlign: "center", backgroundColor: "#0b132b", padding: "10px", borderRadius: "8px", border: "1px solid #2a3860" }}>
                <div style={{ fontSize: "11px", color: "#00b4d8", marginBottom: "6px" }}>WSNet Color Overlay</div>
                <img src={overlayUrl} alt="Overlay" style={{ width: "100%", height: "150px", objectFit: "contain", borderRadius: "4px" }} />
              </div>
            </div>
          </div>

          {/* 2. Derived Spatial Measurements */}
          <div style={{ marginBottom: "24px" }}>
            <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#00b4d8", marginBottom: "12px" }}>
              2. Derived Spatial Measurements
            </h4>
            <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#0b132b", borderRadius: "8px", overflow: "hidden" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #2a3860", color: "#94a3b8", textAlign: "left", fontSize: "12px" }}>
                  <th style={{ padding: "10px 14px" }}>Metric Description</th>
                  <th style={{ padding: "10px 14px" }}>Derived Value</th>
                  <th style={{ padding: "10px 14px" }}>Units</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #1c2541" }}>
                  <td style={{ padding: "10px 14px" }}>Wound Surface Area</td>
                  <td style={{ padding: "10px 14px", fontWeight: 700, color: "#00b4d8" }}>{m.wound_area_pixels?.toLocaleString()}</td>
                  <td style={{ padding: "10px 14px", color: "#94a3b8" }}>px²</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #1c2541" }}>
                  <td style={{ padding: "10px 14px" }}>Bounding Box Width</td>
                  <td style={{ padding: "10px 14px", fontWeight: 600 }}>{m.bounding_width_pixels}</td>
                  <td style={{ padding: "10px 14px", color: "#94a3b8" }}>px</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #1c2541" }}>
                  <td style={{ padding: "10px 14px" }}>Bounding Box Height</td>
                  <td style={{ padding: "10px 14px", fontWeight: 600 }}>{m.bounding_height_pixels}</td>
                  <td style={{ padding: "10px 14px", color: "#94a3b8" }}>px</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #1c2541" }}>
                  <td style={{ padding: "10px 14px" }}>Contour Boundary Perimeter</td>
                  <td style={{ padding: "10px 14px", fontWeight: 600 }}>{m.perimeter_pixels}</td>
                  <td style={{ padding: "10px 14px", color: "#94a3b8" }}>px</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #1c2541" }}>
                  <td style={{ padding: "10px 14px" }}>Aspect Ratio (Width / Height)</td>
                  <td style={{ padding: "10px 14px", fontWeight: 600 }}>{m.aspect_ratio}</td>
                  <td style={{ padding: "10px 14px", color: "#94a3b8" }}>ratio</td>
                </tr>
                <tr>
                  <td style={{ padding: "10px 14px" }}>Image Surface Coverage</td>
                  <td style={{ padding: "10px 14px", fontWeight: 600 }}>{m.wound_coverage_percentage}%</td>
                  <td style={{ padding: "10px 14px", color: "#94a3b8" }}>%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Surrogate Healing Timeframe & Recovery Predictors */}
          <div style={{ marginBottom: "24px" }}>
            <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#00b4d8", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Clock size={16} />
              3. Surrogate Healing Timeframe & Recovery Predictors
            </h4>
            <div style={{ backgroundColor: "#0b132b", border: "1px solid #2a3860", borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <strong style={{ color: "#48cae4", fontSize: "13px" }}>• Early Trajectory Benchmark (2–4 Weeks):</strong>
                <p style={{ color: "#cbd5e1", marginTop: "2px" }}>
                  {timeframe.early_trajectory_benchmark || "Early wound area reduction within 2 to 4 weeks serves as a powerful surrogate predictor for complete wound closure."}
                </p>
              </div>

              <div>
                <strong style={{ color: "#48cae4", fontSize: "13px" }}>• Daily Area Reduction Velocity Range:</strong>
                <p style={{ color: "#cbd5e1", marginTop: "2px" }}>
                  {timeframe.daily_reduction_rate_range || "Observed clinical trial area reduction ranges from 0.20 cm²/day to 0.45 cm²/day depending on dressing material and debridement."}
                </p>
              </div>

              <div>
                <strong style={{ color: "#48cae4", fontSize: "13px" }}>• Recommended Monitoring Schedule:</strong>
                <p style={{ color: "#cbd5e1", marginTop: "2px" }}>
                  {timeframe.monitoring_recommendation || "Serial imaging at 7-day to 14-day intervals is recommended to evaluate wound healing trajectory."}
                </p>
              </div>
            </div>
          </div>

          {/* 4. Similar Literature Cases & Benchmark Studies */}
          {similarCases.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#00b4d8", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <BookOpen size={16} />
                4. Similar Clinical Literature & Benchmark Studies
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {similarCases.map((c, i) => (
                  <div key={i} style={{ backgroundColor: "#0b132b", border: "1px solid #2a3860", padding: "12px", borderRadius: "8px" }}>
                    <div style={{ fontSize: "11px", color: "#00b4d8", fontWeight: 700, marginBottom: "4px" }}>
                      {c.wound_type} (PMID: {c.pmid})
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#f8fafc", marginBottom: "4px" }}>{c.study_title}</div>
                    <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>"{c.key_finding}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Retrieved PubMed Literature Citations */}
          {citations.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#00b4d8", marginBottom: "12px" }}>
                5. Grounded PubMed Research References
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {citations.map((c, i) => (
                  <div key={i} style={{ backgroundColor: "#0b132b", border: "1px solid #2a3860", padding: "12px 14px", borderRadius: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <strong style={{ color: "#f8fafc" }}>[{i + 1}] {c.title}</strong>
                      <span style={{ fontSize: "11px", color: "#00b4d8" }}>PMID: {c.pmid}</span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "4px" }}>
                      Authors: {c.authors} | Journal: {c.journal} ({c.year})
                    </div>
                    <p style={{ fontSize: "11px", color: "#64748b", fontStyle: "italic", margin: 0 }}>
                      "{c.excerpt}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Persistent Research & Educational Disclaimer */}
          <div style={{
            backgroundColor: "#0b132b",
            border: "1px solid #f59e0b",
            borderRadius: "8px",
            padding: "14px",
            fontSize: "11px",
            color: "#94a3b8",
            marginTop: "20px"
          }}>
            <strong style={{ color: "#f59e0b" }}>Medical Safety Disclaimer:</strong> This document was automatically compiled by WoundTrack-RAG1 for research and educational assistance only. The spatial measurements (in pixels) and neural segmentation overlays represent artificial intelligence outputs and do not constitute a standalone clinical diagnosis or treatment prescription. All clinical decisions must be guided by a qualified healthcare professional.
          </div>
        </div>
      </div>
    </div>
  );
}
