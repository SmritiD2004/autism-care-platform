"""
Streamlit Demo: Video upload → analyze → risk score + SHAP heatmap.

Run: streamlit run streamlit/app.py
"""

import base64
import sys
from pathlib import Path

import streamlit as st
import requests

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

st.set_page_config(
    page_title="ASD Screening Demo",
    page_icon="🧩",
    layout="wide",
)

st.title("🧩 ASD Video Screening")
st.markdown("Upload a short video for gaze/gesture analysis and risk score (0–1). Low<0.3, High>0.7.")

backend_url = st.sidebar.text_input("Backend URL", "http://localhost:8000")

uploaded = st.file_uploader(
    "Upload video (mp4, avi, mov)",
    type=["mp4", "avi", "mov", "webm", "mkv"],
)

if uploaded:
    with st.spinner("Analyzing video..."):
        try:
            r = requests.post(
                f"{backend_url}/api/screening",
                files={"file": (uploaded.name, uploaded.read(), uploaded.type or "video/mp4")},
                timeout=120,
            )
            r.raise_for_status()
            data = r.json()
        except requests.exceptions.RequestException as e:
            st.error(f"API error: {e}")
            st.info("Start the backend: uvicorn backend.main:app --reload")
            st.stop()
        except Exception as e:
            st.error(str(e))
            st.stop()

    risk = data.get("risk", 0)
    indicators = data.get("indicators", {})
    gaze_metrics = data.get("gaze_metrics", {})
    shap = data.get("shap_importance", {})
    heatmap_b64 = data.get("heatmap_base64")

    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Risk Score", f"{risk:.2f}", help="0–1, higher = higher ASD risk")
    with col2:
        st.metric("Gaze Fixation (sec)", f"{indicators.get('gaze_fixation_time', 0):.2f}")
    with col3:
        st.metric("Gesture Anomalies", f"{indicators.get('gesture_anomalies', 0):.4f}")

    st.subheader("Gaze & Face Metrics")
    st.json(gaze_metrics)

    st.subheader("Feature Importance (SHAP-style)")
    if heatmap_b64:
        st.image(base64.b64decode(heatmap_b64), use_container_width=True)
    else:
        st.bar_chart({k: v for k, v in shap.items() if isinstance(v, (int, float))})

    with st.expander("Raw details"):
        st.json(data)

else:
    st.info("Upload a video to run screening.")
