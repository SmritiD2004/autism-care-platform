# NeuroThrive — ML Module

## Overview

The `ml/` module provides the AI backbone for NeuroThrive's three core detection pipelines:

| Pipeline | File | Model |
|---|---|---|
| Video ASD screening | `screening.py` | VGG16+LSTM + MediaPipe fallback |
| Eye-image severity training | `train.py` | PyTorch CNN |
| Dataset loading | `datasets/eyes/loader.py` | ImageFolder-style ETSeverityDataset |

---

## Folder Structure

```
ml/
├── screening.py          ← Main entry point (used by backend API)
├── train.py              ← Train PyTorch CNN on ET eye images
├── test.py               ← Local test runner for screening module
├── requirements.txt      ← ML-specific dependencies
├── README.md             ← This file
│
├── video-asd-model/      ← VGG16+LSTM classifier (weights go here)
│   └── models/
│       └── autism_data/
│           ├── vgg16-lstm-config.npy   ← required for full screening
│           └── vgg16-lstm-weights.h5   ← required for full screening
│
├── models/               ← Trained model artifacts (.pt, .pkl, etc.)
├── notebooks/            ← Jupyter experimentation notebooks
├── training/             ← Training experiment configs and logs
├── preprocessing/        ← Data preprocessing utilities
├── evaluation/           ← Evaluation scripts and metric reports
└── gaze-collector/       ← MediaPipe gaze collection utilities
```

---

## Screening Pipeline (`screening.py`)

The screening module is imported by `backend/routers/screening.py` via:
```python
from ml.screening import analyze_video_with_explainability
```

### How It Works

```
Video Input
    │
    ├─► MediaPipe Face Mesh  → face_detection_ratio, iris_detected_ratio, eye_variance
    ├─► MediaPipe Pose       → gaze_fixation_time, gesture_anomaly_score
    └─► VGG16+LSTM           → P(ASD) from video-asd-model (if weights present)
              │
              ▼
        Risk Score (0–1)
        ├─ Low    < 0.30
        ├─ Medium 0.30–0.70
        └─ High   > 0.70
              │
              ▼
        SHAP-style importance dict → heatmap in API response
```

### Fallback Behaviour
If `vgg16-lstm-weights.h5` is **not present**, the module automatically falls back
to a MediaPipe-only heuristic using gaze fixation time and gesture anomaly score.
The API will still return a valid risk score — it will include `"fallback"` in the
details field to indicate model weights are missing.

### Run Locally
```bash
python ml/screening.py path/to/video.mp4
# or
python -m ml.screening path/to/video.mp4
```

---

## Eye Image Training (`train.py`)

Trains a lightweight PyTorch CNN on the Zenodo ET ASD Severity eye image dataset.

### Dataset Structure Expected
```
datasets/eyes/
├── low/     # images/ subdirectory or images directly in folder
├── mild/
├── medium/
└── high/
```

Severity → risk score mapping: `low=0.2, mild=0.4, medium=0.65, high=0.9`

### Run Training
```bash
# Default (5 epochs, datasets/eyes data)
python -m ml.train

# Custom
python ml/train.py --data datasets/eyes --epochs 20 --lr 0.0005 --save ml/models/et_cnn.pt
```

### Arguments
| Arg | Default | Description |
|---|---|---|
| `--data` | `datasets/eyes` | Path to eye image dataset root |
| `--epochs` | `5` | Number of training epochs |
| `--batch-size` | `32` | Batch size |
| `--lr` | `1e-3` | Learning rate |
| `--save` | `ml/et_cnn.pt` | Where to save trained weights |
| `--val-split` | `0.2` | Fraction of data held out for validation |

---

## Test Runner (`test.py`)

```bash
python ml/test.py path/to/video.mp4
```

Runs `analyze_video` + `explain_risk_score` + `analyze_video_with_explainability`
and asserts the API-style output dict is correct.

---

## Dependencies

Install ML dependencies:
```bash
pip install -r ml/requirements.txt
```

For dev/notebooks only, also uncomment `jupyter` in `requirements.txt`.

> **Note:** `torch` (train.py) and `tensorflow` (video-asd-model) are both required.
> In Docker, both are installed via `Dockerfile.backend`.

---

## Model Guidelines

- Always document model version and training parameters in `ml/models/`
- Store model metadata (training date, dataset version, accuracy) alongside weights
- Never commit large model files (`.h5`, `.pt`) to git — use `.gitignore`
- Follow ethical AI practices: document data provenance, bias checks, and limitations
