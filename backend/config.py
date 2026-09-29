import os
from pathlib import Path

# Project root: C:\Users\manoj\Desktop\WoundTrack-RAG1
BASE_DIR = Path(__file__).resolve().parent.parent

# Model Checkpoint Path
CHECKPOINT_PATH = BASE_DIR / "vision" / "wsnet" / "checkpoints" / "best_wsnet.weights.h5"

# Upload and Generated Asset Paths
MEDIA_DIR = BASE_DIR / "data" / "user_data"
UPLOAD_DIR = MEDIA_DIR / "uploads"
MASK_DIR = MEDIA_DIR / "masks"
OVERLAY_DIR = MEDIA_DIR / "overlays"

# Ensure media directories exist
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MASK_DIR.mkdir(parents=True, exist_ok=True)
OVERLAY_DIR.mkdir(parents=True, exist_ok=True)

# SQLite Database Path
DATABASE_PATH = MEDIA_DIR / "woundtrack.db"

# Model Hyperparameters
IMAGE_SIZE = 192

# Server Configuration
PORT = 5000
HOST = "0.0.0.0"
DEBUG = True
