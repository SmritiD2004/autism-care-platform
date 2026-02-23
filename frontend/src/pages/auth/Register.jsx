// src/pages/auth/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import "../../styles/design-system.css";

const roleOptions = [
  {
    id: "parent",
    title: "Parent / Caregiver",
    icon: "👨‍👩‍👧",
    color: "#f59e0b",
    colorBg: "rgba(245,158,11,0.1)",
    colorBorder: "rgba(245,158,11,0.25)",
    description: "Track your child's progress and access therapy recommendations",
    features: ["Video screening", "Progress tracking", "Crisis alerts", "Therapy logs"],
  },
  {
    id: "clinician",
    title: "Clinician / Therapist",
    icon: "🩺",
    color: "#14b8a6",
    colorBg: "rgba(20,184,166,0.1)",
    colorBorder: "rgba(20,184,166,0.25)",
    description: "Manage patients, review screenings, and coordinate care",
    features: ["Patient management", "All screening tools", "Therapy planning", "Analytics dashboard"],
  },
  {
    id: "admin",
    title: "Administrator",
    icon: "⚙️",
    color: "#818cf8",
    colorBg: "rgba(129,140,248,0.1)",
    colorBorder: "rgba(129,140,248,0.25)",
    description: "Full system access for research and management",
    features: ["User management", "System analytics", "Data export", "All features unlocked"],
  },
];

