// src/pages/parent/Dashboard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Card from "../../components/Card";
import Button from "../../components/Button";
import RiskRing from "../../components/RiskRing";
import Screening from "./Screening";
import { riskMeta } from "../../utils/risk";

import "../../styles/design-system.css";
import "../../styles/parent.css";

/* ---------- Mock child data ---------- */
const mockChild = {
  name: "Aarav",
  risk: 65,
  age: 7,
  achievements: [
    "Spoke 5+ words today",
    "Made eye contact during breakfast",
    "Played with siblings",
  ],
};

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [tab, setTab] = useState("home");
  const [child] = useState(mockChild);

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <section className="nt-clinician-page">
      {/* ── Top bar ── */}
      <header className="nt-topbar">
        <div className="nt-topbar-brand">
          Neuro<span className="nt-topbar-accent">Thrive</span>
        </div>
        <Button variant="secondary" size="sm" onClick={handleSignOut}>
          Sign out
        </Button>
      </header>

      {/* ── Content ── */}
      <section className="nt-content">
        {tab === "home" && (
          <>
            {/* ── Hero greeting ── */}
            <Card className="pt-hero nt-card" style={{ background: "#132030", borderRadius: 12, padding: "32px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 14, color: "#64748b", marginBottom: 12 }}>GOOD MORNING</div>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: "#f1f5f9", margin: 0, lineHeight: 1.3 }}>
                Here’s how <strong>{child.name}</strong> is doing today
              </h2>

              {/* 2‑stat responsive row */}
              <div className="grid-3 gap-4 mt-4">
                <Card className="nt-stat" style={{ background: "#0f1923", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "18px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600, marginBottom: 8 }}>RISK</div>
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
                </Card>

                <Card className="nt-stat" style={{ background: "#0f1923", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "18px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600, marginBottom: 8 }}>GOALS TODAY</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#f1f5f9" }}>{child.achievements.length}</div>
                </Card>
              </div>
            </Card>

            {/* ── Risk ring ── */}
            <Card className="nt-card" style={{ background: "#132030", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "24px 26px", marginTop: 24, display: "flex", justifyContent: "center" }}>
              <RiskRing
                value={child.risk}
                color={riskMeta(child.risk).color}
                size={180}
              />
            </Card>

            {/* ── Achievements list ── */}
            <Card className="nt-card" style={{ background: "#132030", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "24px 26px", marginTop: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>Today's achievements</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {child.achievements.map((a, i) => (
                  <li key={i} style={{ fontSize: 14, color: "#94a3b8", marginBottom: 10, paddingLeft: 24, position: "relative", lineHeight: 1.5 }}>
                    <span style={{ position: "absolute", left: 0, color: "#14b8a6", fontWeight: 600 }}>•</span>
                    {a}
                  </li>
                ))}
              </ul>
            </Card>
          </>
        )}

        {/* Future tabs (check‑in, upload) can be added here */}
      </section>

      {tab === "checkin" && (
        <section className="nt-content">
          <Card className="nt-card" style={{ background: "#132030", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "24px 26px" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", margin: "0 0 20px 0" }}>Daily Check-In</h2>
            <div className="col gap-4">
              <div>
                <label style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", display: "block", marginBottom: 8 }}>How is {child.name} feeling?</label>
                <textarea 
                  className="nt-input" 
                  placeholder="Share observations about your child's mood, behavior, and activities..."
                  rows={5}
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#e2e8f0", fontSize: 14, padding: "12px 14px" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", display: "block", marginBottom: 8 }}>Any concerns or milestones today?</label>
                <textarea 
                  className="nt-input" 
                  placeholder="Note any significant events, challenges, or achievements..."
                  rows={4}
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#e2e8f0", fontSize: 14, padding: "12px 14px" }}
                />
              </div>
              <Button variant="primary">Save Check-In</Button>
            </div>
          </Card>
        </section>
      )}

      {tab === "upload" && <Screening />}

      {/* ── Bottom navigation – visible only on mobile ── */}
      <nav className="pt-bottomnav">
        <button
          className={`pt-nav-tab${tab === "home" ? " active" : ""}`}
          onClick={() => setTab("home")}
        >
          🏠 Home
        </button>
        <button
          className={`pt-nav-tab${tab === "checkin" ? " active" : ""}`}
          onClick={() => setTab("checkin")}
        >
          📝 Check‑In
        </button>
        <button
          className={`pt-nav-tab${tab === "upload" ? " active" : ""}`}
          onClick={() => setTab("upload")}
        >
          🎬 Screening
        </button>
      </nav>
    </section>
  );
}
