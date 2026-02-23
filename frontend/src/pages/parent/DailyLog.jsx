// src/pages/parent/DailyLog.jsx
import { useState } from "react";

const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

const MOODS = [
  { label: "Happy",    emoji: "😊", value: "happy"    },
  { label: "Neutral",  emoji: "😐", value: "neutral"  },
  { label: "Irritable",emoji: "😠", value: "irritable"},
];

export default function DailyLog() {
  const [sleep,      setSleep]      = useState("");
  const [mood,       setMood]       = useState("");
  const [commScore,  setCommScore]  = useState("");
  const [meltdowns,  setMeltdowns]  = useState("");
  const [triggers,   setTriggers]   = useState("");
  const [highlights, setHighlights] = useState("");
  const [saved,      setSaved]      = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
          <h1 style={pageTitle}>Daily Log</h1>
          <p style={pageSub}>Track your child's day to help monitor progress and identify patterns.</p>
        </div>

        <div style={card}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 2 }}>
            Log for {today}
          </div>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>
            Fill in the details below.
          </div>

          {/* Row 1 — Sleep + Mood */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div>
              <label style={label}>Sleep (hours)</label>
              <input
                type="number" step="0.5" min="0" max="24"
                value={sleep} onChange={e => setSleep(e.target.value)}
                placeholder="e.g. 6.5"
                style={input}
                onFocus={focusIn} onBlur={focusOut}
              />
            </div>
            <div>
              <label style={label}>Overall Mood</label>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                {MOODS.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setMood(m.value)}
                    style={{
                      flex: 1, padding: "8px 6px", borderRadius: 8,
                      border: `1.5px solid ${mood === m.value ? "#14b8a6" : "rgba(255,255,255,0.09)"}`,
                      background: mood === m.value ? "rgba(20,184,166,0.12)" : "rgba(255,255,255,0.04)",
                      color: mood === m.value ? "#14b8a6" : "#64748b",
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{m.emoji}</span>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2 — Comm score + Meltdowns */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div>
              <label style={label}>Communication Score (0-10)</label>
              <input
                type="number" min="0" max="10"
                value={commScore} onChange={e => setCommScore(e.target.value)}
                placeholder="e.g. 5"
                style={input}
                onFocus={focusIn} onBlur={focusOut}
              />
            </div>
            <div>
              <label style={label}>Meltdowns</label>
              <input
                type="number" min="0"
                value={meltdowns} onChange={e => setMeltdowns(e.target.value)}
                placeholder="e.g. 2"
                style={input}
                onFocus={focusIn} onBlur={focusOut}
              />
            </div>
          </div>

          {/* Meltdown Triggers */}
          <div style={{ marginBottom: 20 }}>
            <label style={label}>Meltdown Triggers (if any)</label>
            <textarea
              value={triggers}
              onChange={e => setTriggers(e.target.value)}
              placeholder="e.g. Loud noise at the store, transition from play time to dinner."
              rows={3}
              style={{ ...input, resize: "vertical" }}
              onFocus={focusIn} onBlur={focusOut}
            />
          </div>

          {/* Positive Moments */}
          <div style={{ marginBottom: 24 }}>
            <label style={label}>Positive Moments &amp; Highlights</label>
            <textarea
              value={highlights}
              onChange={e => setHighlights(e.target.value)}
              placeholder="e.g. Made eye contact while we played, tried a new food without fussing."
              rows={3}
              style={{ ...input, resize: "vertical" }}
              onFocus={focusIn} onBlur={focusOut}
            />
          </div>

          {saved && (
            <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.3)", borderRadius: 8, color: "#14b8a6", fontSize: 13, fontWeight: 600 }}>
              ✓ Log saved successfully!
            </div>
          )}

          <button onClick={handleSave} style={submitBtn}>Save Log</button>
        </div>
      </div>
    </section>
  );
}

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
const label = {
  display: "block", fontSize: 12, fontWeight: 600,
  color: "#94a3b8", marginBottom: 6,
};
const input = {
  width: "100%", padding: "10px 14px",
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: 8, fontSize: 14, color: "#e2e8f0",
  outline: "none", boxSizing: "border-box",
  fontFamily: "inherit", caretColor: "#14b8a6",
  transition: "border-color 0.15s",
};
const focusIn  = e => { e.target.style.borderColor = "rgba(20,184,166,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(20,184,166,0.1)"; };
const focusOut = e => { e.target.style.borderColor = "rgba(255,255,255,0.09)"; e.target.style.boxShadow = "none"; };
const submitBtn = {
  width: "100%", padding: 13,
  background: "linear-gradient(135deg,#14b8a6,#0d9488)",
  color: "#fff", border: "none", borderRadius: 8,
  fontSize: 15, fontWeight: 700, cursor: "pointer",
  boxShadow: "0 4px 16px rgba(20,184,166,0.3)",
};
