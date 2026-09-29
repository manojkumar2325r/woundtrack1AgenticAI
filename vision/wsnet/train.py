import csv
import math
from pathlib import Path

import cv2
import numpy as np
import tensorflow as tf

from wsnet_fusion import build_wsnet


# ============================================================
# WOUNDTRACK-RAG1
# WSNET TRAINING
# ============================================================


# ============================================================
# 1. PROJECT PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

TRAIN_CSV = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "wsnet_splits"
    / "train.csv"
)

VAL_CSV = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "wsnet_splits"
    / "val.csv"
)

CHECKPOINT_DIR = (
    PROJECT_ROOT
    / "vision"
    / "wsnet"
    / "checkpoints"
)

CHECKPOINT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# 2. TRAINING SETTINGS
# ============================================================

IMAGE_SIZE = 192

# CPU training:
# Keep this small to avoid memory problems.

BATCH_SIZE = 4

EPOCHS = 2

LEARNING_RATE = 1e-4


# ============================================================
# 3. LOAD CSV
# ============================================================

def load_csv(csv_path):

    pairs = []

    with open(
        csv_path,
        "r",
        encoding="utf-8"
    ) as file:

        reader = csv.DictReader(file)

        for row in reader:

            pairs.append(
                (
                    row["image_path"],
                    row["mask_path"]
                )
            )

    return pairs


# ============================================================
# 4. LOAD IMAGE
# ============================================================

def load_image(image_path):

    image = cv2.imread(
        image_path
    )

    if image is None:

        raise ValueError(
            f"Could not read image:\n{image_path}"
        )

    # OpenCV uses BGR.
    # TensorFlow models normally use RGB.

    image = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2RGB
    )

    # Resize to 192 x 192.

    image = cv2.resize(
        image,
        (
            IMAGE_SIZE,
            IMAGE_SIZE
        ),
        interpolation=cv2.INTER_AREA
    )

    # Convert uint8 -> float32

    image = image.astype(
        np.float32
    )

    # Normalize:
    #
    # 0-255
    #   ↓
    # 0-1

    image = image / 255.0

    return image


# ============================================================
# 5. LOAD MASK
# ============================================================

def load_mask(mask_path):

    mask = cv2.imread(
        mask_path,
        cv2.IMREAD_GRAYSCALE
    )

    if mask is None:

        raise ValueError(
            f"Could not read mask:\n{mask_path}"
        )

    # Resize mask.
    #
    # IMPORTANT:
    # INTER_NEAREST keeps the mask boundaries
    # instead of creating new gray values.

    mask = cv2.resize(
        mask,
        (
            IMAGE_SIZE,
            IMAGE_SIZE
        ),
        interpolation=cv2.INTER_NEAREST
    )

    # Convert mask into binary:
    #
    # wound     = 1
    # background = 0

    mask = (
        mask > 127
    ).astype(
        np.float32
    )

    # Add channel dimension.
    #
    # Before:
    #
    # (192, 192)
    #
    # After:
    #
    # (192, 192, 1)

    mask = np.expand_dims(
        mask,
        axis=-1
    )

    return mask


# ============================================================
# 6. BATCH DATA GENERATOR
# ============================================================

def data_generator(
    pairs,
    batch_size
):

    while True:

        # Copy list so original list is not modified.

        shuffled_pairs = pairs.copy()

        # Shuffle every epoch.

        np.random.shuffle(
            shuffled_pairs
        )

        # Process batch by batch.

        for start in range(
            0,
            len(shuffled_pairs),
            batch_size
        ):

            batch_pairs = shuffled_pairs[
                start:start + batch_size
            ]

            images = []

            masks = []

            # ------------------------------------------------
            # Load images in this batch
            # ------------------------------------------------

            for image_path, mask_path in batch_pairs:

                image = load_image(
                    image_path
                )

                mask = load_mask(
                    mask_path
                )

                images.append(
                    image
                )

                masks.append(
                    mask
                )

            # ------------------------------------------------
            # Convert lists into NumPy arrays
            # ------------------------------------------------

            images = np.stack(
                images,
                axis=0
            )

            masks = np.stack(
                masks,
                axis=0
            )

            # Final shapes:
            #
            # images:
            # (batch, 192, 192, 3)
            #
            # masks:
            # (batch, 192, 192, 1)

            yield images, masks


# ============================================================
# 7. DICE LOSS
# ============================================================

def dice_loss(
    y_true,
    y_pred
):

    smooth = 1e-6

    y_true = tf.cast(
        y_true,
        tf.float32
    )

    y_pred = tf.cast(
        y_pred,
        tf.float32
    )

    intersection = tf.reduce_sum(
        y_true * y_pred,
        axis=[1, 2, 3]
    )

    denominator = (
        tf.reduce_sum(
            y_true,
            axis=[1, 2, 3]
        )
        +
        tf.reduce_sum(
            y_pred,
            axis=[1, 2, 3]
        )
    )

    dice = (
        2.0 * intersection
        + smooth
    ) / (
        denominator
        + smooth
    )

    return 1.0 - tf.reduce_mean(
        dice
    )


# ============================================================
# 8. BINARY CROSS ENTROPY + DICE LOSS
# ============================================================

def bce_dice_loss(
    y_true,
    y_pred
):

    # Binary cross entropy

    bce = tf.keras.losses.binary_crossentropy(
        y_true,
        y_pred
    )

    bce = tf.reduce_mean(
        bce
    )

    # Dice loss

    dice = dice_loss(
        y_true,
        y_pred
    )

    # Combined loss

    return bce + dice


# ============================================================
# 9. DICE METRIC
# ============================================================

