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

OUTPUT_PATH = (
    PROJECT_ROOT
    / "vision"
    / "wsnet"
    / "mask_check.jpg"
)


with open(CSV_PATH, "r", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))


image_path = rows[0]["image_path"]
mask_path = rows[0]["mask_path"]


image = cv2.imread(image_path)

mask = cv2.imread(
    mask_path,
    cv2.IMREAD_GRAYSCALE
)


# Convert mask to binary

binary_mask = (
    mask > 127
).astype(np.uint8) * 255


# Create green overlay

overlay = image.copy()

overlay[binary_mask > 0] = (
    0,
    255,
    0
)


# Blend original + mask

result = cv2.addWeighted(
    image,
    0.7,
    overlay,
    0.3,
    0
)


cv2.imwrite(
    str(OUTPUT_PATH),
    result
)


print("=" * 60)
print("MASK VISUALIZATION CREATED")
print("=" * 60)

print("\nImage:")
print(image_path)

print("\nMask:")
print(mask_path)

print("\nOutput:")
print(OUTPUT_PATH)

print("\nOpen this file to verify that the green")
print("region is actually covering the wound.")

print("=" * 60)
