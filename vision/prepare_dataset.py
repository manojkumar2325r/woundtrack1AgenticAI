import csv
import re
from pathlib import Path

from PIL import Image


# ============================================================
# CONFIGURATION
# ============================================================

DATASET_ROOT = Path("data/wound_dataset")

IMAGE_FOLDER = DATASET_ROOT / "wound_main"
MASK_FOLDER = DATASET_ROOT / "wound_mask"
NORMAL_FOLDER = DATASET_ROOT / "Nomal"

OUTPUT_FOLDER = Path("data/processed")

METADATA_FILE = OUTPUT_FOLDER / "metadata.csv"

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".tif",
    ".tiff"
}


# ============================================================
# FIND IMAGE FILES
# ============================================================

def find_images(folder):

    if not folder.exists():

        print("Folder not found:", folder)

        return []

    files = []

    for file in folder.rglob("*"):

        if (
            file.is_file()
            and file.suffix.lower() in IMAGE_EXTENSIONS
        ):

            files.append(file)

    return files


# ============================================================
# NORMALIZE FILE NAME
# ============================================================

def normalize_name(filename):

    """
    Converts different filename formats into
    a comparable identifier.

    Example:

    wound_main-123.jpg
    wound_mask-123.png

    both become:

    123
    """

    name = Path(filename).stem.lower()

    # Remove common dataset prefixes
    prefixes = [
        "wound_main-",
        "wound_mask-",
        "wound_main_",
        "wound_mask_",
        "wound-",
        "mask-",
        "image-"
    ]

    for prefix in prefixes:

        if name.startswith(prefix):

            name = name[len(prefix):]

    # Keep only letters and numbers
    name = re.sub(
        r"[^a-z0-9]",
        "",
        name
    )

    return name


# ============================================================
# CREATE LOOKUP
# ============================================================

def create_lookup(files):

    lookup = {}

    for file in files:

        key = normalize_name(file.name)

        if key not in lookup:

            lookup[key] = file

    return lookup


# ============================================================
# CHECK IMAGE
# ============================================================

def check_image(file_path):

    try:

        with Image.open(file_path) as image:

            image.verify()

        return True

    except Exception as error:

        print(
            "Invalid file:",
            file_path
        )

        print(
            "Reason:",
            error
        )

        return False


# ============================================================
# DETECT CATEGORY
# ============================================================

def detect_category(image_path):

    """
    Attempts to detect the wound category
    from the directory or filename.

    If category cannot be detected,
    returns 'unknown'.
    """

    text = str(image_path).lower()

    categories = [

        "diabetic",
        "pressure",
        "venous",
        "trauma",
        "surgical",
        "arterial",
        "cellulitis",
        "other"

    ]

    for category in categories:

        if category in text:

            return category

    return "unknown"


# ============================================================
# MAIN DATASET PREPARATION
# ============================================================

def prepare_dataset():

    print()
    print("=" * 65)
    print("       WOUNDTRACK-RAG1 DATASET PREPARATION")
    print("=" * 65)

    print()
    print("Dataset:", DATASET_ROOT)

    # --------------------------------------------------------
    # Check dataset
    # --------------------------------------------------------

    if not DATASET_ROOT.exists():

        print()
        print("ERROR: Dataset folder not found.")

        return

    # --------------------------------------------------------
    # Find files
    # --------------------------------------------------------

    print()
    print("Searching wound images...")

    wound_images = find_images(
        IMAGE_FOLDER
    )

    print(
        "Found:",
        len(wound_images)
    )

    print()
    print("Searching wound masks...")

    wound_masks = find_images(
        MASK_FOLDER
    )

    print(
        "Found:",
        len(wound_masks)
    )

    print()
    print("Searching normal images...")

    normal_images = find_images(
        NORMAL_FOLDER
    )

    print(
        "Found:",
        len(normal_images)
    )

    # --------------------------------------------------------
    # Create mask lookup
    # --------------------------------------------------------

    mask_lookup = create_lookup(
        wound_masks
    )

    # --------------------------------------------------------
    # Match images
    # --------------------------------------------------------

    metadata = []

    matched = 0

    missing = 0

    invalid_images = 0

    invalid_masks = 0

    print()
    print("=" * 65)
    print("MATCHING IMAGES WITH MASKS")
    print("=" * 65)

    for image in wound_images:

        image_key = normalize_name(
            image.name
        )

        mask = mask_lookup.get(
            image_key
        )

        # ----------------------------------------------------
        # No mask
        # ----------------------------------------------------

        if mask is None:

            missing += 1

            continue

        # ----------------------------------------------------
        # Validate image
        # ----------------------------------------------------

        if not check_image(image):

            invalid_images += 1

            continue

        # ----------------------------------------------------
        # Validate mask
        # ----------------------------------------------------

        if not check_image(mask):

            invalid_masks += 1

            continue

        # ----------------------------------------------------
        # Category
        # ----------------------------------------------------

        category = detect_category(
            image
        )

        # ----------------------------------------------------
        # Add metadata
        # ----------------------------------------------------

        metadata.append({

            "image_id": image_key,

            "image_path": str(
                image
            ),

            "mask_path": str(
                mask
            ),

            "category": category

        })

        matched += 1

    # --------------------------------------------------------
    # Create output directory
    # --------------------------------------------------------

    OUTPUT_FOLDER.mkdir(
        parents=True,
        exist_ok=True
    )

    # --------------------------------------------------------
    # Save CSV
    # --------------------------------------------------------

    with open(
        METADATA_FILE,
        "w",
        newline="",
        encoding="utf-8"
    ) as file:

        fieldnames = [

            "image_id",

            "image_path",

            "mask_path",

            "category"

        ]

        writer = csv.DictWriter(
            file,
            fieldnames=fieldnames
        )

        writer.writeheader()

        writer.writerows(
            metadata
        )

    # --------------------------------------------------------
    # Category statistics
    # --------------------------------------------------------

    category_counts = {}

    for item in metadata:

        category = item["category"]

        category_counts[category] = (
            category_counts.get(
                category,
                0
            ) + 1
        )

    # --------------------------------------------------------
    # FINAL REPORT
    # --------------------------------------------------------

    print()
    print("=" * 65)
    print("                  DATASET REPORT")
    print("=" * 65)

    print()

    print(
        "Wound images       :",
        len(wound_images)
    )

    print(
        "Wound masks        :",
        len(wound_masks)
    )

    print(
        "Normal images      :",
        len(normal_images)
    )

    print(
        "Matched pairs      :",
        matched
    )

    print(
        "Missing masks      :",
        missing
    )

    print(
        "Invalid images     :",
        invalid_images
    )

    print(
        "Invalid masks      :",
        invalid_masks
    )

    print()

    print("CATEGORY COUNTS")
    print("-" * 30)

    for category, count in sorted(
        category_counts.items()
    ):

        print(
            f"{category:<15} : {count}"
        )

    print()

    print(
        "Metadata file:"
    )

    print(
        METADATA_FILE
    )

    print()

    print(
        "Dataset preparation completed!"
    )

    print("=" * 65)


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    prepare_dataset()