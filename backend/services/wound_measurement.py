import cv2
import numpy as np
from typing import Dict, Any

def calculate_wound_measurements(binary_mask: np.ndarray) -> Dict[str, Any]:
    """
    Calculates spatial measurements from a binary segmentation mask.
    
    Parameters:
        binary_mask (np.ndarray): 2D binary numpy array (0 = background, >0 = wound).
        
    Returns:
        Dict[str, Any] containing exact pixel spatial metrics.
    """
    height, width = binary_mask.shape[:2]
    total_image_pixels = width * height
    
    # Non-zero pixels count
    wound_area_pixels = int(np.count_nonzero(binary_mask > 0))
    
    if wound_area_pixels == 0:
        return {
            "wound_area_pixels": 0,
            "bounding_width_pixels": 0,
            "bounding_height_pixels": 0,
            "perimeter_pixels": 0.0,
            "aspect_ratio": 0.0,
            "total_image_pixels": total_image_pixels,
            "wound_coverage_percentage": 0.0,
            "units": {
                "area": "px²",
                "dimensions": "px",
                "perimeter": "px"
            },
            "status": "no_wound_detected"
        }

    # Extract contours
    contours, _ = cv2.findContours((binary_mask > 0).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours:
        bounding_width = 0
        bounding_height = 0
        perimeter = 0.0
    else:
        # Combine all contours if disconnected components exist
        all_contours = np.vstack(contours)
        x, y, bounding_width, bounding_height = cv2.boundingRect(all_contours)
        
        # Calculate perimeter summing all contour perimeters
        perimeter = sum(cv2.arcLength(c, True) for c in contours)

    aspect_ratio = round(bounding_width / float(bounding_height), 2) if bounding_height > 0 else 0.0
    wound_coverage_pct = round((wound_area_pixels / float(total_image_pixels)) * 100.0, 2)
    
    return {
        "wound_area_pixels": wound_area_pixels,
        "bounding_width_pixels": int(bounding_width),
        "bounding_height_pixels": int(bounding_height),
        "perimeter_pixels": round(float(perimeter), 2),
        "aspect_ratio": aspect_ratio,
        "total_image_pixels": total_image_pixels,
        "wound_coverage_percentage": wound_coverage_pct,
        "units": {
            "area": "px²",
            "dimensions": "px",
            "perimeter": "px"
        },
        "status": "wound_detected"
    }
