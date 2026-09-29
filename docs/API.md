# WoundTrack-RAG1 REST API Documentation

**Base URL**: `http://localhost:5000/api`  
**Content-Type**: `application/json` (except image upload endpoint `multipart/form-data`)

---

## Endpoints Summary

### 1. Health Check & Diagnostics
- **Method**: `GET`
- **Endpoint**: `/health`
- **Description**: Returns system health status, WSNet model state, load latency, and compute device.
- **Response**: `200 OK`
```json
{
  "status": "online",
  "timestamp": "2026-09-21 22:44:46",
  "components": {
    "wsnet_model": {
      "status": "ready",
      "checkpoint": "best_wsnet.weights.h5",
      "load_time_seconds": 1.775,
      "compute_device": "CPU"
    },
    "rag_engine": {
      "status": "ready",
      "corpus_documents": 10
    },
    "database": {
      "status": "connected"
    }
  }
}
```

---

### 2. Analyze Wound Image
- **Method**: `POST`
- **Endpoint**: `/analyze`
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `image` (File, Required): Image file (`.png`, `.jpg`, `.jpeg`, `.webp`, `.bmp`). Max 20MB.
  - `patient_id` (String, Optional): Patient identifier. Default `patient_01`.
  - `visit_date` (String, Optional): ISO date string (`YYYY-MM-DD`).
- **Response**: `201 Created`
```json
{
  "success": true,
  "analysis_id": "wt_20260921_224446_d26913",
  "created_at": "2026-09-21T22:44:46.123456",
  "patient_id": "patient_01",
  "visit_date": "2026-09-21",
  "original_filename": "wound_main-0001.jpg",
  "images": {
    "original": "/api/media/uploads/wt_20260921_224446_d26913.jpg",
    "mask": "/api/media/masks/wt_20260921_224446_d26913_mask.png",
    "overlay": "/api/media/overlays/wt_20260921_224446_d26913_overlay.jpg"
  },
  "image_dimensions": { "width": 360, "height": 304 },
  "segmentation": {
    "model": "WSNet",
    "status": "completed",
    "threshold": 0.5,
    "inference_time_seconds": 0.3944
  },
  "measurements": {
    "wound_area_pixels": 19419,
    "bounding_width_pixels": 205,
    "bounding_height_pixels": 206,
    "perimeter_pixels": 1536.74,
    "aspect_ratio": 1.0,
    "total_image_pixels": 109600,
    "wound_coverage_percentage": 17.72,
    "units": { "area": "px²", "dimensions": "px", "perimeter": "px" }
  },
  "rag": {
    "status": "completed",
    "answer": "Based on published medical literature...",
    "citations": [
      {
        "citation_id": 1,
        "title": "Impact of oral nutritional supplement composition on healing...",
        "authors": "Allan Carlos Soares et al.",
        "journal": "Nutrition",
        "year": "2024",
        "pmid": "38696907",
        "url": "https://pubmed.ncbi.nlm.nih.gov/38696907/"
      }
    ]
  },
  "processing_time_seconds": 0.4732
}
```

---

### 3. Get Single Analysis
- **Method**: `GET`
- **Endpoint**: `/analysis/{analysis_id}`
- **Response**: `200 OK`

---

### 4. Analysis History List
- **Method**: `GET`
- **Endpoint**: `/history?limit=50&offset=0`
- **Response**: `200 OK`

---

### 5. Multi-Visit Progression Trend
- **Method**: `POST`
- **Endpoint**: `/progression`
- **Payload**: `{"patient_id": "patient_01"}`
- **Response**: `200 OK`

---

### 6. RAG AI Assistant Dialogue
- **Method**: `POST`
- **Endpoint**: `/chat`
- **Payload**: `{"message": "What does the wound area measurement mean?", "analysis_id": "wt_123"}`
- **Response**: `200 OK`

---

### 7. Static Media Asset Serving
- **Method**: `GET`
- **Endpoint**: `/media/{asset_type}/{filename}`
- **Asset Types**: `uploads`, `masks`, `overlays`
