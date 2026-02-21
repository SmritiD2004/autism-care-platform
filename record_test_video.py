"""
Record a short test video from webcam.
Usage: python record_test_video.py
Saves to: test_video.mp4 (in current directory)
Press Q to stop early, or it auto-stops after 10 seconds.
"""

import cv2
import time

OUTPUT_PATH = "test_video.mp4"
DURATION_SECONDS = 10
FPS = 30

print("Opening webcam...")
cap = cv2.VideoCapture(0)  # 0 = default webcam

if not cap.isOpened():
    print("ERROR: Could not open webcam.")
    print("Try changing the index: cv2.VideoCapture(1) or cv2.VideoCapture(2)")
    exit(1)

# Get actual webcam resolution
width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
print(f"Webcam opened: {width}x{height}")

fourcc = cv2.VideoWriter_fourcc(*"mp4v")
out = cv2.VideoWriter(OUTPUT_PATH, fourcc, FPS, (width, height))

print(f"\nRecording for {DURATION_SECONDS} seconds...")
print("Press Q in the video window to stop early.\n")

start = time.time()
frames_written = 0

while True:
    ret, frame = cap.read()
    if not ret:
        print("ERROR: Failed to read frame from webcam.")
        break

    elapsed = time.time() - start
    remaining = DURATION_SECONDS - elapsed

    # Overlay countdown on frame
    cv2.putText(
        frame,
        f"Recording... {remaining:.1f}s remaining (Q to stop)",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 0, 255),
        2,
    )

    out.write(frame)
    frames_written += 1

    cv2.imshow("Recording - Press Q to stop", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        print("Stopped early by user.")
        break

    if elapsed >= DURATION_SECONDS:
        print("Duration reached, stopping.")
        break

cap.release()
out.release()
cv2.destroyAllWindows()

print(f"\nDone! Saved {frames_written} frames to: {OUTPUT_PATH}")
print(f"\nNow run:")
print(f"  python ml/test.py {OUTPUT_PATH}")
