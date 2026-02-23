// src/pages/parent/WellBeing.jsx
import { useState } from "react";

const burnoutRisk = 79; // mock value

export default function WellBeing() {
  const [journal,  setJournal]  = useState("");
  const [saved,    setSaved]    = useState(false);

  const handleSave = () => {
    if (!journal.trim()) return;
    setSaved(true);
    setJournal("");
    setTimeout(() => setSaved(false), 3000);
  };

  const riskColor = burnoutRisk >= 70 ? "#ef4444" : burnoutRisk >= 40 ? "#f59e0b" : "#10b981";
  const riskLabel = burnoutRisk >= 70 ? "High" : burnoutRisk >= 40 ? "Medium" : "Low";

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

      <div style={{ padding: "28px 28px", flex: 1, maxWidth: 720 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={pageTitle}>Parent Well-being</h1>
          <p style={pageSub}>A private space to reflect and find support. Your responses are confidential.</p>
        </div>

        {/* Daily Journal */}
        <div style={{ ...card, marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>
            Daily Journal
          </div>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 18 }}>
            How are you feeling today? This is a safe space for you.
          </div>

          <textarea
            value={journal}
            onChange={e => setJournal(e.target.value)}
            placeholder="Today was challenging because... / I'm feeling proud of... / I need support with..."
            rows={5}
            style={textareaStyle}
            onFocus={e => { e.target.style.borderColor = "rgba(20,184,166,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(20,184,166,0.1)"; }}
            onBlur={e  => { e.target.style.borderColor = "rgba(255,255,255,0.09)"; e.target.style.boxShadow = "none"; }}
          />

          {saved && (
            <div style={{ marginBottom: 12, padding: "9px 14px", background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.3)", borderRadius: 8, color: "#14b8a6", fontSize: 13, fontWeight: 600 }}>
              ✓ Journal entry saved!
            </div>
          )}

          <button onClick={handleSave} style={{ ...tealBtn, marginTop: 4 }}>
            Save Entry to Diary
          </button>
        </div>

        {/* Burnout Risk */}
        <div style={{ ...card, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 2 }}>
                Your Burnout Risk
              </div>
              <div style={{ fontSize: 13, color: "#64748b" }}>Based on your recent entries.</div>
            </div>
            <span style={{
              background: `${riskColor}22`, color: riskColor,
              border: `1px solid ${riskColor}44`,
              borderRadius: 6, padding: "4px 12px",
              fontSize: 12, fontWeight: 700,
            }}>
              {riskLabel}
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 6 }}>
            <span>Low</span>
            <span>High</span>
          </div>
          <div style={{ height: 10, background: "rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
            <div style={{
              height: "100%", width: `${burnoutRisk}%`,
              background: `linear-gradient(90deg, #10b981, ${riskColor})`,
              borderRadius: 10, transition: "width 0.6s ease",
            }} />
          </div>
          <div style={{ textAlign: "right", fontSize: 13, fontWeight: 700, color: riskColor }}>
            {burnoutRisk}%
          </div>
        </div>

        {/* Why I'm Here — tips box */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12, padding: "20px 22px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fcd34d" }}>Why I'm here</span>
          </div>
          <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.65, marginBottom: 14, margin: "0 0 14px" }}>
            Studies show that caregiver burnout is very common among families supporting children
            with autism. It's important to monitor yourself and seek help when needed.
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { text: "1-in-4 Parents of autistic children experience burnout", href: "#" },
              { text: "Learn about Caregiver Fatigue",                           href: "#" },
              { text: "Find local support groups",                                href: "#" },
            ].map((item, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#14b8a6", flexShrink: 0 }} />
                <a href={item.href} style={{ fontSize: 13, color: "#14b8a6", textDecoration: "none", fontWeight: 500 }}>
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
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
  background: "#132030", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "22px 24px",
};
const textareaStyle = {
  width: "100%", padding: "11px 14px",
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: 8, fontSize: 14, color: "#e2e8f0",
  outline: "none", boxSizing: "border-box",
  fontFamily: "inherit", caretColor: "#14b8a6",
  resize: "vertical", lineHeight: 1.6,
  marginBottom: 12, transition: "border-color 0.15s",
};
const tealBtn = {
  width: "100%", padding: 12,
  background: "linear-gradient(135deg,#14b8a6,#0d9488)",
  color: "#fff", border: "none", borderRadius: 8,
  fontSize: 14, fontWeight: 700, cursor: "pointer",
  boxShadow: "0 4px 14px rgba(20,184,166,0.28)",
};
