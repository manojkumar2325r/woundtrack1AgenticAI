import os
import uuid
import time
import json
import logging
from datetime import datetime
import cv2
import numpy as np
from flask import Blueprint, request, jsonify
from config import UPLOAD_DIR, MASK_DIR, OVERLAY_DIR
from services.wsnet_service import wsnet_service
from services.wound_measurement import calculate_wound_measurements
from services.rag_service import rag_service
import db

analysis_bp = Blueprint("analysis", __name__)
logger = logging.getLogger("woundtrack.analysis")

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB limit

@analysis_bp.route("/analyze", methods=["POST"])
def analyze_wound_image():
    """Endpoint to upload a wound image, run WSNet inference, calculate spatial metrics, and perform RAG lookup."""
    start_time = time.time()
    
    # 1. Validate File Presence
    if "image" not in request.files and "file" not in request.files:
        return jsonify({
            "success": False,
            "error": {
                "code": "MISSING_IMAGE_FILE",
                "message": "No image file provided in multipart request. Use form field key 'image'."
            }
        }), 400

    file = request.files.get("image") or request.files.get("file")
    
    if not file or file.filename == "":
        return jsonify({
            "success": False,
            "error": {
                "code": "EMPTY_FILENAME",
                "message": "Uploaded file has an empty filename."
            }
        }), 400

    # 2. Validate File Extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return jsonify({
            "success": False,
            "error": {
                "code": "UNSUPPORTED_FILE_TYPE",
                "message": f"Unsupported image extension '{ext}'. Allowed extensions: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
            }
        }), 400

    # 3. Read image bytes & check size
    file_bytes = file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        return jsonify({
            "success": False,
            "error": {
                "code": "FILE_TOO_LARGE",
                "message": f"File size exceeds limit of 20MB. Received {len(file_bytes) / (1024*1024):.2f}MB."
            }
        }), 400

    # 4. Decode image via OpenCV
    np_arr = np.frombuffer(file_bytes, np.uint8)
    img_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    
    if img_bgr is None:
        return jsonify({
            "success": False,
            "error": {
                "code": "UNREADABLE_IMAGE",
                "message": "The uploaded file could not be decoded as a valid image."
            }
        }), 400

    image_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    
    # 5. Generate unique analysis ID
    analysis_id = f"wt_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"
    patient_id = request.form.get("patient_id", "patient_01")
    visit_date = request.form.get("visit_date", datetime.now().strftime("%Y-%m-%d"))

    # 6. Save original image to disk
    original_filename = f"{analysis_id}{ext}"
    original_save_path = UPLOAD_DIR / original_filename
    cv2.imwrite(str(original_save_path), cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR))

    # 7. Run WSNet Model Inference
    try:
        inference_result = wsnet_service.predict(image_rgb)
    except Exception as e:
        logger.error("WSNet inference error: %s", str(e), exc_info=True)
        return jsonify({
            "success": False,
            "error": {
                "code": "MODEL_INFERENCE_ERROR",
                "message": f"Failed to execute WSNet model inference: {str(e)}"
            }
        }), 500

    binary_mask = inference_result["binary_mask_orig"]
    overlay_rgb = inference_result["overlay_orig"]

    # 8. Save Mask and Overlay images
    mask_filename = f"{analysis_id}_mask.png"
    mask_save_path = MASK_DIR / mask_filename
    cv2.imwrite(str(mask_save_path), binary_mask)

    overlay_filename = f"{analysis_id}_overlay.jpg"
    overlay_save_path = OVERLAY_DIR / overlay_filename
    cv2.imwrite(str(overlay_save_path), cv2.cvtColor(overlay_rgb, cv2.COLOR_RGB2BGR))

    # 9. Calculate Wound Spatial Measurements
    measurements = calculate_wound_measurements(binary_mask)

    # 10. Perform RAG Medical Knowledge Retrieval
    rag_query = f"chronic wound healing area reduction measurement {measurements['wound_area_pixels']} pixels"
    rag_response = rag_service.generate_grounded_answer(rag_query, {"measurements": measurements})

    processing_time = round(time.time() - start_time, 4)

    # Build relative API media URLs for frontend consuming
    original_url = f"/api/media/uploads/{original_filename}"
    mask_url = f"/api/media/masks/{mask_filename}"
    overlay_url = f"/api/media/overlays/{overlay_filename}"

    response_payload = {
        "success": True,
        "analysis_id": analysis_id,
        "created_at": datetime.now().isoformat(),
        "patient_id": patient_id,
        "visit_date": visit_date,
        "original_filename": file.filename,
        "images": {
            "original": original_url,
            "mask": mask_url,
            "overlay": overlay_url
        },
        "image_dimensions": inference_result["original_dimensions"],
        "segmentation": {
            "model": "WSNet",
            "status": "completed",
            "confidence": "high",
            "threshold": 0.5,
            "inference_time_seconds": inference_result["inference_time_seconds"]
        },
        "measurements": measurements,
        "rag": {
            "status": "completed",
            "answer": rag_response["answer"],
            "citations": rag_response["citations"],
            "similar_cases": rag_response["similar_cases"],
            "healing_timeframe_insights": rag_response["healing_timeframe_insights"]
        },
        "processing_time_seconds": processing_time,
        "disclaimer": "AI-assisted wound image analysis. This system is for research/educational assistance and does not replace professional medical diagnosis."
    }

    # 11. Persist Analysis Record into SQLite DB
    try:
        db.save_analysis({
            "analysis_id": analysis_id,
            "patient_id": patient_id,
            "visit_date": visit_date,
            "original_filename": file.filename,
            "image_path": str(original_save_path),
            "mask_path": str(mask_save_path),
            "overlay_path": str(overlay_save_path),
            "image_dimensions": inference_result["original_dimensions"],
            "measurements": measurements,
            "processing_time_seconds": processing_time,
            "status": "completed",
            "metadata": response_payload
        })
    except Exception as db_err:
        logger.error("Failed to save analysis to database: %s", str(db_err))

    return jsonify(response_payload), 201


