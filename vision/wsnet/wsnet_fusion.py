import tensorflow as tf
from tensorflow.keras import layers, Model

from model import build_local_model, build_global_model


# ============================================================
# WSNet Fusion Model
# ============================================================

def create_patches(images):
    """
    Convert each 192x192 image into nine 64x64 patches.

    192 / 64 = 3

    Therefore:

        3 x 3 = 9 patches
    """

    patches = []

    for row in range(3):

        for col in range(3):

            patch = images[
                :,
                row * 64:(row + 1) * 64,
                col * 64:(col + 1) * 64,
                :
            ]

            patches.append(patch)

    return patches


def build_wsnet():

    # --------------------------------------------------------
    # Input
    # --------------------------------------------------------

    inputs = layers.Input(
        shape=(192, 192, 3),
        name="wound_image"
    )

    # --------------------------------------------------------
    # Create local patches
    # --------------------------------------------------------

    patches = create_patches(inputs)

    # --------------------------------------------------------
    # Local branch
    # --------------------------------------------------------

    local_model = build_local_model()

    local_outputs = []

    for patch in patches:

        output = local_model(patch)

        local_outputs.append(output)

    # --------------------------------------------------------
    # Stitch the 9 local outputs back together
    # --------------------------------------------------------

    row1 = layers.Concatenate(
        axis=2,
        name="local_row1"
    )([
        local_outputs[0],
        local_outputs[1],
        local_outputs[2]
    ])

    row2 = layers.Concatenate(
        axis=2,
        name="local_row2"
    )([
        local_outputs[3],
        local_outputs[4],
        local_outputs[5]
    ])

    row3 = layers.Concatenate(
        axis=2,
        name="local_row3"
    )([
        local_outputs[6],
        local_outputs[7],
        local_outputs[8]
    ])

    local_output = layers.Concatenate(
        axis=1,
        name="local_stitched"
    )([
        row1,
        row2,
        row3
    ])

    # --------------------------------------------------------
    # Global branch
    # --------------------------------------------------------

    global_model = build_global_model()

    global_output = global_model(inputs)

    # --------------------------------------------------------
    # Fusion
    # --------------------------------------------------------

    fused = layers.Concatenate(
        axis=-1,
        name="wsnet_fusion"
    )([
        local_output,
        global_output
    ])

    # --------------------------------------------------------
    # Final segmentation layer
    # --------------------------------------------------------

    output = layers.Conv2D(
        32,
        3,
        padding="same",
        activation="relu",
        name="fusion_conv"
    )(fused)

    output = layers.Conv2D(
        1,
        1,
        padding="same",
        activation="sigmoid",
        name="wound_mask"
    )(output)

    return Model(
        inputs=inputs,
        outputs=output,
        name="WoundTrack_WSNet"
    )


# ============================================================
# Test model
# ============================================================

if __name__ == "__main__":

    print("=" * 60)
    print("       WOUNDTRACK-RAG1 WSNET FUSION")
    print("=" * 60)

    print("\nBuilding complete WSNet...")

    model = build_wsnet()

    print("\nModel created successfully!")

    print(
        "Input shape :",
        model.input_shape
    )

    print(
        "Output shape:",
        model.output_shape
    )

    print(
        "\nTotal parameters:",
        model.count_params()
    )

    print("\nRunning test prediction...")

    # Create one fake 192x192 RGB image
    test_image = tf.random.uniform(
        shape=(1, 192, 192, 3)
    )

    prediction = model(
        test_image,
        training=False
    )

    print(
        "Prediction shape:",
        prediction.shape
    )

    print("\nWSNet forward pass successful!")

    print("=" * 60)