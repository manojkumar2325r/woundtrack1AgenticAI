import sqlite3
import json
import logging
from typing import Dict, Any, List, Optional
from config import DATABASE_PATH

logger = logging.getLogger("woundtrack.db")

def get_connection():
    conn = sqlite3.connect(str(DATABASE_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the SQLite database tables."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            id TEXT PRIMARY KEY,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            patient_id TEXT,
            visit_date TEXT,
            original_filename TEXT,
            image_path TEXT,
            mask_path TEXT,
            overlay_path TEXT,
            image_width INTEGER,
            image_height INTEGER,
            area_pixels INTEGER,
            width_pixels INTEGER,
            height_pixels INTEGER,
            perimeter_pixels REAL,
            aspect_ratio REAL,
            coverage_percentage REAL,
            inference_time_seconds REAL,
            status TEXT,
            metadata_json TEXT
        );
    """)
    
    conn.commit()
    conn.close()
    logger.info("Database initialized successfully at %s", DATABASE_PATH)

def save_analysis(data: Dict[str, Any]):
    """Saves a new analysis record."""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO analyses (
            id, patient_id, visit_date, original_filename, image_path, mask_path, overlay_path,
            image_width, image_height, area_pixels, width_pixels, height_pixels,
            perimeter_pixels, aspect_ratio, coverage_percentage, inference_time_seconds,
            status, metadata_json
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
    """, (
        data["analysis_id"],
        data.get("patient_id", "default_patient"),
        data.get("visit_date"),
        data.get("original_filename"),
        data["image_path"],
        data["mask_path"],
        data["overlay_path"],
        data["image_dimensions"]["width"],
        data["image_dimensions"]["height"],
        data["measurements"]["wound_area_pixels"],
        data["measurements"]["bounding_width_pixels"],
        data["measurements"]["bounding_height_pixels"],
        data["measurements"]["perimeter_pixels"],
        data["measurements"]["aspect_ratio"],
        data["measurements"]["wound_coverage_percentage"],
        data["processing_time_seconds"],
        data.get("status", "completed"),
        json.dumps(data.get("metadata", {}))
    ))
    
    conn.commit()
    conn.close()

def get_analysis_by_id(analysis_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves an analysis record by ID."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM analyses WHERE id = ?", (analysis_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return dict(row)
    return None

def get_all_analyses(limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
    """Retrieves all past analyses ordered by creation date."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM analyses ORDER BY created_at DESC LIMIT ? OFFSET ?", (limit, offset))
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def delete_analysis_by_id(analysis_id: str) -> bool:
    """Deletes an analysis record by ID."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM analyses WHERE id = ?", (analysis_id,))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0
