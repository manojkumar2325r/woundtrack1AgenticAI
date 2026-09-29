import React, { useState, useRef } from "react";
import { Upload, Camera, FileImage, X, Sparkles, AlertCircle } from "lucide-react";

export default function UploadZone({ onAnalyze, isLoading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [patientId, setPatientId] = useState("patient_01");
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split("T")[0]);
  const [cameraActive, setCameraActive] = useState(false);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/bmp"];
    if (!validTypes.includes(file.type)) {
      alert("Invalid file format. Please upload a valid image (PNG, JPG, JPEG, WEBP, BMP).");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      alert("File size exceeds 20MB limit.");
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Camera capture handlers
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Camera access denied or unavailable on this device.");
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const file = new File([blob], `captured_wound_${Date.now()}.jpg`, { type: "image/jpeg" });
      handleFile(file);
      stopCamera();
    }, "image/jpeg", 0.95);
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    onAnalyze({ file: selectedFile, patientId, visitDate });
  };

  return (
    <div style={{
      backgroundColor: "#1c2541",
      border: "1px solid #2a3860",
      borderRadius: "14px",
      padding: "24px",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)"
    }}>
      <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#f8fafc", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
        <FileImage size={18} color="#00b4d8" />
        Select Wound Image
      </h3>

      {/* Metadata Form Fields */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
        <div>
          <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>Patient / Session ID</label>
          <input
            type="text"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "10px 14px",
              backgroundColor: "#0b132b",
              border: "1px solid #2a3860",
              borderRadius: "8px",
              color: "#f8fafc",
              fontSize: "14px",
              outline: "none"
            }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>Visit Date</label>
          <input
            type="date"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "10px 14px",
              backgroundColor: "#0b132b",
              border: "1px solid #2a3860",
              borderRadius: "8px",
              color: "#f8fafc",
              fontSize: "14px",
              outline: "none"
            }}
          />
        </div>
      </div>

      {/* Drag & Drop Box */}
      {!previewUrl && !cameraActive && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragActive ? "#00b4d8" : "#2a3860"}`,
            backgroundColor: dragActive ? "rgba(0, 180, 216, 0.08)" : "#0b132b",
            borderRadius: "12px",
            padding: "40px 20px",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s ease-in-out"
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            accept="image/png, image/jpeg, image/jpg, image/webp, image/bmp"
            style={{ display: "none" }}
          />

          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "rgba(0, 180, 216, 0.15)",
            color: "#00b4d8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px auto"
          }}>
            <Upload size={26} />
          </div>

          <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#f8fafc", marginBottom: "6px" }}>
            Drag and drop your wound image here
          </h4>
          <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "16px" }}>
            Supports PNG, JPG, JPEG, WEBP, BMP up to 20MB
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              style={{
                backgroundColor: "#2a3860",
                color: "#f8fafc",
                fontSize: "13px",
                fontWeight: 500,
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer"
              }}
            >
              Browse Files
            </button>

            {navigator.mediaDevices && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); startCamera(); }}
                style={{
                  backgroundColor: "rgba(0, 180, 216, 0.2)",
                  color: "#00b4d8",
                  fontSize: "13px",
                  fontWeight: 500,
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #00b4d8",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <Camera size={14} />
                <span>Use Camera</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Camera Live Stream */}
      {cameraActive && (
        <div style={{ backgroundColor: "#0b132b", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
          <video ref={videoRef} autoPlay playsInline style={{ width: "100%", maxHeight: "300px", borderRadius: "8px" }} />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <div style={{ marginTop: "12px", display: "flex", justifyContent: "center", gap: "12px" }}>
            <button
              onClick={capturePhoto}
              style={{ backgroundColor: "#10b981", color: "#fff", border: "none", padding: "8px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}
            >
              Capture Photo
            </button>
            <button
              onClick={stopCamera}
              style={{ backgroundColor: "#ef4444", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Image Selected Preview */}
      {previewUrl && (
        <div style={{ backgroundColor: "#0b132b", borderRadius: "12px", padding: "16px", position: "relative" }}>
          <button
            onClick={handleClear}
            disabled={isLoading}
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              backgroundColor: "rgba(0,0,0,0.6)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <X size={16} />
          </button>

          <img
            src={previewUrl}
            alt="Wound Preview"
            style={{ width: "100%", maxHeight: "320px", objectFit: "contain", borderRadius: "8px", border: "1px solid #2a3860" }}
          />

          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8" }}>
            <span>FileName: {selectedFile.name}</span>
            <span>Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              width: "100%",
              marginTop: "16px",
              backgroundColor: isLoading ? "#2a3860" : "#00b4d8",
              color: isLoading ? "#94a3b8" : "#0b132b",
              fontWeight: 700,
              fontSize: "15px",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: isLoading ? "none" : "0 0 16px rgba(0,180,216,0.4)"
            }}
          >
            <Sparkles size={18} />
            <span>{isLoading ? "Analyzing Image..." : "Analyze Wound Image with WSNet"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
