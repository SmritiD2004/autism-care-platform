"""
FastAPI Backend Application
Main entry point for the API server
"""

import base64
import os
import tempfile
import sys
from pathlib import Path

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Add project root for ml imports
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

app = FastAPI(
    title="Autism Care Platform API",
    description="Backend API for autism screening and therapy",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Autism Care Platform API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/screening")
async def screening(file: UploadFile = File(...)):
    """
    Accept video upload, run ASD screening, return risk score + SHAP importance + heatmap base64.
    """
    ext = (file.filename or "").split(".")[-1].lower()
    if ext not in ("mp4", "avi", "mov", "webm", "mkv"):
        return {"error": "Unsupported format. Use mp4, avi, mov, webm, or mkv."}

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        from ml.screening import analyze_video_with_explainability

        out = analyze_video_with_explainability(tmp_path)

        heatmap_b64 = None
        try:
            import io
            import matplotlib
            matplotlib.use("Agg")
            import matplotlib.pyplot as plt
            imp = out["shap_importance"]
            names = [k for k, v in imp.items() if isinstance(v, (int, float))]
            vals = [imp[k] for k in names]
            if names and vals:
                fig, ax = plt.subplots(figsize=(6, 4))
                ax.barh(names, vals, color=["#e74c3c" if v > 0 else "#3498db" for v in vals])
                ax.set_xlabel("Contribution to risk")
                ax.set_title("Feature importance (SHAP-style)")
                buf = io.BytesIO()
                plt.savefig(buf, format="png", bbox_inches="tight")
                buf.seek(0)
                heatmap_b64 = base64.b64encode(buf.read()).decode()
                plt.close()
        except Exception:
            pass

        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

        out["heatmap_base64"] = heatmap_b64
        return out

    except Exception as e:
        return {"error": str(e)}


@app.get("/api/v1/models")
async def list_models():
    """List available ML models"""
    return {
        "models": [
            {
                "id": "model_1",
                "name": "Autism Detection Model",
                "version": "1.0.0",
                "status": "available"
            }
        ]
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
