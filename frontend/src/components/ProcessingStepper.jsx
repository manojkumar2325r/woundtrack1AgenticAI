import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Cpu, Brain, Layers, Ruler, BookOpen } from "lucide-react";

export default function ProcessingStepper() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: "Uploading Image", icon: Layers, detail: "Transferring binary payload to backend" },
    { label: "WSNet Preprocessing", icon: Cpu, detail: "Scaling 192x192 RGB tensor & normalizing" },
    { label: "Neural Inference", icon: Brain, detail: "Executing WSNet 10-layer U-Net model" },
    { label: "Spatial Measurement", icon: Ruler, detail: "Computing area (px²), perimeter & aspect ratio" },
    { label: "PubMed RAG Retrieval", icon: BookOpen, detail: "Searching medical literature corpus" },
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 100);
    const timer2 = setTimeout(() => setCurrentStep(2), 400);
    const timer3 = setTimeout(() => setCurrentStep(3), 800);
    const timer4 = setTimeout(() => setCurrentStep(4), 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <div style={{
      backgroundColor: "#1c2541",
      border: "1px solid #2a3860",
      borderRadius: "14px",
      padding: "32px 24px",
      textAlign: "center"
    }}>
      <div style={{
        width: "64px",
        height: "64px",
        borderRadius: "50%",
        backgroundColor: "rgba(0, 180, 216, 0.15)",
        color: "#00b4d8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 16px auto",
        boxShadow: "0 0 20px rgba(0, 180, 216, 0.3)"
      }}>
        <Loader2 size={32} className="animate-spin-slow" />
      </div>

      <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#f8fafc", marginBottom: "6px" }}>
        Analyzing Wound Image with WSNet
      </h3>
      <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "28px" }}>
        Executing neural segmentation and grounded medical knowledge retrieval...
      </p>

      {/* Stepper Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "480px", margin: "0 auto" }}>
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "12px 16px",
                borderRadius: "10px",
                backgroundColor: isCurrent ? "rgba(0, 180, 216, 0.1)" : isDone ? "#0b132b" : "transparent",
                border: `1px solid ${isCurrent ? "#00b4d8" : isDone ? "#2a3860" : "transparent"}`,
                transition: "all 0.2s ease"
              }}
            >
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: isDone ? "#10b981" : isCurrent ? "#00b4d8" : "#2a3860",
                color: isDone || isCurrent ? "#0b132b" : "#94a3b8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "14px"
              }}>
                {isDone ? <CheckCircle2 size={18} color="#0b132b" /> : isCurrent ? <Loader2 size={16} style={{ animation: "spin 1.5s linear infinite" }} /> : idx + 1}
              </div>

              <div style={{ textAlign: "left", flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: isCurrent ? "#00b4d8" : isDone ? "#f8fafc" : "#94a3b8" }}>
                  {step.label}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>{step.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
