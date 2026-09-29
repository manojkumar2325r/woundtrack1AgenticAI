import os
import sys
import time
import logging
from pathlib import Path
import cv2
import numpy as np
import tensorflow as tf

# Add vision/wsnet directory to sys.path so model definitions are available
BASE_DIR = Path(__file__).resolve().parent.parent.parent
WSNET_DIR = BASE_DIR / "vision" / "wsnet"
if str(WSNET_DIR) not in sys.path:
    sys.path.append(str(WSNET_DIR))

from config import CHECKPOINT_PATH, IMAGE_SIZE

logger = logging.getLogger("woundtrack.wsnet")
logging.basicConfig(level=logging.INFO)

# ============================================================
# CUSTOM LOSS AND METRIC DEFINITIONS FOR WSNET CHECKPOINT
# ============================================================

def dice_loss(y_true, y_pred):
    smooth = 1e-6
    y_true = tf.cast(y_true, tf.float32)
    y_pred = tf.cast(y_pred, tf.float32)
    intersection = tf.reduce_sum(y_true * y_pred, axis=[1, 2, 3])
    denominator = tf.reduce_sum(y_true, axis=[1, 2, 3]) + tf.reduce_sum(y_pred, axis=[1, 2, 3])
    dice = (2.0 * intersection + smooth) / (denominator + smooth)
    return 1.0 - tf.reduce_mean(dice)

def bce_dice_loss(y_true, y_pred):
    bce = tf.reduce_mean(tf.keras.losses.binary_crossentropy(y_true, y_pred))
    dice = dice_loss(y_true, y_pred)
    return bce + dice

def dice_metric(y_true, y_pred):
    smooth = 1e-6
    y_true = tf.cast(y_true > 0.5, tf.float32)
    y_pred = tf.cast(y_pred > 0.5, tf.float32)
    intersection = tf.reduce_sum(y_true * y_pred, axis=[1, 2, 3])
    total = tf.reduce_sum(y_true, axis=[1, 2, 3]) + tf.reduce_sum(y_pred, axis=[1, 2, 3])
    dice = (2.0 * intersection + smooth) / (total + smooth)
    return tf.reduce_mean(dice)

def iou_metric(y_true, y_pred):
    smooth = 1e-6
    y_true = tf.cast(y_true > 0.5, tf.float32)
    y_pred = tf.cast(y_pred > 0.5, tf.float32)
    intersection = tf.reduce_sum(y_true * y_pred, axis=[1, 2, 3])
    union = tf.reduce_sum(y_true, axis=[1, 2, 3]) + tf.reduce_sum(y_pred, axis=[1, 2, 3]) - intersection
    iou = (intersection + smooth) / (union + smooth)
    return tf.reduce_mean(iou)