function RegisterInner() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [step,     setStep]     = useState(1);
  const [role,     setRole]     = useState("");
  const [fullName, setFullName] = useState("");
  const [email,    setEmail]    = useState("");
  const [pwd,      setPwd]      = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [showCfm,  setShowCfm]  = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const selectedRole = roleOptions.find(r => r.id === role);

  const handleRoleSelect = (roleId) => { setRole(roleId); setStep(2); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !pwd) return setError("All fields are required");
    if (pwd !== confirm)             return setError("Passwords do not match");
    if (pwd.length < 8)              return setError("Password must be at least 8 characters");
    setLoading(true);
    try {
      const fake = { token: `demo-${Date.now()}`, fullName, role };
      login(fake);
      navigate(role === "parent" ? "/parent" : "/clinician");
    } catch {
      setError("Registration failed – please try again");
    } finally {
      setLoading(false);
    }
  };

  /* ── shared input style ── */
  const inputStyle = {
    width: "100%", padding: "11px 14px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8, fontSize: 14,
    color: "#e2e8f0", outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
    caretColor: "#14b8a6", transition: "border-color 0.15s, box-shadow 0.15s",
  };
  const onFocus = e => {
    e.target.style.borderColor = "rgba(20,184,166,0.5)";
    e.target.style.boxShadow   = "0 0 0 3px rgba(20,184,166,0.1)";
    e.target.style.background  = "rgba(255,255,255,0.07)";
  };
  const onBlur = e => {
    e.target.style.borderColor = "rgba(255,255,255,0.1)";
    e.target.style.boxShadow   = "none";
    e.target.style.background  = "rgba(255,255,255,0.05)";
  };

  return (
    <div style={s.page}>
      {/* ── Header ── */}
      <header style={s.header}>
        <div style={s.logo} onClick={() => navigate("/")}>
          <div style={s.logoIconBox}>
            <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 9.5 2z"/>
              <path d="M14.5 8A2.5 2.5 0 0 1 17 10.5v9a2.5 2.5 0 0 1-5 0v-9A2.5 2.5 0 0 1 14.5 8z"/>
            </svg>
          </div>
          <span style={s.logoText}>Neuro<span style={s.logoAccent}>Thrive</span></span>
        </div>
        <button style={s.headerBtn} onClick={() => navigate("/login")}>
          Already have an account? <strong style={{ color: "#14b8a6" }}>Sign In</strong>
        </button>
      </header>

      <div style={s.content}>
        {step === 1 ? (
          /* ════════════════════════════════
             STEP 1 – Role selection
          ════════════════════════════════ */
          <div style={s.stepContainer}>
            <div style={s.stepBadge}>STEP 1 OF 2</div>
            <h1 style={s.title}>Choose Your Role</h1>
            <p style={s.subtitle}>Select the option that best describes you</p>

            <div style={s.rolesGrid}>
              {roleOptions.map(r => (
                <div key={r.id} style={s.roleCard}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = r.colorBorder; e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  {/* Icon */}
                  <div style={{ ...s.roleIconBox, background: r.colorBg, border: `1px solid ${r.colorBorder}` }}>
                    <span style={{ fontSize: 28 }}>{r.icon}</span>
                  </div>

                  <h3 style={{ ...s.roleTitle, color: r.color }}>{r.title}</h3>
                  <p style={s.roleDesc}>{r.description}</p>

                  <ul style={s.roleFeatures}>
                    {r.features.map(f => (
                      <li key={f} style={s.roleFeature}>
                        <span style={{ ...s.featureDot, background: r.color }} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    style={{ ...s.roleBtn, background: r.colorBg, color: r.color, border: `1px solid ${r.colorBorder}` }}
                    onClick={() => handleRoleSelect(r.id)}
                    onMouseEnter={e => { e.currentTarget.style.background = r.color; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = r.colorBg; e.currentTarget.style.color = r.color; }}
                  >
                    Select {r.title.split(" /")[0]} →
                  </button>
                </div>
              ))}
            </div>
          </div>

        ) : (
          /* ════════════════════════════════
             STEP 2 – Credentials form
          ════════════════════════════════ */
          <div style={s.formOuter}>
            {/* Left info panel */}
            <div style={s.formLeft}>
              <div style={s.leftGlow} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={s.logo} onClick={() => navigate("/")}>
                  <div style={s.logoIconBox}>
                    <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 9.5 2z"/>
                      <path d="M14.5 8A2.5 2.5 0 0 1 17 10.5v9a2.5 2.5 0 0 1-5 0v-9A2.5 2.5 0 0 1 14.5 8z"/>
                    </svg>
                  </div>
                  <span style={s.logoText}>Neuro<span style={s.logoAccent}>Thrive</span></span>
                </div>

                <div style={{ marginTop: 40 }}>
                  <div style={{ ...s.selectedRoleBadge, background: selectedRole?.colorBg, border: `1px solid ${selectedRole?.colorBorder}`, color: selectedRole?.color }}>
                    <span style={{ fontSize: 18 }}>{selectedRole?.icon}</span>
                    {selectedRole?.title}
                  </div>
                  <h2 style={s.formLeftTitle}>Almost there!</h2>
                  <p style={s.formLeftDesc}>
                    Complete your account setup to start using NeuroThrive's AI-powered care platform.
                  </p>
                </div>

                <div style={s.featureListLeft}>
                  {selectedRole?.features.map(f => (
                    <div key={f} style={s.featureRowLeft}>
                      <div style={{ ...s.featureDot, background: selectedRole?.color }} />
                      <span style={s.featureTextLeft}>{f}</span>
                    </div>
                  ))}
                </div>

                <div style={s.hipaa}>
                  <span>🔒</span>
                  HIPAA Compliant · 256-bit Encryption
                </div>
              </div>
            </div>

            {/* Right form */}
            <div style={s.formRight}>
              <button style={s.backBtn} onClick={() => { setStep(1); setError(""); }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Back to role selection
              </button>

              <div style={{ marginBottom: 28 }}>
                <div style={s.stepBadgeSmall}>STEP 2 OF 2</div>
                <h1 style={s.formTitle}>Create Your Account</h1>
                <p style={s.formSubtitle}>
                  Registering as <strong style={{ color: selectedRole?.color }}>{selectedRole?.title}</strong>
                </p>
              </div>

              {error && (
                <div style={s.errorBox}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={s.form}>
                {/* Full Name */}
                <div style={s.formGroup}>
                  <label style={s.label}>Full Name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="Dr. Jane Smith" required autoFocus
                    style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                  />
                </div>

                {/* Email */}
                <div style={s.formGroup}>
                  <label style={s.label}>Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="jane@example.com" required
                    style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                  />
                </div>

                {/* Password */}
                <div style={s.formGroup}>
                  <label style={s.label}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPwd ? "text" : "password"} value={pwd}
                      onChange={e => setPwd(e.target.value)}
                      placeholder="Minimum 8 characters" required minLength={8}
                      style={{ ...inputStyle, paddingRight: 48 }}
                      onFocus={e => { onFocus(e); e.target.style.paddingRight = "48px"; }}
                      onBlur={e  => { onBlur(e);  e.target.style.paddingRight = "48px"; }}
                    />
                    <button type="button" onClick={() => setShowPwd(p => !p)} style={s.eyeBtn}>
                      {showPwd
                        ? <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div style={s.formGroup}>
                  <label style={s.label}>Confirm Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showCfm ? "text" : "password"} value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Re-enter password" required
                      style={{ ...inputStyle, paddingRight: 48 }}
                      onFocus={e => { onFocus(e); e.target.style.paddingRight = "48px"; }}
                      onBlur={e  => { onBlur(e);  e.target.style.paddingRight = "48px"; }}
                    />
                    <button type="button" onClick={() => setShowCfm(p => !p)} style={s.eyeBtn}>
                      {showCfm
                        ? <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit" disabled={loading}
                  style={loading ? { ...s.submitBtn, opacity: 0.7, cursor: "not-allowed" } : s.submitBtn}
                >
                  {loading
                    ? <><span style={s.spinner} />Creating account…</>
                    : "Create Account →"
                  }
                </button>
              </form>

              <p style={s.terms}>
                By creating an account you agree to our{" "}
                <span style={{ color: "#14b8a6", cursor: "pointer" }}>Terms of Service</span> and{" "}
                <span style={{ color: "#14b8a6", cursor: "pointer" }}>Privacy Policy</span>.
                All data is HIPAA compliant and encrypted.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Styles
───────────────────────────────────────── */
const s = {
  page: {
    minHeight: "100vh",
    background: "#0a1628",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    color: "#e2e8f0",
  },

  /* Header */
  header: {
    padding: "0 40px",
    height: 64,
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "rgba(10,22,40,0.9)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    position: "sticky", top: 0, zIndex: 50,
  },
  logo: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
  logoIconBox: {
    width: 32, height: 32, borderRadius: 8,
    background: "linear-gradient(135deg,#14b8a6,#0d9488)",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  logoText: { fontSize: 18, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em" },
  logoAccent: { color: "#14b8a6" },
  headerBtn: {
    padding: "9px 18px", borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "transparent", color: "#94a3b8",
    fontSize: 13, cursor: "pointer", fontFamily: "inherit",
  },

  content: { padding: "48px 40px 60px" },

  /* ── STEP 1 ── */
  stepContainer: { maxWidth: 1060, margin: "0 auto", textAlign: "center" },
  stepBadge: {
    display: "inline-block", fontSize: 11, fontWeight: 700,
    letterSpacing: "0.1em", color: "#14b8a6",
    background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.25)",
    borderRadius: 20, padding: "4px 12px", marginBottom: 16,
  },
  title: { fontSize: 38, fontWeight: 800, color: "#f1f5f9", margin: "0 0 12px" },
  subtitle: { fontSize: 17, color: "#64748b", margin: "0 0 44px" },

  rolesGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 },
  roleCard: {
    background: "#132030",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14, padding: "28px 24px",
    cursor: "pointer", textAlign: "left",
    transition: "transform 0.18s, border-color 0.18s",
  },
  roleIconBox: {
    width: 58, height: 58, borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 16,
  },
  roleTitle: { fontSize: 18, fontWeight: 700, margin: "0 0 8px" },
  roleDesc:  { fontSize: 13, color: "#64748b", lineHeight: 1.65, margin: "0 0 18px" },
  roleFeatures: { listStyle: "none", padding: 0, margin: "0 0 22px", display: "flex", flexDirection: "column", gap: 8 },
  roleFeature:  { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#94a3b8" },
  featureDot:   { width: 6, height: 6, borderRadius: "50%", flexShrink: 0 },
  roleBtn: {
    width: "100%", padding: "10px 16px", borderRadius: 8,
    fontSize: 13, fontWeight: 700, cursor: "pointer",
    transition: "background 0.15s, color 0.15s",
    fontFamily: "inherit",
  },

  /* ── STEP 2 ── */
  formOuter: {
    maxWidth: 900, margin: "0 auto",
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0,
    background: "#132030",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16, overflow: "hidden",
  },

  /* Left info panel */
  formLeft: {
    background: "linear-gradient(145deg,#0a1628,#0d2a40,#0a2420)",
    padding: "44px 36px",
    position: "relative", overflow: "hidden",
  },
  leftGlow: {
    position: "absolute", top: "20%", left: "50%",
    transform: "translate(-50%,-50%)",
    width: 300, height: 300,
    background: "radial-gradient(circle,rgba(20,184,166,0.18) 0%,transparent 65%)",
    pointerEvents: "none",
  },
  selectedRoleBadge: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "8px 14px", borderRadius: 20,
    fontSize: 13, fontWeight: 600, marginBottom: 16,
  },
  formLeftTitle: { fontSize: 24, fontWeight: 800, color: "#f1f5f9", margin: "0 0 10px" },
  formLeftDesc:  { fontSize: 14, color: "#64748b", lineHeight: 1.7, margin: "0 0 28px" },
  featureListLeft: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 },
  featureRowLeft:  { display: "flex", alignItems: "center", gap: 10 },
  featureTextLeft: { fontSize: 14, color: "#94a3b8" },
  hipaa: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "7px 14px", borderRadius: 20,
    background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.2)",
    color: "#5eead4", fontSize: 12, fontWeight: 600,
  },

  /* Right form */
  formRight: { padding: "40px 36px", background: "#0f1923" },
  backBtn: {
    display: "flex", alignItems: "center", gap: 6,
    background: "none", border: "none", cursor: "pointer",
    color: "#14b8a6", fontSize: 13, fontWeight: 600,
    padding: 0, marginBottom: 24, fontFamily: "inherit",
  },
  stepBadgeSmall: {
    fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#14b8a6",
    marginBottom: 8,
  },
  formTitle:    { fontSize: 26, fontWeight: 800, color: "#f1f5f9", margin: "0 0 6px" },
  formSubtitle: { fontSize: 13, color: "#64748b", margin: 0 },

  errorBox: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "11px 14px", borderRadius: 8,
    background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
    color: "#fca5a5", fontSize: 13, marginBottom: 18,
  },

  form:      { display: "flex", flexDirection: "column", gap: 16 },
  formGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label:     { fontSize: 12, fontWeight: 600, color: "#94a3b8" },

  eyeBtn: {
    position: "absolute", top: 0, bottom: 0, right: 0,
    padding: "0 13px", display: "flex", alignItems: "center",
    background: "none", border: "none", cursor: "pointer", color: "#64748b",
  },

  submitBtn: {
    width: "100%", padding: "13px",
    background: "linear-gradient(135deg,#14b8a6,#0d9488)",
    color: "#fff", border: "none", borderRadius: 8,
    fontSize: 15, fontWeight: 700, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    boxShadow: "0 4px 16px rgba(20,184,166,0.35)",
    marginTop: 4, fontFamily: "inherit",
  },
  spinner: {
    width: 14, height: 14,
    border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
    borderRadius: "50%", display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },

  terms: { fontSize: 12, color: "#475569", marginTop: 20, lineHeight: 1.65, textAlign: "center" },
};

export default function Register() {
  return (
    <ErrorBoundary
      fallback={
        <div style={{ padding: 32, textAlign: "center", color: "#e2e8f0" }}>
          <h2>Oops – something broke</h2>
          <p>Our team has been notified. Please try again later.</p>
        </div>
      }
    >
      <RegisterInner />
    </ErrorBoundary>
  );
}
