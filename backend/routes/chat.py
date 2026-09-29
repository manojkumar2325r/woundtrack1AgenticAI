from flask import Blueprint, request, jsonify
from services.rag_service import rag_service
import db

chat_bp = Blueprint("chat", __name__)

@chat_bp.route("/chat", methods=["POST"])
def chat_assistant():
    """
    RAG-grounded AI chat assistant endpoint.
    Accepts JSON body: {"message": "...", "analysis_id": "optional_id"}
    """
    data = request.get_json(silent=True) or {}
    message = data.get("message") or data.get("query")
    
    if not message:
        return jsonify({
            "success": False,
            "error": {
                "code": "MISSING_MESSAGE",
                "message": "Field 'message' is required in JSON payload."
            }
        }), 400

    analysis_id = data.get("analysis_id")
    analysis_context = None
    
    if analysis_id:
        record = db.get_analysis_by_id(analysis_id)
        if record:
            analysis_context = {
                "measurements": {
                    "wound_area_pixels": record["area_pixels"],
                    "bounding_width_pixels": record["width_pixels"],
                    "bounding_height_pixels": record["height_pixels"]
                }
            }

    response = rag_service.generate_grounded_answer(message, analysis_context=analysis_context)

    return jsonify({
        "success": True,
        "query": message,
        "response": response["answer"],
        "citations": response["citations"],
        "disclaimer": response["disclaimer"]
    }), 200
