// src/pages/parent/Dashboard.jsx
import { useState } from "react";
import RiskRing from "../../components/RiskRing";
import { riskMeta } from "../../utils/risk";

import "../../styles/design-system.css";

/* ---------- Mock child data ---------- */
const mockChild = {
  name: "Aarav",
  risk: 65,
  achievements: [
    "Spoke 5+ words today",
    "Made eye contact during breakfast",
    "Played with siblings",
  ],
};

export default function ParentDashboard() {
  const [child] = useState(mockChild);
  const { colors } = useTheme();

  return (
    <section style={{ background: colors.bgBase, minHeight: "100vh", padding: "24px 20px 40px" }}>
      {/* ── Hero greeting ── */}
      <div style={{ background: colors.bgElevated, borderRadius: 12, padding: "32px 24px", textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 14, color: colors.text2, marginBottom: 12 }}>GOOD MORNING</div>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: colors.text1, margin: 0, lineHeight: 1.3 }}>
          Here's how <strong>{child.name}</strong> is doing today
        </h2>

        {/* 2‑stat responsive row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
          <div style={{ background: colors.bgCard, border: `1px solid ${colors.borderSm}`, borderRadius: 10, padding: "16px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 13, color: colors.text2, fontWeight: 600, marginBottom: 8 }}>RISK</div>
            <div style={{
              padding: "8px 12px",
              background: riskMeta(child.risk).badge === "high" ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)",
              border: riskMeta(child.risk).badge === "high" ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(239,68,68,0.3)",
              borderRadius: 6,
              fontSize: 18,
              fontWeight: 700,
              color: riskMeta(child.risk).badge === "high" ? "#fbbf24" : "#f87171",
            }}>
              {child.risk}%
            </div>
          </div>

          <div style={{ background: colors.bgCard, border: `1px solid ${colors.borderSm}`, borderRadius: 10, padding: "16px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 13, color: colors.text2, fontWeight: 600, marginBottom: 8 }}>GOALS TODAY</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: colors.text1 }}>{child.achievements.length}</div>
          </div>
        </div>
      </div>

      {/* ── Risk ring ── */}
      <div style={{ background: colors.bgElevated, border: `1px solid ${colors.borderXs}`, borderRadius: 12, padding: "24px 26px", marginBottom: 24, display: "flex", justifyContent: "center" }}>
        <RiskRing
          value={child.risk}
          color={riskMeta(child.risk).color}
          size={180}
        />
      </div>

      {/* ── Achievements list ── */}
      <div style={{ background: colors.bgElevated, border: `1px solid ${colors.borderXs}`, borderRadius: 12, padding: "24px 26px" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: colors.text1, marginBottom: 16 }}>Today's achievements</div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {child.achievements.map((a, i) => (
            <li key={i} style={{ fontSize: 14, color: colors.text2, marginBottom: 10, paddingLeft: 24, position: "relative", lineHeight: 1.5 }}>
              <span style={{ position: "absolute", left: 0, color: colors.teal500, fontWeight: 600 }}>•</span>
              {a}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
