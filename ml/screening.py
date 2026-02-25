"""
Unified video ASD screening module.

Integrates:
- video-asd-model : VGG16+LSTM behavioural video classifier
- gaze-collector  : MediaPipe Face Mesh + Pose for gaze/gesture metrics

Entry points
------------
analyze_video(video_path, ...)                → ScreeningResult
analyze_video_with_explainability(video_path) → dict  (API-ready)
explain_risk_score(result)                    → dict  (SHAP-style)

Risk bands:  Low < 0.3 | Medium 0.3–0.7 | High > 0.7
"""

from __future__ import annotations

import os
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import cv2
import numpy as np

# ── Paths ─────────────────────────────────────────────────────────────────────
ML_DIR        = Path(__file__).resolve().parent
VIDEO_ASD_DIR = ML_DIR / "video-asd-model"

if str(VIDEO_ASD_DIR) not in sys.path:
    sys.path.insert(0, str(VIDEO_ASD_DIR))


# ── Result dataclass ──────────────────────────────────────────────────────────

@dataclass
class ScreeningResult:
    """Full result of a single video ASD screening run."""

    risk_score:           float           # 0–1, higher = higher ASD risk
    video_model_prob:     Optional[float] # P(ASD) from VGG16+LSTM if available
    face_detection_ratio: float           # Fraction of frames with detected face
    gaze_metrics:         dict            # MediaPipe-derived quality indicators
    details:              dict            # Raw breakdown for debugging / XAI
    indicators:           dict            # gaze_fixation_time (s), gesture_anomalies


# ── MediaPipe helpers ─────────────────────────────────────────────────────────

def _extract_mediapipe_features(video_path: str) -> dict:
    """
    Extract Face Mesh metrics from every frame.
    Returns face_detection_ratio, iris_detected_ratio, eye_landmark_variance, fps.
    """
    import mediapipe as mp

    mp_face_mesh = mp.solutions.face_mesh
    face_mesh    = mp_face_mesh.FaceMesh(
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    )

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return {
            "face_detection_ratio": 0.0,
            "frame_count":          0,
            "eye_landmark_variance": None,
            "iris_detected_ratio":  None,
            "fps":                  30.0,
        }

    fps              = cap.get(cv2.CAP_PROP_FPS) or 30.0
    frame_count      = 0
    face_detected    = 0
    iris_detected    = 0
    eye_positions    = []

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            frame_count += 1

            rgb     = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = face_mesh.process(rgb)

            if results.multi_face_landmarks:
                face_detected += 1
                lm = results.multi_face_landmarks[0]

                # Iris landmarks available only in refine mode (index >= 468)
                if len(lm.landmark) >= 478:
                    iris_detected += 1

                # Eye corner proxies for gaze variance
                for idx in [33, 133, 362, 263]:
                    if idx < len(lm.landmark):
                        p = lm.landmark[idx]
                        eye_positions.append((p.x, p.y))
            else:
                eye_positions.append((np.nan, np.nan))
    finally:
        cap.release()
        face_mesh.close()

    face_ratio = face_detected / frame_count if frame_count > 0 else 0.0
    iris_ratio = iris_detected / frame_count if frame_count > 0 else 0.0

    eye_arr = np.array(
        [p for p in eye_positions if not (np.isnan(p[0]) or np.isnan(p[1]))]
    )
    eye_var = float(np.var(eye_arr)) if len(eye_arr) > 1 else None

    return {
        "face_detection_ratio":  face_ratio,
        "frame_count":           frame_count,
        "eye_landmark_variance": eye_var,
        "iris_detected_ratio":   iris_ratio,
        "fps":                   fps,
    }


