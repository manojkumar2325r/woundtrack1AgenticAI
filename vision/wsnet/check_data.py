import csv
from pathlib import Path
import cv2
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parents[2]

CSV_PATH = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "wsnet_splits"
    / "train.csv"
)

print("=" * 60)
print("       WOUNDTRACK-RAG1 DATA CHECK")
print("=" * 60)

with open(CSV_PATH, "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    rows = list(reader)

print("\nTraining pairs:", len(rows))

for i, row in enumerate(rows[:5]):

    image_path = row["image_path"]
    mask_path = row["mask_path"]

    print("\n------------------------------")
    print("Sample:", i + 1)
    print("Image:", image_path)
    print("Mask :", mask_path)

    image = cv2.imread(image_path)

    mask = cv2.imread(
        mask_path,
        cv2.IMREAD_GRAYSCALE
    )

    if image is None:
        print("IMAGE NOT FOUND")
        continue

    if mask is None:
        print("MASK NOT FOUND")
        continue

    print("Image shape:", image.shape)
    print("Mask shape :", mask.shape)

    print("Mask minimum:", mask.min())
    print("Mask maximum:", mask.max())

    print(
        "Unique mask values:",
        np.unique(mask)[:20]
    )

    wound_pixels = np.sum(mask > 127)
    total_pixels = mask.size

    percentage = (
        wound_pixels / total_pixels
    ) * 100

    print("Wound pixels:", wound_pixels)
    print(
        f"Wound percentage: {percentage:.2f}%"
    )

print("\n" + "=" * 60)
print("DATA CHECK COMPLETED")
print("=" * 60)
