"""
Unified video ASD screening module.

Integrates:
- video-asd-model: VGG16+LSTM behavioral video classifier
- gaze-collector MediaPipe: Face mesh for gaze/face quality metrics

Provides analyze_video() returning a single risk score (0-1).
"""

from __future__ import annotations

import os
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import cv2
import numpy as np

# Add video-asd-model to path for imports
ML_DIR = Path(__file__).resolve().parent
VIDEO_ASD_DIR = ML_DIR / "video-asd-model"
if str(VIDEO_ASD_DIR) not in sys.path:
    sys.path.insert(0, str(VIDEO_ASD_DIR))


@dataclass
class ScreeningResult:
    """Result of video ASD screening analysis."""

    risk_score: float  # 0–1, higher = higher ASD risk (Low<0.3, High>0.7)
    video_model_prob: Optional[float]  # P(ASD) from VGG16+LSTM if available
    face_detection_ratio: float  # Fraction of frames with detected face (MediaPipe)
    gaze_metrics: dict  # MediaPipe-derived quality/gaze indicators
    details: dict  # Raw breakdown for debugging/transparency
    indicators: dict  # gaze_fixation_time (sec), gesture_anomalies, etc.


def _extract_mediapipe_features(video_path: str) -> dict:
    """
    Extract face mesh and gaze-related metrics from video using MediaPipe.
    Mirrors gaze-collector's FaceMesh usage (setup_window, experiment_window).
    """
    import mediapipe as mp

    mp_face_mesh = mp.solutions.face_mesh
    face_mesh = mp_face_mesh.FaceMesh(
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    )

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return {
            "face_detection_ratio": 0.0,
            "frame_count": 0,
            "eye_landmark_variance": None,
            "iris_detected_ratio": None,
        }
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0

    frame_count = 0
    face_detected_count = 0
    iris_detected_count = 0
    eye_positions = []  # For gaze variance (optional)

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            frame_count += 1

            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = face_mesh.process(rgb)

            if results.multi_face_landmarks:
                face_detected_count += 1
                lm = results.multi_face_landmarks[0]
                # Iris landmarks: 468–477 (left), 473–478 (right) in refine mode
                has_iris = len(lm.landmark) >= 478
                if has_iris:
                    iris_detected_count += 1
                # Eye corner indices for gaze proxy
                for idx in [33, 133, 362, 263]:
                    if idx < len(lm.landmark):
                        p = lm.landmark[idx]
                        eye_positions.append((p.x, p.y))
            else:
                eye_positions.append((np.nan, np.nan))  # Placeholder when no face
    finally:
        cap.release()
        face_mesh.close()

    face_ratio = face_detected_count / frame_count if frame_count > 0 else 0.0
    iris_ratio = iris_detected_count / frame_count if frame_count > 0 else 0.0

    # Gaze variance: higher variance can indicate less stable gaze (exploratory metric)
    eye_arr = np.array([p for p in eye_positions if not (np.isnan(p[0]) or np.isnan(p[1]))])
    eye_var = float(np.var(eye_arr)) if len(eye_arr) > 1 else None

    return {
        "face_detection_ratio": face_ratio,
        "frame_count": frame_count,
        "eye_landmark_variance": eye_var,
        "iris_detected_ratio": iris_ratio,
        "fps": fps,
    }


