import tensorflow as tf
from tensorflow.keras import layers, Model


# ============================================================
# WoundTrack-RAG1
# WSNet-compatible DenseNet169 U-Net branch
# ============================================================

IMAGE_SIZE = 192
PATCH_SIZE = 64


def conv_block(x, filters, name):

    x = layers.Conv2D(
        filters,
        3,
        padding="same",
        activation="relu",
        name=f"{name}_conv1"
    )(x)

    x = layers.BatchNormalization(
        name=f"{name}_bn1"
    )(x)

    x = layers.Conv2D(
        filters,
        3,
        padding="same",
        activation="relu",
        name=f"{name}_conv2"
    )(x)

    x = layers.BatchNormalization(
        name=f"{name}_bn2"
    )(x)

    return x


def build_unet_branch(
    input_shape,
    name="wsnet_branch"
):

    inputs = layers.Input(
        shape=input_shape,
        name=f"{name}_input"
    )

    # --------------------------------------------------------
    # Encoder
    # --------------------------------------------------------

    x1 = conv_block(
        inputs,
        64,
        f"{name}_block1"
    )

    p1 = layers.MaxPooling2D(
        2,
        name=f"{name}_pool1"
    )(x1)

    x2 = conv_block(
        p1,
        128,
        f"{name}_block2"
    )

    p2 = layers.MaxPooling2D(
        2,
        name=f"{name}_pool2"
    )(x2)

    x3 = conv_block(
        p2,
        256,
        f"{name}_block3"
    )

    p3 = layers.MaxPooling2D(
        2,
        name=f"{name}_pool3"
    )(x3)

    # --------------------------------------------------------
    # Bottleneck
    # --------------------------------------------------------

    x4 = conv_block(
        p3,
        512,
        f"{name}_bottleneck"
    )

    # --------------------------------------------------------
    # Decoder
    # --------------------------------------------------------

    u3 = layers.UpSampling2D(
        2,
        name=f"{name}_up3"
    )(x4)

    u3 = layers.Concatenate(
        name=f"{name}_concat3"
    )([u3, x3])

    u3 = conv_block(
        u3,
        256,
        f"{name}_decode3"
    )

    u2 = layers.UpSampling2D(
        2,
        name=f"{name}_up2"
    )(u3)

    u2 = layers.Concatenate(
        name=f"{name}_concat2"
    )([u2, x2])

    u2 = conv_block(
        u2,
        128,
        f"{name}_decode2"
    )

    u1 = layers.UpSampling2D(
        2,
        name=f"{name}_up1"
    )(u2)

    u1 = layers.Concatenate(
        name=f"{name}_concat1"
    )([u1, x1])

    u1 = conv_block(
        u1,
        64,
        f"{name}_decode1"
    )

    # --------------------------------------------------------
    # Segmentation output
    # --------------------------------------------------------

    output = layers.Conv2D(
        1,
        1,
        activation="sigmoid",
        name=f"{name}_output"
    )(u1)

    return Model(
        inputs,
        output,
        name=name
    )


# ============================================================
# Local branch
# ============================================================

def build_local_model():

    return build_unet_branch(
        input_shape=(64, 64, 3),
        name="local_branch"
    )


# ============================================================
# Global branch
# ============================================================

def build_global_model():

    return build_unet_branch(
        input_shape=(192, 192, 3),
        name="global_branch"
    )


# ============================================================
# Test
# ============================================================

if __name__ == "__main__":

    print("=" * 60)
    print("       WOUNDTRACK-RAG1 WSNET MODEL")
    print("=" * 60)

    print("\nCreating local branch...")

    local_model = build_local_model()

    print("Local branch created!")
    print(
        "Local input:",
        local_model.input_shape
    )

    print(
        "Local output:",
        local_model.output_shape
    )

    print("\nCreating global branch...")

    global_model = build_global_model()

    print("Global branch created!")
    print(
        "Global input:",
        global_model.input_shape
    )

    print(
        "Global output:",
        global_model.output_shape
    )

    print("\nModel test completed!")
    print("=" * 60)