// src/pages/parent/CrisisAlerts.jsx
import { useState } from "react";

const mockAlerts = [
  {
    id: 1,
    title: "Significant drop in communication attempts (>50%) and multiple meltdowns reported.",
    patient: "Manish S.",
    date: "2024-07-20",
    severity: "Critical",
    severityColor: "#ef4444",
    severityBg: "rgba(239,68,68,0.15)",
    icon: "🔴",
  },
  {
    id: 2,
    title: "Sleep less than 6 hours for 2 consecutive days.",
    patient: "Manish L.",
    date: "2024-07-19",
    severity: "High",
    severityColor: "#f59e0b",
    severityBg: "rgba(245,158,11,0.15)",
    icon: "⚠️",
  },
  {
    id: 3,
    title: "Increase in reported meltdowns over the past 3 days.",
    patient: "Anya S.",
    date: "2024-07-18",
    severity: "Medium",
    severityColor: "#f59e0b",
    severityBg: "rgba(245,158,11,0.1)",
    icon: "⚠️",
  },
];

const AlertIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

export default function CrisisAlerts() {
  const [dismissed, setDismissed] = useState([]);

  const visibleAlerts = mockAlerts.filter(a => !dismissed.includes(a.id));
  const allClear = visibleAlerts.length === 0;

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
          <h1 style={pageTitle}>Crisis Prediction Alerts</h1>
          <p style={pageSub}>Review and manage high-risk alerts for your child.</p>
        </div>

        {/* All Clear / Active alert banner */}
        {allClear ? (
          <div style={{
            background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
            borderRadius: 12, padding: "18px 22px", marginBottom: 24,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981", flexShrink: 0 }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#10b981" }}>All Clear</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>No critical alerts at this time.</div>
            </div>
          </div>
        ) : (
          <div style={{
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: 12, padding: "14px 20px", marginBottom: 24,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 0 3px rgba(239,68,68,0.25)", display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#fca5a5" }}>
              {visibleAlerts.length} active alert{visibleAlerts.length > 1 ? "s" : ""} — review and take action below
            </span>
          </div>
        )}

        {/* Recent Alerts */}
        <div style={card}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 18 }}>
            Recent Alerts
          </div>

          {visibleAlerts.length === 0 ? (
            <div style={{ textAlign: "center", color: "#64748b", fontSize: 14, padding: "24px 0" }}>
              No alerts to show.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {visibleAlerts.map((alert, i) => (
                <div
                  key={alert.id}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 14,
                    padding: "16px 0",
                    borderBottom: i < visibleAlerts.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                    background: alert.severityBg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: alert.severityColor,
                  }}>
                    <AlertIcon />
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 4, lineHeight: 1.5 }}>
                      {alert.title}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      {alert.patient} · {alert.date}
                    </div>
                  </div>

                  {/* Severity badge + dismiss */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                    <span style={{
                      background: alert.severityBg, color: alert.severityColor,
                      border: `1px solid ${alert.severityColor}40`,
                      borderRadius: 6, padding: "3px 10px",
                      fontSize: 11, fontWeight: 700,
                    }}>
                      {alert.severity}
                    </span>
                    <button
                      onClick={() => setDismissed(d => [...d, alert.id])}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", fontSize: 11, padding: 0 }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
  borderRadius: 12, padding: "22px 24px",
};
