// src/pages/parent/Screening.jsx
import { useState } from "react";
import axios from "axios";

export default function ParentScreening() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [dragging, setDragging] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true); setError(null);
    try {
      const form = new FormData();
      form.append("video", file);
      const { data } = await axios.post("/api/screening", form);
      setResult(data);
    } catch (e) {
      setError(e.message ?? "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith("video/")) setFile(dropped);
  };

  return (
    <section style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Top bar */}
      <div style={topBar}>
        <div style={searchBox}>
          <svg width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span style={{ color: "#64748b", fontSize: 13 }}>Search patients, screenings...</span>
        </div>
        <Avatar letter="P" />
      </div>

      <div style={{ padding: "28px 28px", flex: 1 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={pageTitle}>New Screening</h1>
          <p style={pageSub}>Upload a video for AI-powered initial screening.</p>
        </div>

        {/* Upload card */}
        <div style={card}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>
            Video Upload
          </div>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
            Please upload a 2-10 minute video of your child's interactions.
          </div>

          {/* Guidelines */}
          <div style={guidelinesBox}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={checkCircle}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>Guidelines for Video Submission</span>
            </div>
            {[
              "Include good lighting and clear audio.",
              "Capture your child's face and interactions clearly.",
              "A typical playtime or a parent-child interaction is ideal.",
              "Videos are securely stored and only accessible to your assigned clinician.",
            ].map((g, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <span style={{ color: "#14b8a6", fontSize: 13, flexShrink: 0 }}>•</span>
                <span style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.55 }}>{g}</span>
              </div>
            ))}
          </div>

          {/* Video file label */}
          <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 8, marginTop: 20 }}>
            Video File
          </div>

          {/* File name strip */}
          <div style={fileStrip}>
            <span style={{ fontSize: 13, color: file ? "#e2e8f0" : "#475569" }}>
              {file ? file.name : "No file chosen"}
            </span>
            <label style={browseBtn}>
              Browse
              <input type="file" accept="video/*" style={{ display: "none" }}
                onChange={e => setFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>

          {/* Drop zone */}
          <div
            style={{
              ...dropZone,
              borderColor: dragging ? "#14b8a6" : "rgba(255,255,255,0.1)",
              background: dragging ? "rgba(20,184,166,0.06)" : "rgba(255,255,255,0.02)",
            }}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("hiddenInput").click()}
          >
            <input id="hiddenInput" type="file" accept="video/*" style={{ display: "none" }}
              onChange={e => setFile(e.target.files?.[0] ?? null)} />
            <svg width="32" height="32" fill="none" stroke="#475569" strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom: 10 }}>
              <polyline points="16 16 12 12 8 16"/>
              <line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
            </svg>
            <div style={{ fontSize: 13, color: "#64748b" }}>
              Drag and drop your video file here, or click to select a file.
            </div>
          </div>

          {error && (
            <div style={{ color: "#fca5a5", fontSize: 13, marginTop: 12, padding: "10px 14px", background: "rgba(239,68,68,0.1)", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)" }}>
              {error}
            </div>
          )}

          {result && (
            <div style={{ marginTop: 16, padding: "14px 16px", background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.3)", borderRadius: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#14b8a6", marginBottom: 4 }}>Screening Complete</div>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>Risk Score: <strong style={{ color: "#e2e8f0" }}>{result.risk?.toFixed(2) ?? "—"}</strong></div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            style={{
              ...submitBtn,
              opacity: (!file || loading) ? 0.5 : 1,
              cursor: (!file || loading) ? "not-allowed" : "pointer",
              marginTop: 20,
            }}
          >
            {loading ? "Processing…" : "Submit for Screening"}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── shared micro-styles ── */
const topBar = {
  background: "#0f1923", borderBottom: "1px solid rgba(255,255,255,0.06)",
  padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
};
const searchBox = {
  display: "flex", alignItems: "center", gap: 10,
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8, padding: "8px 14px", width: 280,
};
const Avatar = ({ letter }) => (
  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#f59e0b,#d97706)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#fff" }}>
    {letter}
  </div>
);
const pageTitle = { fontSize: 28, fontWeight: 700, color: "#f1f5f9", margin: 0 };
const pageSub   = { color: "#64748b", fontSize: 14, margin: "4px 0 0" };
const card = {
  background: "#132030", border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 12, padding: "24px 26px",
};
const guidelinesBox = {
  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 10, padding: "16px 18px",
};
const checkCircle = {
  width: 20, height: 20, borderRadius: "50%",
  background: "rgba(20,184,166,0.15)", border: "1px solid rgba(20,184,166,0.3)",
  display: "flex", alignItems: "center", justifyContent: "center", color: "#14b8a6", flexShrink: 0,
};
const fileStrip = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: 8, padding: "9px 14px", marginBottom: 12,
};
const browseBtn = {
  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 600,
  color: "#94a3b8", cursor: "pointer",
};
const dropZone = {
  border: "2px dashed", borderRadius: 10,
  padding: "36px 24px", textAlign: "center",
  cursor: "pointer", transition: "all 0.15s",
  display: "flex", flexDirection: "column", alignItems: "center",
};
const submitBtn = {
  width: "100%", padding: 13,
  background: "linear-gradient(135deg,#14b8a6,#0d9488)",
  color: "#fff", border: "none", borderRadius: 8,
  fontSize: 15, fontWeight: 700,
  boxShadow: "0 4px 16px rgba(20,184,166,0.3)",
};
