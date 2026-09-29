import React from "react";
import { Maximize2, MoveHorizontal, MoveVertical, Shield, Compass, PieChart, Activity } from "lucide-react";

export default function MeasurementCards({ measurements }) {
  if (!measurements) return null;

  const cards = [
    {
      title: "Wound Area",
      value: `${measurements.wound_area_pixels?.toLocaleString()} px²`,
      detail: "Total non-zero pixel count",
      icon: Maximize2,
      color: "#00b4d8",
      bgColor: "rgba(0, 180, 216, 0.12)"
    },
    {
      title: "Bounding Width",
      value: `${measurements.bounding_width_pixels?.toLocaleString()} px`,
      detail: "Horizontal extent",
      icon: MoveHorizontal,
      color: "#48cae4",
      bgColor: "rgba(72, 202, 228, 0.12)"
    },
    {
      title: "Bounding Height",
      value: `${measurements.bounding_height_pixels?.toLocaleString()} px`,
      detail: "Vertical extent",
      icon: MoveVertical,
      color: "#90e0ef",
      bgColor: "rgba(144, 224, 239, 0.12)"
    },
    {
      title: "Boundary Perimeter",
      value: `${measurements.perimeter_pixels?.toLocaleString()} px`,
      detail: "Contour edge length",
      icon: Compass,
      color: "#10b981",
      bgColor: "rgba(16, 185, 129, 0.12)"
    },
    {
      title: "Aspect Ratio",
      value: measurements.aspect_ratio,
      detail: "Width / Height ratio",
      icon: Shield,
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.12)"
    },
    {
      title: "Image Coverage",
      value: `${measurements.wound_coverage_percentage}%`,
      detail: "Wound vs. Image ratio",
      icon: PieChart,
      color: "#a855f7",
      bgColor: "rgba(168, 85, 247, 0.12)"
    }
  ];

  return (
    <div style={{ marginTop: "20px" }}>
      <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#f8fafc", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
        <Activity size={18} color="#00b4d8" />
        Derived Spatial Measurements
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              style={{
                backgroundColor: "#1c2541",
                border: "1px solid #2a3860",
                borderRadius: "12px",
                padding: "16px",
                transition: "transform 0.15s ease, border-color 0.15s ease",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.borderColor = card.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "#2a3860";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500 }}>{card.title}</span>
                <div style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "8px",
                  backgroundColor: card.bgColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Icon size={16} color={card.color} />
                </div>
              </div>

              <div style={{ fontSize: "20px", fontWeight: 700, color: "#f8fafc", marginBottom: "4px" }}>
                {card.value}
              </div>

              <div style={{ fontSize: "11px", color: "#64748b" }}>
                {card.detail}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
