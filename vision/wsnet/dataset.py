from pathlib import Path
import random
import csv


# ============================================================
# WoundTrack-RAG1 - WSNet Dataset Preparation
# ============================================================

# Project root:
# C:\Users\manoj\Desktop\WoundTrack-RAG1

PROJECT_ROOT = Path(__file__).resolve().parents[2]

IMAGE_DIR = PROJECT_ROOT / "data" / "wound_dataset" / "wound_main"
MASK_DIR = PROJECT_ROOT / "data" / "wound_dataset" / "wound_mask"

OUTPUT_DIR = PROJECT_ROOT / "data" / "processed" / "wsnet_splits"

TRAIN_FILE = OUTPUT_DIR / "train.csv"
VAL_FILE = OUTPUT_DIR / "val.csv"
TEST_FILE = OUTPUT_DIR / "test.csv"


# Dataset split
TRAIN_RATIO = 0.80
VAL_RATIO = 0.10

# Makes the random split reproducible
SEED = 42


def find_pairs():

    pairs = []

    # Find all wound images
    image_files = sorted(
        IMAGE_DIR.glob("wound_main-*.jpg")
    )

    print(f"Images found: {len(image_files)}")

    for image_path in image_files:

        # Example:
        # wound_main-0001.jpg
        #
        # Extract:
        # 0001

        number = image_path.stem.replace(
            "wound_main-",
            ""
        )

        # Create corresponding mask name
        #
        # wound_mask-0001.jpg

        mask_path = MASK_DIR / (
            f"wound_mask-{number}.jpg"
        )

        if mask_path.exists():

            pairs.append(
                (image_path, mask_path)
            )

        else:

            print(
                f"WARNING: Missing mask for "
                f"{image_path.name}"
            )

    return pairs


def split_data(pairs):

    random.seed(SEED)

    # Copy the list
    pairs = pairs.copy()

    # Shuffle the images
    random.shuffle(pairs)

    total = len(pairs)

    train_end = int(
        total * TRAIN_RATIO
    )

    val_end = train_end + int(
        total * VAL_RATIO
    )

    train_pairs = pairs[:train_end]

    val_pairs = pairs[
        train_end:val_end
    ]

    test_pairs = pairs[
        val_end:
    ]

    return (
        train_pairs,
        val_pairs,
        test_pairs
    )


def save_csv(file_path, pairs):

    # Create output directory
    file_path.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with open(
        file_path,
        "w",
        newline="",
        encoding="utf-8"
    ) as file:

        writer = csv.writer(file)

        # CSV header
        writer.writerow(
            [
                "image_path",
                "mask_path"
            ]
        )

        # Write every pair
        for image_path, mask_path in pairs:

            writer.writerow(
                [
                    str(image_path),
                    str(mask_path)
                ]
            )


def main():

    print("=" * 60)

    print(
        "       WOUNDTRACK-RAG1 WSNET DATASET"
    )

    print("=" * 60)

    # --------------------------------------------------------
    # Check image folder
    # --------------------------------------------------------

    if not IMAGE_DIR.exists():

        raise FileNotFoundError(
            f"\nImage folder not found:\n"
            f"{IMAGE_DIR}"
        )

    # --------------------------------------------------------
    # Check mask folder
    # --------------------------------------------------------

    if not MASK_DIR.exists():

        raise FileNotFoundError(
            f"\nMask folder not found:\n"
            f"{MASK_DIR}"
        )

    # --------------------------------------------------------
    # Find matching images and masks
    # --------------------------------------------------------

    print(
        "\nSearching for image-mask pairs..."
    )

    pairs = find_pairs()

    if len(pairs) == 0:

        raise RuntimeError(
            "No image-mask pairs were found."
        )

    print(
        f"Matched pairs: {len(pairs)}"
    )

    # --------------------------------------------------------
    # Split dataset
    # --------------------------------------------------------

    print(
        "\nSplitting dataset..."
    )

    (
        train_pairs,
        val_pairs,
        test_pairs
    ) = split_data(pairs)

    print(
        f"Training   : {len(train_pairs)}"
    )

    print(
        f"Validation : {len(val_pairs)}"
    )

    print(
        f"Testing    : {len(test_pairs)}"
    )

    # --------------------------------------------------------
    # Save CSV files
    # --------------------------------------------------------

    print(
        "\nSaving split files..."
    )

    save_csv(
        TRAIN_FILE,
        train_pairs
    )

    save_csv(
        VAL_FILE,
        val_pairs
    )

    save_csv(
        TEST_FILE,
        test_pairs
    )

    print("\nCreated:")

    print(
        f"  {TRAIN_FILE}"
    )

    print(
        f"  {VAL_FILE}"
    )

    print(
        f"  {TEST_FILE}"
    )

    print(
        "\nDataset preparation completed!"
    )

    print("=" * 60)


# ============================================================
# Start program
# ============================================================

if __name__ == "__main__":
    main()