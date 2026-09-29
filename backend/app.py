import os
import sys
import logging
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS

from config import PORT, HOST, DEBUG, UPLOAD_DIR, MASK_DIR, OVERLAY_DIR
from services.wsnet_service import wsnet_service
import db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("woundtrack.app")

DIST_DIR = BASE_DIR.parent / "frontend" / "dist"

def create_app():
    app = Flask(
        __name__,
        static_folder=str(DIST_DIR),
        static_url_path=""
    )
    
    # Enable CORS for frontend integration
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize Database Schema
    db.init_db()

    # Pre-load WSNet Model once at application startup
    logger.info("Pre-loading WSNet model at application startup...")
    success = wsnet_service.load_model()
    if success:
        logger.info("WSNet Model Singleton successfully loaded and ready for API requests!")
    else:
        logger.warning("WSNet Model failed to load at startup. Will attempt on-demand initialization.")

    # Register API Blueprints
    from routes.health import health_bp
    from routes.analysis import analysis_bp
    from routes.progression import progression_bp
    from routes.chat import chat_bp

    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(analysis_bp, url_prefix="/api")
    app.register_blueprint(progression_bp, url_prefix="/api")
    app.register_blueprint(chat_bp, url_prefix="/api")

    # Static Media Serving Route
    @app.route("/api/media/<asset_type>/<filename>", methods=["GET"])
    def serve_media(asset_type, filename):
        if asset_type == "uploads":
            return send_from_directory(str(UPLOAD_DIR), filename)
        elif asset_type == "masks":
            return send_from_directory(str(MASK_DIR), filename)
        elif asset_type == "overlays":
            return send_from_directory(str(OVERLAY_DIR), filename)
        else:
            return jsonify({
                "success": False,
                "error": {
                    "code": "INVALID_ASSET_TYPE",
                    "message": f"Asset type '{asset_type}' is invalid."
                }
            }), 400

    # Serve Built Single-Page React Application on Root Route
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path):
        if path.startswith("api/"):
            return jsonify({
                "success": False,
                "error": {
                    "code": "NOT_FOUND",
                    "message": "The requested API endpoint was not found."
                }
            }), 404
            
        target_file = DIST_DIR / path
        if path != "" and target_file.exists() and target_file.is_file():
            return send_from_directory(str(DIST_DIR), path)
        else:
            return send_from_directory(str(DIST_DIR), "index.html")

    # Global Error Handlers
    @app.errorhandler(500)
    def internal_error(error):
        logger.error("Internal Server Error: %s", str(error), exc_info=True)
        return jsonify({
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected server error occurred during processing."
            }
        }), 500

    return app

if __name__ == "__main__":
    app = create_app()
    logger.info("Starting WoundTrack-RAG1 Unified Server on http://%s:%d", HOST, PORT)
    app.run(host=HOST, port=PORT, debug=DEBUG)
