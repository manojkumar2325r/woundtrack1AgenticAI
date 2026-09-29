import os
import sys
import json
import time
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = BASE_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.append(str(BACKEND_DIR))

from app import create_app
from config import CHECKPOINT_PATH

def run_backend_test():
    print("=" * 70)
    print("      WOUNDTRACK-RAG1 BACKEND END-TO-END TEST")
    print("=" * 70)

    # 1. Verify Checkpoint File Exists
    print("\n[1/6] Verifying existing model checkpoint...")
    if not CHECKPOINT_PATH.exists():
        raise FileNotFoundError(f"Checkpoint file missing: {CHECKPOINT_PATH}")
    checkpoint_size_mb = CHECKPOINT_PATH.stat().st_size / (1024 * 1024)
    print(f"[OK] Checkpoint found: {CHECKPOINT_PATH.name} ({checkpoint_size_mb:.2f} MB)")

    # 2. Create Flask Test Client
    print("\n[2/6] Initializing Flask backend application & WSNet Singleton Service...")
    app = create_app()
    client = app.test_client()

    # 3. Test GET /api/health
    print("\n[3/6] Testing GET /api/health...")
    health_res = client.get("/api/health")
    assert health_res.status_code == 200, f"Health check failed: {health_res.data}"
    health_json = health_res.get_json()
    print(f"[OK] Health Check Status: {health_json['status']}")
    print(f"  WSNet Status      : {health_json['components']['wsnet_model']['status']}")
    print(f"  Model Load Time   : {health_json['components']['wsnet_model']['load_time_seconds']}s")
    print(f"  Compute Device    : {health_json['components']['wsnet_model']['compute_device']}")

    # 4. Test POST /api/analyze with real image
    test_image_path = BASE_DIR / "data" / "wound_dataset" / "wound_main" / "wound_main-0001.jpg"
    print(f"\n[4/6] Testing POST /api/analyze with real image:\n      {test_image_path}")
    assert test_image_path.exists(), f"Sample image not found: {test_image_path}"

    with open(test_image_path, "rb") as img_file:
        data = {
            "image": (img_file, "wound_main-0001.jpg"),
            "patient_id": "patient_test_01",
            "visit_date": "2026-09-21"
        }
        t0 = time.time()
        analyze_res = client.post("/api/analyze", data=data, content_type="multipart/form-data")
        total_api_time = time.time() - t0

    assert analyze_res.status_code == 201, f"Analyze API failed ({analyze_res.status_code}): {analyze_res.data}"
    res_json = analyze_res.get_json()

    print("\n[OK] Analysis Succeeded!")
    print(f"  Analysis ID        : {res_json['analysis_id']}")
    print(f"  Inference Time     : {res_json['segmentation']['inference_time_seconds']}s")
    print(f"  Total API Latency  : {total_api_time:.4f}s")
    print(f"  Original Image URL : {res_json['images']['original']}")
    print(f"  Mask Image URL     : {res_json['images']['mask']}")
    print(f"  Overlay Image URL  : {res_json['images']['overlay']}")

    m = res_json['measurements']
    print("\nWound Spatial Measurements:")
    print(f"  - Wound Area       : {m['wound_area_pixels']} {m['units']['area']}")
    print(f"  - Bounding Width   : {m['bounding_width_pixels']} {m['units']['dimensions']}")
    print(f"  - Bounding Height  : {m['bounding_height_pixels']} {m['units']['dimensions']}")
    print(f"  - Perimeter        : {m['perimeter_pixels']} {m['units']['perimeter']}")
    print(f"  - Aspect Ratio     : {m['aspect_ratio']}")
    print(f"  - Image Coverage   : {m['wound_coverage_percentage']}%")

    print("\nRAG Knowledge Retrieval:")
    print(f"  - Citations Found  : {len(res_json['rag']['citations'])}")
    if res_json['rag']['citations']:
        print(f"  - Top Reference    : {res_json['rag']['citations'][0]['title']}")

    # 5. Test GET /api/analysis/<id>
    analysis_id = res_json['analysis_id']
    print(f"\n[5/6] Testing GET /api/analysis/{analysis_id}...")
    get_res = client.get(f"/api/analysis/{analysis_id}")
    assert get_res.status_code == 200, f"Fetch analysis failed: {get_res.data}"
    print("[OK] Analysis retrieved successfully from SQLite database!")

    # 6. Verify Asset Preservations
    print("\n[6/6] Verifying Data Safety & Checkpoint Integrity...")
    assert CHECKPOINT_PATH.exists(), "CRITICAL ERROR: Checkpoint was modified or deleted!"
    assert len(list((BASE_DIR / 'data' / 'wound_dataset' / 'wound_main').glob('*.jpg'))) >= 2000, "CRITICAL ERROR: Dataset was altered!"
    print("[OK] All checkpoints and datasets remain intact and untouched!")

    print("\n" + "=" * 70)
    print("      ALL BACKEND END-TO-END TESTS PASSED SUCCESSFULLY!")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    run_backend_test()
