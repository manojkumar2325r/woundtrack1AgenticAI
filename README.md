# WoundTrack-RAG1
## Multimodal AI for Wound Analysis and Progress Intelligence

WoundTrack-RAG1 is an interactive, full-stack AI research platform designed for automated wound image segmentation, quantitative spatial measurement calculation, serial multi-visit progress tracking, and citation-grounded medical knowledge retrieval.

---

## 🌟 Key Features

- **WSNet Neural Segmentation**: Pretrained multi-scale U-Net architecture (`best_wsnet.weights.h5`, ~187 MB) combining 9 local 64x64 spatial patches with a global 192x192 contextual branch.
- **In-Memory Model Singleton**: Loads the model **once** at application startup (~1.77s load time) and maintains it in memory for instant API inference (~394 ms CPU execution).
- **Derived Spatial Measurements**: Calculates non-zero wound surface area (`px²`), bounding box width & height (`px`), perimeter (`px`), aspect ratio, and image coverage (`%`).
- **Interactive Image Comparison Viewer**: View original image, binary segmentation mask, color overlay, or side-by-side comparison with a live **Opacity Slider (0–100%)** and Zoom/Reset controls.
- **PubMed RAG Literature Grounding**: Performs semantic retrieval against PubMed medical literature (`pubmed_articles.json`) to ground explanations with peer-reviewed article citations.
- **Multi-Visit Progression Intelligence**: Tracks serial surface area deltas and percentage changes across visits to visualize image-based progression trends over time.
- **Citation-Grounded AI Assistant**: Interactive chatbot panel allowing users to ask questions regarding measurements, healing predictors, and literature.
- **Official Printable Reports**: Generate and print official PDF reports containing image overlays, spatial metric tables, and PubMed citations.
- **Realtime Diagnostic Monitoring**: Health check endpoint and dashboard monitoring WSNet readiness, SQLite connection, RAG corpus status, and hardware compute mode.

---

## 🏗 System Architecture

```
                       REACT + VITE FRONTEND (Port 5173)
                                     |
                              REST API / HTTP
                                     |
                       FLASK BACKEND SERVER (Port 5000)
                                     |
         +---------------------------+---------------------------+
         |                           |                           |
         v                           v                           v
  WSNet Model Singleton      Wound Measurement Engine      PubMed RAG Service
(192x192 In-Memory Model)    (px² Area, Perimeter, etc.)  (pubmed_articles.json)
         |                           |                           |
         +---------------------------+---------------------------+
                                     |
                         SQLite Storage & Media Server
                        (uploads/, masks/, overlays/)
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js `v18+` & `npm`
- Python `3.11` with `wsnet_env` virtual environment created

### 1. One-Command Development Launcher (Windows PowerShell)
```powershell
.\start_woundtrack.ps1
```
This script launches both the Flask Backend Server and React Vite Frontend Server concurrently:
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **API Health**: `http://localhost:5000/api/health`

### 2. Manual Server Launch

#### Backend Server
```powershell
.\run_backend.ps1
# or manually:
& ".\wsnet_env\Scripts\python.exe" backend/app.py
```

#### Frontend Server
```powershell
.\run_frontend.ps1
# or manually:
cd frontend
npm run dev
```

---

## 🔬 WSNet Model Specifications

- **Architecture**: Dual-branch WSNet U-Net (9 local 64x64 patches + 1 global 192x192 branch)
- **Input Resolution**: `(192, 192, 3)` RGB float32 tensor
- **Output Resolution**: `(192, 192, 1)` Sigmoid activation mask
- **Pretrained Weights**: `vision/wsnet/checkpoints/best_wsnet.weights.h5` (~187 MB)
- **Diagnostic Validation Metrics**: Validation Dice: `0.4233` | Validation IoU: `0.2994`

---

## 🛡 Research & Educational Disclaimer

**IMPORTANT NOTICE**: WoundTrack-RAG1 is strictly built for research, educational, and technical demonstration purposes. Spatial metrics are reported in pixels (`px` / `px²`) due to the absence of camera physical scale calibration markers. The system does not provide clinical diagnoses, histological wound etiology determinations, or treatment plans. All findings should be reviewed by a qualified healthcare professional.
