import React, { useState } from "react";
import { Eye, Layers, Sliders, ZoomIn, ZoomOut, RotateCcw, Columns } from "lucide-react";
import { api } from "../services/api";

export default function ImageViewer({ images, dimensions }) {
  const [activeTab, setActiveTab] = useState("overlay"); // original, mask, overlay, split
  const [opacity, setOpacity] = useState(50); // 0 - 100
  const [zoom, setZoom] = useState(1);

  if (!images) return null;

  const originalUrl = api.getMediaUrl(images.original);
  const maskUrl = api.getMediaUrl(images.mask);
  const overlayUrl = api.getMediaUrl(images.overlay);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoom(1);

  return (
    <div style={{
      backgroundColor: "#1c2541",
      border: "1px solid #2a3860",
      borderRadius: "14px",
      overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
    }}>
      {/* Top Controls Bar */}
      <div style={{
        padding: "14px 20px",
        backgroundColor: "#0b132b",
        borderBottom: "1px solid #2a3860",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        {/* Mode Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {[
            { id: "overlay", label: "Overlay View", icon: Layers },
            { id: "original", label: "Original", icon: Eye },
            { id: "mask", label: "Binary Mask", icon: Layers },
            { id: "split", label: "Side-by-Side", icon: Columns },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: isActive ? "#00b4d8" : "#1c2541",
                  color: isActive ? "#0b132b" : "#94a3b8",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Zoom Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={handleZoomOut} style={btnStyle} title="Zoom Out"><ZoomOut size={14} /></button>
          <span style={{ fontSize: "12px", color: "#94a3b8", minWidth: "40px", textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
          <button onClick={handleZoomIn} style={btnStyle} title="Zoom In"><ZoomIn size={14} /></button>
          <button onClick={handleResetZoom} style={btnStyle} title="Reset"><RotateCcw size={14} /></button>
        </div>
      </div>

      {/* Opacity Slider Control (Only when in Overlay mode) */}
      {activeTab === "overlay" && (
        <div style={{
          padding: "10px 20px",
          backgroundColor: "#161e38",
          borderBottom: "1px solid #2a3860",
          display: "flex",
          alignItems: "center",
          gap: "16px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#00b4d8", fontWeight: 500 }}>
            <Sliders size={15} />
            <span>Mask Opacity:</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: "12px", color: "#f8fafc", fontWeight: 600, minWidth: "36px" }}>{opacity}%</span>
        </div>
      )}

      {/* Main Visual Display Area */}
      <div style={{
        padding: "20px",
        minHeight: "380px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0b132b",
        overflow: "hidden"
      }}>
        <div style={{
          transform: `scale(${zoom})`,
          transition: "transform 0.15s ease-out",
          maxWidth: "100%",
          display: "flex",
          justifyContent: "center",
          gap: "16px"
        }}>
          {activeTab === "split" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", width: "100%" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>Original Image</div>
                <img src={originalUrl} alt="Original" style={imgStyle} />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "#00b4d8", marginBottom: "6px" }}>WSNet Overlay</div>
                <img src={overlayUrl} alt="Overlay" style={imgStyle} />
              </div>
            </div>
          ) : activeTab === "original" ? (
            <img src={originalUrl} alt="Original Wound" style={imgStyle} />
          ) : activeTab === "mask" ? (
            <img src={maskUrl} alt="Binary Mask" style={{ ...imgStyle, filter: "contrast(1.2)" }} />
          ) : (
            /* Custom Opacity Blended Overlay View */
            <div style={{ position: "relative", display: "inline-block", borderRadius: "8px", overflow: "hidden" }}>
              <img src={originalUrl} alt="Base Original" style={imgStyle} />
              <img
                src={overlayUrl}
                alt="Overlay Blend"
                style={{
                  ...imgStyle,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  opacity: opacity / 100,
                  transition: "opacity 0.1s ease-out",
                  pointerEvents: "none"
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer Image Metadata */}
      {dimensions && (
        <div style={{
          padding: "10px 20px",
          backgroundColor: "#0b132b",
          borderTop: "1px solid #2a3860",
          fontSize: "12px",
          color: "#64748b",
          display: "flex",
          justifyContent: "space-between"
        }}>
          <span>Input Resolution: {dimensions.width} × {dimensions.height} px</span>
          <span>Segmentation Model: WSNet (192×192 U-Net Architecture)</span>
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  backgroundColor: "#1c2541",
  color: "#94a3b8",
  border: "1px solid #2a3860",
  borderRadius: "6px",
  padding: "6px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const imgStyle = {
  maxHeight: "360px",
  maxWidth: "100%",
  objectFit: "contain",
  borderRadius: "8px",
  border: "1px solid #2a3860"
};
