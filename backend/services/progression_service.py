from typing import List, Dict, Any

def calculate_wound_progression(visits: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculates wound progression across multiple visits.
    Each visit dict should contain: 'visit_id' or 'date', and 'wound_area_pixels'.
    """
    if not visits:
        return {
            "total_visits": 0,
            "progression": [],
            "overall_change_percentage": 0.0,
            "trend_summary": "No visit data provided."
        }

    # Sort visits by visit_date or creation date if available
    sorted_visits = sorted(visits, key=lambda x: x.get("visit_date") or x.get("created_at") or "")
    
    progression_steps = []
    first_area = sorted_visits[0].get("wound_area_pixels", 0)
    prev_area = None

    for idx, visit in enumerate(sorted_visits):
        current_area = visit.get("wound_area_pixels", 0)
        
        if prev_area is None:
            area_change = 0
            percentage_change = 0.0
            step_trend = "baseline"
        else:
            area_change = current_area - prev_area
            percentage_change = round(((current_area - prev_area) / float(prev_area)) * 100.0, 2) if prev_area > 0 else 0.0
            if percentage_change < -2.0:
                step_trend = "reduction"
            elif percentage_change > 2.0:
                step_trend = "increase"
            else:
                step_trend = "stable"

        progression_steps.append({
            "visit_index": idx + 1,
            "visit_id": visit.get("id") or visit.get("analysis_id"),
            "visit_date": visit.get("visit_date") or visit.get("created_at"),
            "wound_area_pixels": current_area,
            "area_change_pixels": area_change,
            "percentage_change": percentage_change,
            "trend": step_trend
        })

        prev_area = current_area

    last_area = sorted_visits[-1].get("wound_area_pixels", 0)
    overall_pct_change = round(((last_area - first_area) / float(first_area)) * 100.0, 2) if first_area > 0 else 0.0

    if overall_pct_change < -5.0:
        summary_text = f"Observed image-based reduction of {abs(overall_pct_change)}% in wound surface area."
    elif overall_pct_change > 5.0:
        summary_text = f"Observed image-based increase of {overall_pct_change}% in wound surface area."
    else:
        summary_text = "Observed image-based wound surface area remains stable."

    return {
        "total_visits": len(sorted_visits),
        "baseline_area_pixels": first_area,
        "latest_area_pixels": last_area,
        "overall_change_pixels": last_area - first_area,
        "overall_change_percentage": overall_pct_change,
        "trend_summary": summary_text,
        "visits": progression_steps,
        "disclaimer": "Observed image-based area trend. Not a guaranteed healing metric."
    }
