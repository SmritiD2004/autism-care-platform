"""
Screening router
  POST /api/screening          — upload video → ML analysis → save result
  GET  /api/screening/history  — recent screenings (clinicians/admins only)
"""

import base64
import json
import os
import sys
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import ScreeningLog, Patient, hash_child_id, User
from auth_utils import get_current_user, require_roles
from schemas import ScreeningHistoryResponse, ScreeningHistoryItem

router = APIRouter()

ALLOWED_EXTS = {"mp4", "avi", "mov", "webm", "mkv"}

# Add ML root to path so ml.screening can be imported
ROOT = Path(__file__).resolve().parent.parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


# ── POST /api/screening ───────────────────────────────────────────────────────
@router.post("")
async def run_screening(
    file: UploadFile = File(...),
    db:   Session    = Depends(get_db),
    current_user: User = Depends(get_current_user),   # must be logged in
):
    ext = (file.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTS:
        raise HTTPException(400, f"Unsupported format. Use: {', '.join(ALLOWED_EXTS)}")

    out: dict = {}

    try:
        # 1. Save upload to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        # 2. Run ML model (imported lazily so API starts even without ML deps)
        try:
            from ml.screening import analyze_video_with_explainability
            out = analyze_video_with_explainability(tmp_path)
        except ImportError:
            # ML not installed — return a placeholder for dev/testing
            out = {
                "risk": 0.0,
                "indicators": {},
                "gaze_metrics": {},
                "shap_importance": {},
                "_ml_unavailable": True,
            }

        # 3. Generate SHAP heatmap PNG → base64
        heatmap_b64: Optional[str] = None
        try:
            import io
            import matplotlib
            matplotlib.use("Agg")
            import matplotlib.pyplot as plt

            imp   = out.get("shap_importance", {})
            names = [k for k, v in imp.items() if isinstance(v, (int, float))]
            vals  = [imp[k] for k in names]
            if names:
                fig, ax = plt.subplots(figsize=(6, 4))
                ax.barh(names, vals, color=["#e74c3c" if v > 0 else "#3498db" for v in vals])
                ax.set_xlabel("Contribution to risk")
                ax.set_title("Feature importance (SHAP)")
                buf = io.BytesIO()
                plt.savefig(buf, format="png", bbox_inches="tight")
                buf.seek(0)
                heatmap_b64 = base64.b64encode(buf.read()).decode()
                plt.close()
        except Exception as e:
            print(f"[heatmap] skipped: {e}")

        out["heatmap_base64"] = heatmap_b64

        # 4. Persist to Postgres
        log = ScreeningLog(
            clinician_user_id = current_user.id,
            video_path_hashed = hash_child_id(file.filename or "unknown"),
            risk_score        = float(out.get("risk", 0.0)),
            indicators_json   = json.dumps(out.get("indicators", {})),
            shap_json         = json.dumps(out.get("shap_importance", {})),
            heatmap_base64    = heatmap_b64,
            consent_given     = True,
        )
        db.add(log)
        db.commit()
        db.refresh(log)

        out["screening_log_id"]  = log.id
        out["saved_to_database"] = True
        print(f"✓ Screening saved (ID {log.id}) by user {current_user.id}")

    except HTTPException:
        raise
    except Exception as e:
        out["error"]             = str(e)
        out["saved_to_database"] = False
    finally:
        if "tmp_path" in locals() and os.path.exists(tmp_path):
            os.unlink(tmp_path)

    return out


# ── GET /api/screening/history ────────────────────────────────────────────────
@router.get("/history", response_model=ScreeningHistoryResponse)
def screening_history(
    limit: int = 20,
    db:    Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "clinician", "therapist")),
):
    logs = (
        db.query(ScreeningLog)
        .order_by(ScreeningLog.created_at.desc())
        .limit(min(limit, 100))
        .all()
    )

    items = [
        ScreeningHistoryItem(
            id           = log.id,
            risk_score   = log.risk_score,
            created_at   = log.created_at,
            indicators   = json.loads(log.indicators_json) if log.indicators_json else {},
            clinician_id = log.clinician_user_id,
        )
        for log in logs
    ]
    return ScreeningHistoryResponse(count=len(items), screenings=items)
