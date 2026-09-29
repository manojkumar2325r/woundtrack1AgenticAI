# Project Status: WoundTrack-RAG1

**Product Name:** WoundTrack-RAG1  
**Subtitle:** Multimodal AI for Wound Analysis and Progress Intelligence  
**Status Date:** September 21, 2026  

---

## 1. Existing Project Structure

```
WoundTrack-RAG1/
├── data/
│   ├── corpus/
│   │   └── pubmed_articles.json              # PubMed medical literature corpus
│   ├── processed/
│   │   ├── metadata.csv                      # Complete 2,686 matched image-mask pairs metadata
│   │   └── wsnet_splits/
│   │       ├── train.csv                     # 2,148 training pairs (80%)
│   │       ├── val.csv                       # 268 validation pairs (10%)
│   │       └── test.csv                      # 270 test pairs (10%)
│   ├── wound/
│   │   └── Lower Limb and Feet Wound Image Dataset...
│   └── wound_dataset/
│       ├── Nomal/                            # Control normal skin images
│       ├── wound_main/                       # 2,686 original wound RGB images (wound_main-XXXX.jpg)
│       └── wound_mask/                       # 2,686 ground truth binary segmentation masks (wound_mask-XXXX.jpg)
│
├── ingestion/
│   └── pubmed_downloader.py                  # Bio.Entrez scraper for PubMed wound literature
│
├── vision/
│   ├── prepare_dataset.py                    # Dataset validation, pairing, and metadata CSV builder
│   └── wsnet/
│       ├── check_data.py                     # Split verification utility
│       ├── check_mask_visual.py              # Visual inspection overlay script
│       ├── dataset.py                        # Dataset split generator script
│       ├── model.py                          # U-Net local & global encoder-decoder block definitions
│       ├── train.py                          # WSNet model training script with custom BCE + Dice loss
│       ├── wsnet_fusion.py                   # Multi-scale WSNet (9 local 64x64 patches + 1 global 192x192)
│       ├── wsnet_original.py                 # Reference architecture
│       └── checkpoints/
│           ├── best_wsnet.weights.h5         # Pretrained WSNet model checkpoint (~187 MB, verified working)
│           └── final_wsnet.weights.h5        # Final epoch WSNet model checkpoint (~187 MB)
│
├── venv/                                     # Virtual environment with Qdrant, BioPython, Pydantic
├── woundambit_env/                           # Secondary PyTorch / MedSeg virtual environment
└── wsnet_env/                                # Primary TensorFlow 2.13.1 environment for WSNet inference
```

---

## 2. Existing Working Components

1. **Dataset & Processing Pipeline**:
   - `vision/prepare_dataset.py` & `vision/wsnet/dataset.py` correctly index and split 2,686 wound image-mask pairs into 80/10/10 train/val/test sets.
2. **WSNet Model Architecture**:
   - `vision/wsnet/wsnet_fusion.py`: Multi-scale neural architecture combining 9 local 64x64 spatial patches with a global 192x192 contextual branch.
3. **Medical Data Ingestion**:
   - `ingestion/pubmed_downloader.py`: NCBI PubMed API query and extraction pipeline populating `data/corpus/pubmed_articles.json`.

---

## 3. Existing Models

- **WSNet (Wound Segmentation Network)**:
  - Input shape: `(192, 192, 3)`
  - Output shape: `(192, 192, 1)` (Sigmoid activation)
  - Loss Function: Combined Binary Cross Entropy + Dice Loss (`bce_dice_loss`)
  - Evaluated Metrics: `dice_metric` (Dice similarity coefficient), `iou_metric` (Intersection over Union)

---

## 4. Existing Checkpoints

- **Primary Inference Checkpoint**: `vision/wsnet/checkpoints/best_wsnet.weights.h5`
  - Weight File Size: 187,420,800 bytes (~187 MB)
  - Verified Runtime Status: Successfully loaded via `tf.keras.models.load_model` with custom loss objects.
  - Verified Inference Benchmark: Generates accurate 192x192 wound segmentation masks in ~2.0 seconds on CPU.
- **Secondary Checkpoint**: `vision/wsnet/checkpoints/final_wsnet.weights.h5` (~187 MB).

---

## 5. Existing APIs

- **Current State**: No backend REST API exists yet.
- **Action Plan**: Build a modular Flask API in `backend/` exposing `/api/health`, `/api/analyze`, `/api/history`, `/api/progression`, `/api/chat`, and `/api/report/{id}`.

---

## 6. Existing RAG Components

- **Raw Corpus**: `data/corpus/pubmed_articles.json` containing 10 indexed medical literature articles with titles, abstracts, PMIDs, DOIs, journals, and URLs.
- **Ingestion Script**: `ingestion/pubmed_downloader.py`.
- **Missing Action**: Vector embeddings generator, local Qdrant / FAISS / TF-IDF vector retrieval service, grounded answer synthesizer (`backend/services/rag_service.py`).

---

## 7. Existing Frontend Components