class WSNetService:
    _instance = None
    _model = None
    _loaded = False
    _load_time_sec = 0.0

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(WSNetService, cls).__new__(cls)
        return cls._instance

    def load_model(self) -> bool:
        """Loads the WSNet checkpoint into memory ONCE."""
        if self._loaded and self._model is not None:
            logger.info("WSNet model is already loaded in memory.")
            return True

        if not CHECKPOINT_PATH.exists():
            logger.error("WSNet checkpoint file not found at: %s", CHECKPOINT_PATH)
            return False

        logger.info("Loading WSNet model from checkpoint: %s", CHECKPOINT_PATH)
        start_time = time.time()

        try:
            custom_objects = {
                "bce_dice_loss": bce_dice_loss,
                "dice_metric": dice_metric,
                "iou_metric": iou_metric
            }
            self._model = tf.keras.models.load_model(
                str(CHECKPOINT_PATH),
                custom_objects=custom_objects,
                compile=False
            )
            self._load_time_sec = round(time.time() - start_time, 3)
            self._loaded = True
            logger.info("WSNet model successfully loaded in %.3f seconds!", self._load_time_sec)
            
            # Perform a warm-up dummy prediction
            dummy_input = np.zeros((1, IMAGE_SIZE, IMAGE_SIZE, 3), dtype=np.float32)
            self._model.predict(dummy_input, verbose=0)
            logger.info("WSNet model warm-up prediction completed.")
            return True

        except Exception as e:
            logger.error("Failed to load WSNet model: %s", str(e), exc_info=True)
            self._loaded = False
            self._model = None
            return False

    def is_ready(self) -> bool:
        """Checks if the WSNet model is loaded and ready for inference."""
        return self._loaded and (self._model is not None)

    def preprocess_image(self, image_np: np.ndarray) -> tuple:
        """
        Preprocesses an RGB image array.
        Returns:
            - preprocessed 192x192 normalized float32 batch array (1, 192, 192, 3)
            - original image dimensions (orig_height, orig_width)
        """
        orig_height, orig_width = image_np.shape[:2]
        
        # Resize to WSNet input resolution 192x192
        resized = cv2.resize(image_np, (IMAGE_SIZE, IMAGE_SIZE), interpolation=cv2.INTER_AREA)
        
        # Normalize 0-255 -> 0.0-1.0 float32
        normalized = resized.astype(np.float32) / 255.0
        
        # Add batch dimension
        batch_tensor = np.expand_dims(normalized, axis=0)
        
        return batch_tensor, (orig_height, orig_width)

    def predict(self, image_path_or_np, threshold: float = 0.5) -> dict:
        """
        Runs WSNet inference on an image.
        Accepts file path string / Path object or NumPy array (RGB format).
        Returns structured dictionary containing raw mask, binary mask, overlay image, and latency timing.
        """
        if not self.is_ready():
            success = self.load_model()
            if not success:
                raise RuntimeError("WSNet model is not loaded and failed to initialize.")

        # Read image if path provided
        if isinstance(image_path_or_np, (str, Path)):
            img_bgr = cv2.imread(str(image_path_or_np))
            if img_bgr is None:
                raise ValueError(f"Could not load image from path: {image_path_or_np}")
            image_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        else:
            image_rgb = image_path_or_np

        orig_height, orig_width = image_rgb.shape[:2]

        start_time = time.time()

        # Preprocess
        batch_tensor, _ = self.preprocess_image(image_rgb)

        # Predict
        pred = self._model.predict(batch_tensor, verbose=0)
        raw_prob_mask = pred[0, :, :, 0]

        inference_time = round(time.time() - start_time, 4)
        logger.info("WSNet inference completed in %.4f seconds.", inference_time)

        # Postprocess binary mask (192x192)
        binary_mask_192 = (raw_prob_mask > threshold).astype(np.uint8) * 255

        # Resize binary mask to original image resolution using INTER_NEAREST
        binary_mask_orig = cv2.resize(binary_mask_192, (orig_width, orig_height), interpolation=cv2.INTER_NEAREST)

        # Create overlay visualization (Red/Teal tint over wound area)
        overlay_orig = self.create_overlay(image_rgb, binary_mask_orig, color=(255, 50, 50), alpha=0.45)

        return {
            "inference_time_seconds": inference_time,
            "raw_prob_mask": raw_prob_mask,
            "binary_mask_192": binary_mask_192,
            "binary_mask_orig": binary_mask_orig,
            "overlay_orig": overlay_orig,
            "original_dimensions": {"width": orig_width, "height": orig_height},
            "model_input_dimensions": {"width": IMAGE_SIZE, "height": IMAGE_SIZE}
        }

    def create_overlay(self, original_rgb: np.ndarray, binary_mask: np.ndarray, color=(255, 0, 0), alpha=0.4) -> np.ndarray:
        """Creates a color overlay of the segmentation mask over the original image."""
        overlay = original_rgb.copy()
        mask_boolean = binary_mask > 0
        
        color_layer = np.zeros_like(original_rgb, dtype=np.uint8)
        color_layer[:] = color
        
        # Apply color overlay on wound pixels
        overlay[mask_boolean] = cv2.addWeighted(original_rgb[mask_boolean], 1.0 - alpha, color_layer[mask_boolean], alpha, 0)
        
        # Draw contour border in bright cyan/teal for crisp UI visualization
        contours, _ = cv2.findContours(binary_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cv2.drawContours(overlay, contours, -1, (0, 220, 255), 2)
        
        return overlay

# Global Singleton Instance
wsnet_service = WSNetService()