def dice_metric(
    y_true,
    y_pred
):

    smooth = 1e-6

    # Convert probabilities to binary masks.

    y_true = tf.cast(
        y_true > 0.5,
        tf.float32
    )

    y_pred = tf.cast(
        y_pred > 0.5,
        tf.float32
    )

    intersection = tf.reduce_sum(
        y_true * y_pred,
        axis=[1, 2, 3]
    )

    total = (
        tf.reduce_sum(
            y_true,
            axis=[1, 2, 3]
        )
        +
        tf.reduce_sum(
            y_pred,
            axis=[1, 2, 3]
        )
    )

    dice = (
        2.0 * intersection
        + smooth
    ) / (
        total
        + smooth
    )

    return tf.reduce_mean(
        dice
    )


# ============================================================
# 10. IoU METRIC
# ============================================================

def iou_metric(
    y_true,
    y_pred
):

    smooth = 1e-6

    # Convert to binary.

    y_true = tf.cast(
        y_true > 0.5,
        tf.float32
    )

    y_pred = tf.cast(
        y_pred > 0.5,
        tf.float32
    )

    # Intersection

    intersection = tf.reduce_sum(
        y_true * y_pred,
        axis=[1, 2, 3]
    )

    # Union

    union = (
        tf.reduce_sum(
            y_true,
            axis=[1, 2, 3]
        )
        +
        tf.reduce_sum(
            y_pred,
            axis=[1, 2, 3]
        )
        -
        intersection
    )

    iou = (
        intersection + smooth
    ) / (
        union + smooth
    )

    return tf.reduce_mean(
        iou
    )


# ============================================================
# 11. MAIN TRAINING FUNCTION
# ============================================================

def main():

    print("=" * 60)

    print(
        "       WOUNDTRACK-RAG1 WSNET TRAINING"
    )

    print("=" * 60)


    # ========================================================
    # LOAD DATASET
    # ========================================================

    print(
        "\nLoading dataset..."
    )

    train_pairs = load_csv(
        TRAIN_CSV
    )

    val_pairs = load_csv(
        VAL_CSV
    )

    print(
        f"Training samples   : "
        f"{len(train_pairs)}"
    )

    print(
        f"Validation samples : "
        f"{len(val_pairs)}"
    )


    # ========================================================
    # BUILD MODEL
    # ========================================================

    print(
        "\nBuilding WSNet..."
    )

    model = build_wsnet()

    print(
        "\nModel created!"
    )

    print(
        "Input shape :",
        model.input_shape
    )

    print(
        "Output shape:",
        model.output_shape
    )

    print(
        "Parameters  :",
        model.count_params()
    )


    # ========================================================
    # COMPILE MODEL
    # ========================================================

    print(
        "\nCompiling model..."
    )

    model.compile(

        optimizer=tf.keras.optimizers.Adam(
            learning_rate=LEARNING_RATE
        ),

        loss=bce_dice_loss,

        metrics=[
            dice_metric,
            iou_metric
        ]
    )

    print(
        "Model compiled successfully!"
    )


    # ========================================================
    # CALCULATE STEPS
    # ========================================================

    train_steps = math.ceil(
        len(train_pairs)
        / BATCH_SIZE
    )

    val_steps = math.ceil(
        len(val_pairs)
        / BATCH_SIZE
    )

    print(
        "\nTraining steps per epoch:",
        train_steps
    )

    print(
        "Validation steps:",
        val_steps
    )


    # ========================================================
    # CHECKPOINT PATH
    # ========================================================

    best_model_path = (
        CHECKPOINT_DIR
        / "best_wsnet.weights.h5"
    )

    final_model_path = (
        CHECKPOINT_DIR
        / "final_wsnet.weights.h5"
    )


    # ========================================================
    # CALLBACKS
    # ========================================================

    callbacks = [

        tf.keras.callbacks.ModelCheckpoint(

            filepath=str(
                best_model_path
            ),

            monitor="val_dice_metric",

            mode="max",

            save_best_only=True,

            verbose=1
        ),

        tf.keras.callbacks.EarlyStopping(

            monitor="val_dice_metric",

            mode="max",

            patience=5,

            restore_best_weights=True,

            verbose=1
        ),

        tf.keras.callbacks.ReduceLROnPlateau(

            monitor="val_loss",

            factor=0.5,

            patience=2,

            min_lr=1e-7,

            verbose=1
        )
    ]


    # ========================================================
    # START TRAINING
    # ========================================================

    print(
        "\nStarting training..."
    )

    print(
        f"Epochs     : {EPOCHS}"
    )

    print(
        f"Batch size : {BATCH_SIZE}"
    )

    print(
        f"Image size : {IMAGE_SIZE}x{IMAGE_SIZE}"
    )

    print(
        "\n"
    )


    history = model.fit(

        data_generator(
            train_pairs,
            BATCH_SIZE
        ),

        steps_per_epoch=train_steps,

        validation_data=data_generator(
            val_pairs,
            BATCH_SIZE
        ),

        validation_steps=val_steps,

        epochs=EPOCHS,

        callbacks=callbacks,

        verbose=1
    )


    # ========================================================
    # SAVE FINAL MODEL
    # ========================================================

    print(
        "\nSaving final model..."
    )

    model.save(
        final_model_path
    )


    # ========================================================
    # TRAINING SUMMARY
    # ========================================================

    print(
        "\nTraining completed!"
    )

    print(
        "\nBest model:"
    )

    print(
        best_model_path
    )

    print(
        "\nFinal model:"
    )

    print(
        final_model_path
    )

    print(
        "\nAvailable history:"
    )

    print(
        list(
            history.history.keys()
        )
    )

    print(
        "\n"
    )

    print("=" * 60)


# ============================================================
# START
# ============================================================

if __name__ == "__main__":

    main()
