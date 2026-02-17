"""
Local test for screening module.

Usage:
  python ml/test.py path/to/video.mp4
  python -m ml.test
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


def main():
    video_path = sys.argv[1] if len(sys.argv) > 1 else None
    if not video_path or not Path(video_path).is_file():
        print("Usage: python ml/test.py <video_path>")
        print("  Tests analyze_video and explain_risk_score.")
        sys.exit(1)

    from ml.screening import analyze_video, analyze_video_with_explainability, explain_risk_score

    result = analyze_video(video_path)
    importance = explain_risk_score(result)

    print("Risk score:", result.risk_score)
    print("Indicators:", result.indicators)
    print("SHAP importance:", importance)

    out = analyze_video_with_explainability(video_path)
    assert "risk" in out and "shap_importance" in out
    print("API-style output OK.")


if __name__ == "__main__":
    main()
