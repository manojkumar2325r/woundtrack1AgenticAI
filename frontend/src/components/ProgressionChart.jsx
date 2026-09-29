import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingDown, TrendingUp, Minus, Calendar, AlertCircle } from "lucide-react";

export default function ProgressionChart({ progressionData }) {
  if (!progressionData || !progressionData.visits || progressionData.visits.length === 0) {
    return (
      <div style={{
        backgroundColor: "#1c2541",
        border: "1px solid #2a3860",
        borderRadius: "14px",
        padding: "32px",
        textAlign: "center",
        color: "#94a3b8"
      }}>
        <AlertCircle size={32} color="#00b4d8" style={{ margin: "0 auto 12px auto" }} />
        <h4 style={{ color: "#f8fafc", fontSize: "16px", marginBottom: "6px" }}>No Multi-Visit Progression Data Yet</h4>
        <p style={{ fontSize: "13px" }}>
          Upload multiple wound images over serial visits for a patient to visualize image-based surface area trends.
        </p>
      </div>
    );
  }

  const visits = progressionData.visits;
  const chartData = visits.map((v) => ({
    name: `Visit ${v.visit_index}`,
    date: v.visit_date || `Visit ${v.visit_index}`,
    area: v.wound_area_pixels,
    change: v.percentage_change
  }));

  const overallPct = progressionData.overall_change_percentage;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Overview Stat Box */}
      <div style={{
        backgroundColor: "#1c2541",
        border: "1px solid #2a3860",
        borderRadius: "14px",
        padding: "20px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px"
      }}>
        <div>
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>Total Tracked Visits</span>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#f8fafc" }}>{progressionData.total_visits} Visits</div>
        </div>

        <div>
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>Baseline Area</span>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#f8fafc" }}>{progressionData.baseline_area_pixels?.toLocaleString()} px²</div>
        </div>

        <div>
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>Latest Area</span>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#f8fafc" }}>{progressionData.latest_area_pixels?.toLocaleString()} px²</div>
        </div>

        <div>
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>Observed Area Change</span>
          <div style={{
            fontSize: "24px",
            fontWeight: 700,
            color: overallPct < 0 ? "#10b981" : overallPct > 0 ? "#ef4444" : "#94a3b8",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            {overallPct < 0 ? <TrendingDown size={22} /> : overallPct > 0 ? <TrendingUp size={22} /> : <Minus size={22} />}
            <span>{overallPct > 0 ? `+${overallPct}%` : `${overallPct}%`}</span>
          </div>
        </div>
      </div>

      {/* Surface Area Trend Line Chart */}
      <div style={{
        backgroundColor: "#1c2541",
        border: "1px solid #2a3860",
        borderRadius: "14px",
        padding: "20px"
      }}>
        <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#f8fafc", marginBottom: "16px" }}>
          Observed Wound Area Trend (px²)
        </h4>

        <div style={{ width: "100%", height: "260px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00b4d8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00b4d8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3860" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: "#0b132b", borderColor: "#2a3860", borderRadius: "8px", color: "#f8fafc" }}
                formatter={(value) => [`${value.toLocaleString()} px²`, "Wound Area"]}
              />
              <Area type="monotone" dataKey="area" stroke="#00b4d8" strokeWidth={3} fillOpacity={1} fill="url(#areaColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Timeline Visit Sequence */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#f8fafc" }}>Visit Timeline Details</h4>
        {visits.map((v, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: "#1c2541",
              border: "1px solid #2a3860",
              borderRadius: "10px",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "#0b132b",
                border: "1px solid #00b4d8",
                color: "#00b4d8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "13px"
              }}>
                V{v.visit_index}
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#f8fafc" }}>
                  Visit {v.visit_index} — {v.visit_date || "Date Unspecified"}
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Wound Surface Area: {v.wound_area_pixels?.toLocaleString()} px²
                </div>
              </div>
            </div>

            <div style={{
              fontSize: "13px",
              fontWeight: 600,
              color: v.percentage_change < 0 ? "#10b981" : v.percentage_change > 0 ? "#ef4444" : "#94a3b8",
              backgroundColor: "#0b132b",
              padding: "4px 10px",
              borderRadius: "6px"
            }}>
              {v.visit_index === 1 ? "Baseline Visit" : `${v.percentage_change > 0 ? "+" : ""}${v.percentage_change}%`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