def _extract_pose_and_gaze(video_path: str) -> dict:
    """
    Extract MediaPipe Pose + Face mesh for gaze fixation time and gesture anomalies.
    Returns gaze_fixation_time (sec), gesture_anomaly_score, pose_landmarks per frame.
    """
    import mediapipe as mp

    mp_face_mesh = mp.solutions.face_mesh
    mp_pose = mp.solutions.pose
    face_mesh = mp_face_mesh.FaceMesh(
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    )
    pose = mp_pose.Pose(
        static_image_mode=False,
        model_complexity=1,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    )

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return {
            "gaze_fixation_time": 0.0,
            "gesture_anomaly_score": 0.0,
            "pose_landmarks": [],
            "fps": 30,
        }
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0

    eye_positions = []
    pose_landmarks_list = []

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            face_results = face_mesh.process(rgb)
            pose_results = pose.process(rgb)

            if face_results.multi_face_landmarks:
                lm = face_results.multi_face_landmarks[0]
                eye_center = np.array([0.0, 0.0])
                count = 0
                for idx in [33, 133, 362, 263, 468, 473]:
                    if idx < len(lm.landmark):
                        p = lm.landmark[idx]
                        eye_center += np.array([p.x, p.y])
                        count += 1
                if count > 0:
                    eye_center /= count
                    eye_positions.append(eye_center)
                else:
                    eye_positions.append(np.array([np.nan, np.nan]))
            else:
                eye_positions.append(np.array([np.nan, np.nan]))

            if pose_results.pose_landmarks:
                lms = [
                    (p.x, p.y, p.z)
                    for p in pose_results.pose_landmarks.landmark
                ]
                pose_landmarks_list.append(np.array(lms))
    finally:
        cap.release()
        face_mesh.close()
        pose.close()

    # Gaze fixation time: frames where eye position is stable (low movement)
    gaze_fixation_sec = 0.0
    if len(eye_positions) > 1:
        valid = np.array([p for p in eye_positions if not np.any(np.isnan(p))])
        if len(valid) > 5:
            diffs = np.linalg.norm(np.diff(valid, axis=0), axis=1)
            fix_threshold = 0.02
            fix_frames = np.sum(diffs < fix_threshold)
            gaze_fixation_sec = float(fix_frames / fps)

    # Gesture anomaly score: pose landmark variance (higher = more atypical movement)
    gesture_anomaly = 0.0
    if len(pose_landmarks_list) > 2:
        stack = np.stack(pose_landmarks_list)
        var = np.var(stack, axis=0)
        gesture_anomaly = float(np.mean(var))
    return {
        "gaze_fixation_time": gaze_fixation_sec,
        "gesture_anomaly_score": gesture_anomaly,
        "pose_landmarks": pose_landmarks_list,
        "fps": fps,
    }


def _get_video_model_prediction(video_path: str) -> tuple[Optional[float], Optional[str]]:
    """
    Run VGG16+LSTM video classifier from video-asd-model.
    Returns (P(ASD), predicted_label) or (None, None) if model unavailable.
    """
    model_dir = VIDEO_ASD_DIR / "models" / "autism_data"
    vgg16_include_top = True

    config_path = model_dir / "vgg16-lstm-config.npy"
    weight_path = model_dir / "vgg16-lstm-weights.h5"

    if not config_path.exists() or not weight_path.exists():
        return None, None

    try:
        from keras import backend as K

        if hasattr(K, "common") and hasattr(K.common, "set_image_dim_ordering"):
            K.common.set_image_dim_ordering("tf")
    except Exception:
        pass  # TF2+ may not need this

    try:
        from recurrent_networks import vgg16LSTMVideoClassifier
        from vgg16_feature_extractor import extract_vgg16_features_live
    except ImportError:
        return None, None

    try:
        predictor = vgg16LSTMVideoClassifier()
        predictor.load_model(str(config_path), str(weight_path))

        x = extract_vgg16_features_live(predictor.vgg16_model, video_path)
        if x is None or len(x) == 0:
            return None, None

        frames = x.shape[0]
        expected = predictor.expected_frames
        if frames > expected:
            x = x[:expected, :]
        elif frames < expected:
            temp = np.zeros((expected, x.shape[1]), dtype=x.dtype)
            temp[:frames, :] = x
            x = temp

        probs = predictor.model.predict(np.array([x]), verbose=0)[0]
        pred_class = int(np.argmax(probs))
        pred_label = predictor.labels_idx2word[pred_class]

        # Find ASD probability: assume label containing 'autism' or first class is ASD
        asd_prob = 0.0
        for idx, (label, _) in enumerate(predictor.labels.items()):
            if "autism" in str(label).lower() or "asd" in str(label).lower():
                asd_prob = float(probs[idx])
                break
        if asd_prob == 0.0 and len(probs) >= 1:
            asd_prob = float(probs[0])  # Fallback: use first class as risk proxy

        return asd_prob, pred_label
    except Exception:
        return None, None