def _extract_pose_and_gaze(video_path: str) -> dict:
    """
    Extract MediaPipe Pose + Face Mesh to compute:
      - gaze_fixation_time  : seconds where eye gaze is stable
      - gesture_anomaly_score: pose landmark variance (proxy for atypical movement)
    """
    import mediapipe as mp

    mp_face_mesh = mp.solutions.face_mesh
    mp_pose      = mp.solutions.pose

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
            "gaze_fixation_time":    0.0,
            "gesture_anomaly_score": 0.0,
            "pose_landmarks":        [],
            "fps":                   30.0,
        }

    fps             = cap.get(cv2.CAP_PROP_FPS) or 30.0
    eye_positions   = []
    pose_lm_list    = []

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            rgb          = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            face_results = face_mesh.process(rgb)
            pose_results = pose.process(rgb)

            # ── Eye centre from face landmarks ────────────────────────────────
            if face_results.multi_face_landmarks:
                lm         = face_results.multi_face_landmarks[0]
                eye_center = np.zeros(2)
                count      = 0
                for idx in [33, 133, 362, 263, 468, 473]:
                    if idx < len(lm.landmark):
                        p           = lm.landmark[idx]
                        eye_center += np.array([p.x, p.y])
                        count      += 1
                if count > 0:
                    eye_positions.append(eye_center / count)
                else:
                    eye_positions.append(np.array([np.nan, np.nan]))
            else:
                eye_positions.append(np.array([np.nan, np.nan]))

            # ── Pose landmarks ────────────────────────────────────────────────
            if pose_results.pose_landmarks:
                lms = [(p.x, p.y, p.z) for p in pose_results.pose_landmarks.landmark]
                pose_lm_list.append(np.array(lms))
    finally:
        cap.release()
        face_mesh.close()
        pose.close()

    # ── Gaze fixation time ────────────────────────────────────────────────────
    gaze_fixation_sec = 0.0
    if len(eye_positions) > 1:
        valid = np.array([p for p in eye_positions if not np.any(np.isnan(p))])
        if len(valid) > 5:
            diffs      = np.linalg.norm(np.diff(valid, axis=0), axis=1)
            fix_frames = int(np.sum(diffs < 0.02))  # threshold: 2% normalised movement
            gaze_fixation_sec = fix_frames / fps

    # ── Gesture anomaly score ─────────────────────────────────────────────────
    gesture_anomaly = 0.0
    if len(pose_lm_list) > 2:
        stack           = np.stack(pose_lm_list)            # (frames, joints, 3)
        gesture_anomaly = float(np.mean(np.var(stack, axis=0)))

    return {
        "gaze_fixation_time":    float(gaze_fixation_sec),
        "gesture_anomaly_score": float(gesture_anomaly),
        "pose_landmarks":        pose_lm_list,
        "fps":                   float(fps),
    }


# ── VGG16 + LSTM model ────────────────────────────────────────────────────────

def _get_video_model_prediction(
    video_path: str,
) -> tuple[Optional[float], Optional[str]]:
    """
    Run the VGG16+LSTM classifier from video-asd-model.
    Returns (P(ASD), predicted_label) or (None, None) when weights are absent.
    """
    model_dir   = VIDEO_ASD_DIR / "models" / "autism_data"
    config_path = model_dir / "vgg16-lstm-config.npy"
    weight_path = model_dir / "vgg16-lstm-weights.h5"

    if not config_path.exists() or not weight_path.exists():
        return None, None

    # Keras backend compatibility shim (TF1 legacy)
    try:
        from keras import backend as K
        if hasattr(K, "common") and hasattr(K.common, "set_image_dim_ordering"):
            K.common.set_image_dim_ordering("tf")
    except Exception:
        pass

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

        frames   = x.shape[0]
        expected = predictor.expected_frames

        if frames > expected:
            x = x[:expected, :]
        elif frames < expected:
            padded          = np.zeros((expected, x.shape[1]), dtype=x.dtype)
            padded[:frames] = x
            x               = padded

        probs      = predictor.model.predict(np.array([x]), verbose=0)[0]
        pred_class = int(np.argmax(probs))
        pred_label = predictor.labels_idx2word[pred_class]

        # Find ASD class probability
        asd_prob = 0.0
        for idx, label in enumerate(predictor.labels):
            if "autism" in str(label).lower() or "asd" in str(label).lower():
                asd_prob = float(probs[idx])
                break
        if asd_prob == 0.0:
            asd_prob = float(probs[0])  # fallback: treat class 0 as ASD proxy

        return asd_prob, pred_label

    except Exception:
        return None, None


# ── Main analysis function ────────────────────────────────────────────────────