@analysis_bp.route("/analysis/<analysis_id>", methods=["GET"])
def get_analysis_by_id(analysis_id):
    """Retrieves a single analysis by ID."""
    record = db.get_analysis_by_id(analysis_id)
    if not record:
        return jsonify({
            "success": False,
            "error": {
                "code": "ANALYSIS_NOT_FOUND",
                "message": f"No analysis found with ID '{analysis_id}'."
            }
        }), 404

    # Extract stored metadata_json
    metadata = {}
    if record.get("metadata_json"):
        try:
            metadata = json.loads(record["metadata_json"])
        except Exception:
            metadata = {}

    original_filename = os.path.basename(record["image_path"])
    mask_filename = os.path.basename(record["mask_path"])
    overlay_filename = os.path.basename(record["overlay_path"])

    rag_data = metadata.get("rag")
    if not rag_data:
        # Generate RAG if missing in legacy records
        measurements = {
            "wound_area_pixels": record["area_pixels"],
            "bounding_width_pixels": record["width_pixels"],
            "bounding_height_pixels": record["height_pixels"]
        }
        rag_resp = rag_service.generate_grounded_answer("chronic wound area reduction", {"measurements": measurements})
        rag_data = {
            "status": "completed",
            "answer": rag_resp["answer"],
            "citations": rag_resp["citations"],
            "similar_cases": rag_resp["similar_cases"],
            "healing_timeframe_insights": rag_resp["healing_timeframe_insights"]
        }

    return jsonify({
        "success": True,
        "analysis_id": record["id"],
        "created_at": record["created_at"],
        "patient_id": record["patient_id"],
        "visit_date": record["visit_date"],
        "images": {
            "original": f"/api/media/uploads/{original_filename}",
            "mask": f"/api/media/masks/{mask_filename}",
            "overlay": f"/api/media/overlays/{overlay_filename}"
        },
        "image_dimensions": {
            "width": record["image_width"],
            "height": record["image_height"]
        },
        "measurements": {
            "wound_area_pixels": record["area_pixels"],
            "bounding_width_pixels": record["width_pixels"],
            "bounding_height_pixels": record["height_pixels"],
            "perimeter_pixels": record["perimeter_pixels"],
            "aspect_ratio": record["aspect_ratio"],
            "total_image_pixels": record["image_width"] * record["image_height"],
            "wound_coverage_percentage": record["coverage_percentage"],
            "units": {"area": "px²", "dimensions": "px", "perimeter": "px"}
        },
        "rag": rag_data,
        "processing_time_seconds": record["inference_time_seconds"],
        "status": record["status"]
    }), 200


@analysis_bp.route("/history", methods=["GET"])
def get_history():
    """Returns analysis history list."""
    limit = request.args.get("limit", default=50, type=int)
    offset = request.args.get("offset", default=0, type=int)
    records = db.get_all_analyses(limit=limit, offset=offset)

    formatted = []
    for r in records:
        orig_fn = os.path.basename(r["image_path"])
        mask_fn = os.path.basename(r["mask_path"])
        overlay_fn = os.path.basename(r["overlay_path"])

        metadata = {}
        if r.get("metadata_json"):
            try:
                metadata = json.loads(r["metadata_json"])
            except Exception:
                metadata = {}

        rag_data = metadata.get("rag")
        if not rag_data:
            measurements = {
                "wound_area_pixels": r["area_pixels"],
                "bounding_width_pixels": r["width_pixels"],
                "bounding_height_pixels": r["height_pixels"]
            }
            rag_resp = rag_service.generate_grounded_answer("chronic wound area reduction", {"measurements": measurements})
            rag_data = {
                "status": "completed",
                "answer": rag_resp["answer"],
                "citations": rag_resp["citations"],
                "similar_cases": rag_resp["similar_cases"],
                "healing_timeframe_insights": rag_resp["healing_timeframe_insights"]
            }
        
        formatted.append({
            "analysis_id": r["id"],
            "created_at": r["created_at"],
            "patient_id": r["patient_id"],
            "visit_date": r["visit_date"],
            "original_filename": r["original_filename"],
            "images": {
                "original": f"/api/media/uploads/{orig_fn}",
                "mask": f"/api/media/masks/{mask_fn}",
                "overlay": f"/api/media/overlays/{overlay_fn}"
            },
            "image_dimensions": {
                "width": r["image_width"],
                "height": r["image_height"]
            },
            "measurements": {
                "wound_area_pixels": r["area_pixels"],
                "bounding_width_pixels": r["width_pixels"],
                "bounding_height_pixels": r["height_pixels"],
                "perimeter_pixels": r["perimeter_pixels"],
                "aspect_ratio": r["aspect_ratio"],
                "wound_coverage_percentage": r["coverage_percentage"],
                "units": {"area": "px²", "dimensions": "px", "perimeter": "px"}
            },
            "rag": rag_data
        })

    return jsonify({
        "success": True,
        "total": len(formatted),
        "history": formatted
    }), 200


@analysis_bp.route("/history/<analysis_id>", methods=["DELETE"])
def delete_history_item(analysis_id):
    """Deletes an analysis record."""
    deleted = db.delete_analysis_by_id(analysis_id)
    if not deleted:
        return jsonify({
            "success": False,
            "error": {
                "code": "NOT_FOUND",
                "message": f"Analysis ID '{analysis_id}' not found."
            }
        }), 404

    return jsonify({"success": True, "message": f"Analysis '{analysis_id}' deleted."}), 200