def analyze_video(
    video_path: str,
    video_model_weight: float = 0.85,
    mediapipe_quality_weight: float = 0.15,
    min_face_ratio_for_confidence: float = 0.3,
) -> ScreeningResult:
    """
    Unified video analysis combining VGG16+LSTM (video-asd-model) and MediaPipe (gaze-collector).

    Args:
        video_path: Path to video file.
        video_model_weight: Weight for VGG16+LSTM probability in risk score (0–1).
        mediapipe_quality_weight: Weight for MediaPipe-derived quality adjustment.
        min_face_ratio_for_confidence: Below this face_detection_ratio, downweight video model.

    Returns:
        ScreeningResult with risk_score (0–1) and detailed breakdown.
    """
    video_path = str(Path(video_path).resolve())
    if not os.path.isfile(video_path):
        return ScreeningResult(
            risk_score=0.0,
            video_model_prob=None,
            face_detection_ratio=0.0,
            gaze_metrics={},
            details={"error": "Video file not found"},
            indicators={"gaze_fixation_time": 0.0, "gesture_anomalies": 0.0},
        )

    # 1. MediaPipe features (face mesh + pose)
    mp_features = _extract_mediapipe_features(video_path)
    pose_gaze = _extract_pose_and_gaze(video_path)
    face_ratio = mp_features["face_detection_ratio"]
    gaze_metrics = {
        "face_detection_ratio": face_ratio,
        "frame_count": mp_features["frame_count"],
        "eye_landmark_variance": mp_features["eye_landmark_variance"],
        "iris_detected_ratio": mp_features["iris_detected_ratio"],
    }
    indicators = {
        "gaze_fixation_time": pose_gaze["gaze_fixation_time"],
        "gesture_anomalies": pose_gaze["gesture_anomaly_score"],
    }

    # 2. Video model prediction
    video_prob, pred_label = _get_video_model_prediction(video_path)
    details = {
        "video_model_prob": video_prob,
        "video_model_label": pred_label,
        "mediapipe": mp_features,
        "pose_gaze": {k: v for k, v in pose_gaze.items() if k != "pose_landmarks"},
    }

    # 3. Compute unified risk score (Low<0.3, High>0.7)
    if video_prob is not None:
        base_risk = float(video_prob)
        # Quality adjustment: if face rarely detected, downweight video model confidence
        if face_ratio < min_face_ratio_for_confidence:
            quality_factor = face_ratio / min_face_ratio_for_confidence
            base_risk = base_risk * quality_factor
        risk_score = np.clip(
            video_model_weight * base_risk
            + mediapipe_quality_weight * (1.0 - face_ratio),
            0.0,
            1.0,
        )
    else:
        # Fallback: model unavailable; risk_score reflects low confidence
        risk_score = 0.0
        details["fallback"] = "Video model not available; risk_score not computed"

    return ScreeningResult(
        risk_score=float(risk_score),
        video_model_prob=video_prob,
        face_detection_ratio=face_ratio,
        gaze_metrics=gaze_metrics,
        details=details,
        indicators=indicators,
    )


def explain_risk_score(result: ScreeningResult) -> dict:
    """
    Feature importance for risk score (SHAP-style explainability).
    Returns dict of feature name -> importance (contribution to risk).
    """
    importance = {}
    r = result.risk_score
    details = result.details
    if "fallback" in details:
        importance["note"] = "Video model unavailable; risk from MediaPipe quality only"
        importance["face_detection_ratio"] = 1.0 - result.face_detection_ratio
        return importance

    importance["video_model_prob"] = (
        float(details.get("video_model_prob", 0) or 0)
    )
    importance["face_detection_penalty"] = max(
        0, (1.0 - result.face_detection_ratio) * 0.15
    )
    importance["gaze_fixation"] = -0.1 * result.indicators.get(
        "gaze_fixation_time", 0
    )  # More fixation = lower risk
    importance["gesture_anomalies"] = 0.05 * result.indicators.get(
        "gesture_anomalies", 0
    )
    return importance


def analyze_video_with_explainability(video_path: str, **kwargs) -> dict:
    """
    Run analyze_video and attach SHAP-style feature importance.
    Returns dict suitable for API: risk, indicators, shap_importance, (optional) heatmap_base64.
    """
    result = analyze_video(video_path, **kwargs)
    importance = explain_risk_score(result)
    out = {
        "risk": result.risk_score,
        "indicators": result.indicators,
        "gaze_metrics": result.gaze_metrics,
        "details": result.details,
        "shap_importance": importance,
    }
    return out


if __name__ == "__main__":
    import sys as _sys

    path = _sys.argv[1] if len(_sys.argv) > 1 else None
    if not path or not os.path.isfile(path):
        print("Usage: python -m ml.screening <video_path>")
        print("  Or: python screening.py <video_path>")
        _sys.exit(1)
    result = analyze_video(path)
    print(f"Risk score: {result.risk_score:.3f}")
    print(f"Face detection ratio: {result.face_detection_ratio:.3f}")
    print(f"Video model P(ASD): {result.video_model_prob}")
    print(f"Details: {result.details}")