def analyze_video(
    video_path: str,
    video_model_weight:            float = 0.85,
    mediapipe_quality_weight:      float = 0.15,
    min_face_ratio_for_confidence: float = 0.30,
) -> ScreeningResult:
    """
    Unified ASD risk analysis combining VGG16+LSTM and MediaPipe signals.

    Risk score formula
    ------------------
    If VGG16 weights present:
        risk = 0.85 * video_prob * quality_factor + 0.15 * (1 - face_ratio)
    Fallback (weights absent):
        risk = 0.50 * fixation_risk + 0.35 * gesture_risk + 0.15 * (1 - face_ratio)

    Args:
        video_path                  : path to video file
        video_model_weight          : weight for VGG16 probability
        mediapipe_quality_weight    : weight for MediaPipe quality adjustment
        min_face_ratio_for_confidence: face ratio below which video model is downweighted
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

    # 1. MediaPipe — face mesh + pose
    mp_features = _extract_mediapipe_features(video_path)
    pose_gaze   = _extract_pose_and_gaze(video_path)
    face_ratio  = mp_features["face_detection_ratio"]

    gaze_metrics = {
        "face_detection_ratio":  face_ratio,
        "frame_count":           mp_features["frame_count"],
        "eye_landmark_variance": mp_features["eye_landmark_variance"],
        "iris_detected_ratio":   mp_features["iris_detected_ratio"],
    }
    indicators = {
        "gaze_fixation_time": pose_gaze["gaze_fixation_time"],
        "gesture_anomalies":  pose_gaze["gesture_anomaly_score"],
    }

    # 2. VGG16+LSTM prediction
    video_prob, pred_label = _get_video_model_prediction(video_path)

    details = {
        "video_model_prob":  video_prob,
        "video_model_label": pred_label,
        "mediapipe":         mp_features,
        "pose_gaze": {
            k: v for k, v in pose_gaze.items() if k != "pose_landmarks"
        },
    }

    # 3. Unified risk score
    if video_prob is not None:
        # Quality adjustment: downweight when face rarely detected
        quality_factor = (
            face_ratio / min_face_ratio_for_confidence
            if face_ratio < min_face_ratio_for_confidence
            else 1.0
        )
        risk_score = float(np.clip(
            video_model_weight * float(video_prob) * quality_factor
            + mediapipe_quality_weight * (1.0 - face_ratio),
            0.0, 1.0,
        ))
    else:
        # Fallback: MediaPipe heuristic only
        gaze_fixation   = pose_gaze["gaze_fixation_time"]
        gesture_score   = pose_gaze["gesture_anomaly_score"]

        # Low fixation → higher risk; high gesture variance → higher risk
        fixation_risk   = max(0.0, 1.0 - (gaze_fixation / 10.0))
        gesture_risk    = min(1.0, gesture_score * 100.0)

        risk_score = float(np.clip(
            0.50 * fixation_risk
            + 0.35 * gesture_risk
            + 0.15 * (1.0 - face_ratio),
            0.0, 1.0,
        ))
        details["fallback"] = "VGG16 weights not found — using MediaPipe heuristic"

    return ScreeningResult(
        risk_score=risk_score,
        video_model_prob=video_prob,
        face_detection_ratio=face_ratio,
        gaze_metrics=gaze_metrics,
        details=details,
        indicators=indicators,
    )


# ── Explainability ────────────────────────────────────────────────────────────

def explain_risk_score(result: ScreeningResult) -> dict:
    """
    SHAP-style feature importance breakdown for the risk score.
    Returns {feature: contribution} — positive = raises risk, negative = lowers it.
    """
    importance: dict = {}

    if "fallback" in result.details:
        importance["note"]                = "VGG16 unavailable — MediaPipe heuristic only"
        importance["face_detection_ratio"] = round(1.0 - result.face_detection_ratio, 4)
        importance["gaze_fixation_time"]   = round(
            max(0.0, 1.0 - result.indicators.get("gaze_fixation_time", 0) / 10.0), 4
        )
        importance["gesture_anomalies"]    = round(
            min(1.0, result.indicators.get("gesture_anomalies", 0) * 100.0), 4
        )
        return importance

    importance["video_model_prob"]       = round(float(result.details.get("video_model_prob") or 0), 4)
    importance["face_detection_penalty"] = round(max(0.0, (1.0 - result.face_detection_ratio) * 0.15), 4)
    importance["gaze_fixation"]          = round(
        -0.1 * result.indicators.get("gaze_fixation_time", 0), 4
    )  # more fixation = lower risk
    importance["gesture_anomalies"]      = round(
        0.05 * result.indicators.get("gesture_anomalies", 0), 4
    )
    return importance


def analyze_video_with_explainability(video_path: str, **kwargs) -> dict:
    """
    Full pipeline: analyze_video + explain_risk_score.
    Returns API-ready dict with keys:
      risk, indicators, gaze_metrics, shap_importance, details
    """
    result     = analyze_video(video_path, **kwargs)
    importance = explain_risk_score(result)

    return {
        "risk":             result.risk_score,
        "indicators":       result.indicators,
        "gaze_metrics":     result.gaze_metrics,
        "shap_importance":  importance,
        "details":          result.details,
    }


# ── CLI ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys as _sys

    _path = _sys.argv[1] if len(_sys.argv) > 1 else None
    if not _path or not os.path.isfile(_path):
        print("Usage: python screening.py <video_path>")
        print("       python -m ml.screening <video_path>")
        _sys.exit(1)

    _result = analyze_video(_path)
    print(f"Risk score          : {_result.risk_score:.3f}")
    print(f"Face detection ratio: {_result.face_detection_ratio:.3f}")
    print(f"Video model P(ASD)  : {_result.video_model_prob}")
    print(f"Indicators          : {_result.indicators}")
    print(f"Details             : {_result.details}")
