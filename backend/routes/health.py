import time
import tensorflow as tf
from flask import Blueprint, jsonify
from services.wsnet_service import wsnet_service
from services.rag_service import rag_service
from config import CHECKPOINT_PATH, DATABASE_PATH

health_bp = Blueprint("health", __name__)

@health_bp.route("/health", methods=["GET"])
def health_check():
    """Returns real-time system status and diagnostics."""
    wsnet_status = "ready" if wsnet_service.is_ready() else "not_loaded"
    rag_status = "ready" if len(rag_service._articles) > 0 else "degraded"
    
    # Check GPU availability
    gpus = tf.config.list_physical_devices("GPU")
    compute_device = "GPU (" + gpus[0].name + ")" if gpus else "CPU"
    
    return jsonify({
        "status": "online",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "components": {
            "wsnet_model": {
                "status": wsnet_status,
                "checkpoint": str(CHECKPOINT_PATH.name),
                "load_time_seconds": wsnet_service._load_time_sec,
                "compute_device": compute_device
            },
            "rag_engine": {
                "status": rag_status,
                "corpus_documents": len(rag_service._articles)
            },
            "database": {
                "status": "connected" if DATABASE_PATH.parent.exists() else "error"
            }
        },
        "disclaimer": "AI research platform only. Not for standalone clinical diagnosis."
    }), 200