- **Current State**: No frontend application exists.
- **Action Plan**: Build a React + Vite application with modern healthcare UI, dark/light healthcare color scheme, image overlay opacity sliders, wound area metrics, progression tracking, interactive AI chat, history table, and PDF report export.

---

## 8. Existing Dependencies

- **Primary ML Environment (`wsnet_env`)**:
  - `TensorFlow`: 2.13.1
  - `NumPy`: 1.24.3
  - `OpenCV`: 4.8.1
  - `SciPy`: 1.10.1
  - `PyWavelets`: 1.4.1
  - `segmentation-models`: 1.0.1
  - `Pillow`: 12.3.0
- **Secondary Environment (`venv`)**:
  - `biopython`: 1.88
  - `qdrant-client`: 1.19.0
  - `pydantic`: 2.13.4
  - `pandas`: 3.0.5

---

## 9. Missing Components

1. **Backend REST Server (`backend/`)**:
   - `app.py`: Flask app entry point, CORS, logging, error sanitization.
   - `routes/`: `health.py`, `analysis.py`, `history.py`, `progression.py`, `chat.py`, `report.py`.
   - `services/`:
     - `wsnet_service.py`: Singleton WSNet loader & inference worker (loads once at startup).
     - `wound_measurement.py`: Area (px²), bounding box width/height, aspect ratio, perimeter, percentage of image.
     - `progression_service.py`: Multi-visit area comparison, % delta, trend analysis.
     - `rag_service.py`: Semantic vector search over PubMed corpus + citation generator.
     - `report_service.py`: PDF / HTML analysis report generator.
   - Data Layer: SQLite database (`backend/database.db`) storing analysis sessions, metrics, image paths, and chat threads.

2. **Frontend UI/UX (`frontend/`)**:
   - Modern React + Vite application with Tailwind / Vanilla CSS design tokens.
   - Pages: Landing Page, Dashboard, New Analysis Workspace, Progression Tracker, Analysis History, System Health Status, Report Preview.
   - Components: Upload Zone, Interactive Image Viewer (Original / Mask / Overlay with opacity slider & side-by-side zoom), Wound Measurement Cards, Progression Chart, RAG Citations List, AI Chatbot Drawer.

3. **Orchestration & Testing**:
   - `requirements.txt`: Unified backend dependencies.
   - `.env.example`: Configuration parameters.
   - PowerShell Run Scripts: `run_backend.ps1`, `run_frontend.ps1`, `start_woundtrack.ps1`.
   - Unit & Smoke Tests (`tests/`): Backend API tests, WSNet inference tests, RAG retrieval tests.

---

## 10. Potential Compatibility Problems & Mitigations

1. **Model Loading Method**:
   - *Risk*: Standard `model.load_weights()` throws `KeyError: 'vars'` because `best_wsnet.weights.h5` contains both model and optimizer states.
   - *Fix*: Load checkpoint via `tf.keras.models.load_model(checkpoint_path, custom_objects={'bce_dice_loss': bce_dice_loss, 'dice_metric': dice_metric, 'iou_metric': iou_metric})`. Verified working.
2. **PyWavelets / NumPy Version Constraints**:
   - *Risk*: NumPy >= 2.0 breaks TensorFlow 2.13.1 C-extensions.
   - *Fix*: Keep `wsnet_env` NumPy pinned at `1.24.3`.
3. **Model Warmup & Latency**:
   - *Risk*: Reloading WSNet on every request causes 2s delay and high memory allocation.
   - *Fix*: Load model as a singleton during backend application startup (`backend/services/wsnet_service.py`).
4. **Physical Calibration Disclaimer**:
   - *Risk*: Misleading users by reporting cm² without physical calibration markers.
   - *Fix*: Explicitly report measurements in pixels / px² and display persistent medical disclaimers ("Research/educational assistance only. Not a medical diagnosis").

---

## 11. Recommended Implementation Order

- **Phase 1 & 2**: Project Inspection & Status Reporting (`PROJECT_STATUS.md`) — [COMPLETED]
- **Phase 3 & 4**: Model Singleton Service & Image Pre/Post-processing (`backend/services/wsnet_service.py` & `wound_measurement.py`)
- **Phase 5 & 6 & 7**: Flask Backend REST API (`/api/health`, `/api/analyze`, `/api/history`, `/api/progression`) & Integration Smoke Test
- **Phase 8 & 9 & 10**: React + Vite Frontend Foundation, Image Viewer with Opacity Slider, and Analysis Cards
- **Phase 11 & 12**: Dashboard, History, and Progression Tracking Visualizations
- **Phase 13 & 14**: RAG Vector Search & Medical Knowledge AI Chat Assistant with Citations
- **Phase 15**: Report Generation & Export (PDF / CSV / JSON)
- **Phase 16 & 17**: End-to-End Automated Testing & Optimization
- **Phase 18 & 19**: Documentation (`README.md`, `docs/API.md`), One-Command Launchers (`start_woundtrack.ps1`)
