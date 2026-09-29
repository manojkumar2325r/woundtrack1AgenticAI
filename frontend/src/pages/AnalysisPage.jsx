import React, { useState, useEffect } from "react";
import UploadZone from "../components/UploadZone";
import ProcessingStepper from "../components/ProcessingStepper";
import ImageViewer from "../components/ImageViewer";
import MeasurementCards from "../components/MeasurementCards";
import KnowledgeCards from "../components/KnowledgeCards";
import AIChatDrawer from "../components/AIChatDrawer";
import ReportPreviewModal from "../components/ReportPreviewModal";
import { api } from "../services/api";
import { FileText, Sparkles, AlertCircle, RefreshCw } from "lucide-react";

export default function AnalysisPage({ selectedAnalysisId, setSelectedAnalysisId }) {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // Load analysis by ID if passed from history/dashboard
  useEffect(() => {
    if (selectedAnalysisId) {
      loadAnalysisById(selectedAnalysisId);
    }
  }, [selectedAnalysisId]);

  const loadAnalysisById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAnalysis(id);
      setAnalysisData(data);
    } catch (err) {
      setError(`Unable to load analysis '${id}': ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeUpload = async ({ file, patientId, visitDate }) => {
    setLoading(true);
    setError(null);
    setAnalysisData(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("patient_id", patientId);
    formData.append("visit_date", visitDate);

    try {
      const result = await api.analyzeWound(formData);
      setAnalysisData(result);
      if (setSelectedAnalysisId) setSelectedAnalysisId(result.analysis_id);
    } catch (err) {
      setError(err.message || "An unexpected error occurred during wound analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisData(null);
    setError(null);
    if (setSelectedAnalysisId) setSelectedAnalysisId(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner / Stepper Info */}
      <div style={{
        backgroundColor: "#1c2541",
        border: "1px solid #2a3860",
        borderRadius: "14px",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#f8fafc", margin: 0 }}>
            Wound Analysis Workspace
          </h2>
          <p style={{ fontSize: "12px", color: "#94a3b8", margin: "2px 0 0 0" }}>
            STEP 1: Upload Image → STEP 2: WSNet Segmentation → STEP 3: Measurements → STEP 4: RAG Knowledge → STEP 5: Report
          </p>
        </div>

        {analysisData && (
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setShowReportModal(true)}
              style={{
                backgroundColor: "#00b4d8",
                color: "#0b132b",
                fontWeight: 700,
                fontSize: "13px",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <FileText size={16} />
              <span>Generate Official Report</span>
            </button>

            <button
              onClick={handleReset}
              style={{
                backgroundColor: "#2a3860",
                color: "#f8fafc",
                fontSize: "13px",
                padding: "8px 14px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <RefreshCw size={14} />
              <span>New Analysis</span>
            </button>
          </div>
        )}
      </div>

      {/* Error Message Alert */}
      {error && (
        <div style={{
          backgroundColor: "rgba(239, 68, 68, 0.15)",
          border: "1px solid #ef4444",
          borderRadius: "12px",
          padding: "16px 20px",
          color: "#f8fafc",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <AlertCircle size={22} color="#ef4444" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: "#ef4444", fontSize: "14px", display: "block" }}>Analysis Processing Error</strong>
            <span style={{ fontSize: "13px", color: "#cbd5e1" }}>{error}</span>
          </div>
        </div>
      )}

      {/* Main Grid Content */}
      {loading ? (
        <ProcessingStepper />
      ) : !analysisData ? (
        /* Before Analysis: Upload Zone */
        <UploadZone onAnalyze={handleAnalyzeUpload} isLoading={loading} />
      ) : (
        /* After Analysis: Full Results Display Workspace */
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
          {/* 1. Image Viewer Component (Original, Mask, Overlay with Opacity Slider & Zoom) */}
          <ImageViewer
            images={analysisData.images}
            dimensions={analysisData.image_dimensions}
          />

          {/* 2. Derived Spatial Measurements Cards */}
          <MeasurementCards measurements={analysisData.measurements} />

          {/* 3. Image-Based AI Observations Panel */}
          <div style={{
            backgroundColor: "#1c2541",
            border: "1px solid #2a3860",
            borderRadius: "14px",
            padding: "20px"
          }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#f8fafc", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={18} color="#00b4d8" />
              Image-Based AI Observations
            </h3>
            <p style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.6" }}>
              The WSNet segmentation neural network identified a continuous wound boundary occupying{" "}
              <strong style={{ color: "#00b4d8" }}>{analysisData.measurements?.wound_area_pixels?.toLocaleString()} px²</strong>{" "}
              ({analysisData.measurements?.wound_coverage_percentage}% of total image surface).
              The bounding extent is {analysisData.measurements?.bounding_width_pixels} × {analysisData.measurements?.bounding_height_pixels} px
              with a calculated perimeter of {analysisData.measurements?.perimeter_pixels} px.
            </p>
            <div style={{ marginTop: "12px", fontSize: "11px", color: "#64748b", borderTop: "1px solid #2a3860", paddingTop: "8px" }}>
              Disclaimer: Model output represents image segmentation boundaries. It does not determine histological wound etiology or infection status.
            </div>
          </div>

          {/* 4. RAG PubMed Grounding Literature Cards */}
          <KnowledgeCards ragData={analysisData.rag} />

          {/* 5. Interactive RAG AI Chat Assistant Drawer */}
          <AIChatDrawer currentAnalysisId={analysisData.analysis_id} />
        </div>
      )}

      {/* Printable Report Preview Modal */}
      {showReportModal && (
        <ReportPreviewModal
          analysisData={analysisData}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
