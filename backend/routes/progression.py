from flask import Blueprint, request, jsonify
from services.progression_service import calculate_wound_progression
import db

progression_bp = Blueprint("progression", __name__)

@progression_bp.route("/progression", methods=["POST"])
def get_progression():
    """
    Calculates multi-visit wound progression.
    Accepts JSON body: {"patient_id": "patient_01"} or {"analysis_ids": ["wt_1", "wt_2"]}
    """
    data = request.get_json(silent=True) or {}
    patient_id = data.get("patient_id")
    analysis_ids = data.get("analysis_ids")

    visits = []
    
    if analysis_ids and isinstance(analysis_ids, list):
        for aid in analysis_ids:
            record = db.get_analysis_by_id(aid)
            if record:
                visits.append({
                    "id": record["id"],
                    "created_at": record["created_at"],
                    "visit_date": record["visit_date"],
                    "wound_area_pixels": record["area_pixels"],
                    "width_pixels": record["width_pixels"],
                    "height_pixels": record["height_pixels"]
                })
    elif patient_id:
        all_records = db.get_all_analyses(limit=100)
        patient_records = [r for r in all_records if r.get("patient_id") == patient_id]
        for record in patient_records:
            visits.append({
                "id": record["id"],
                "created_at": record["created_at"],
                "visit_date": record["visit_date"],
                "wound_area_pixels": record["area_pixels"],
                "width_pixels": record["width_pixels"],
                "height_pixels": record["height_pixels"]
            })
    else:
        # Fallback to all historical records
        all_records = db.get_all_analyses(limit=100)
        for record in all_records:
            visits.append({
                "id": record["id"],
                "created_at": record["created_at"],
                "visit_date": record["visit_date"],
                "wound_area_pixels": record["area_pixels"],
                "width_pixels": record["width_pixels"],
                "height_pixels": record["height_pixels"]
            })

    result = calculate_wound_progression(visits)
    return jsonify({"success": True, "progression": result}), 200
