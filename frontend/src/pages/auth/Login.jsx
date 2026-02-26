// src/pages/auth/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { login as loginRequest } from "../../services/auth";
import "../../styles/design-system.css";

function LoginInner() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [email,        setEmail]        = useState("");
  const [pwd,          setPwd]          = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !pwd) { setError("Both fields are required"); return; }
    setError("");
    setLoading(true);
    try {
      const userData = await loginRequest(email, pwd);
      login(userData);
      navigate(userData.role === "parent" ? "/parent/dashboard" : "/clinician/dashboard");
    } catch (err) {
      const apiMessage = err?.response?.data?.detail;
      setError(typeof apiMessage === "string" ? apiMessage : "Login failed. Check email/password and backend connection.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={s.container}>
      {/* Left panel */}
      <div style={s.leftPanel}>
        <div style={s.leftGlow} />
        <div style={s.leftContent}>
          <div style={s.logo}>
            <div style={s.logoIconBox}>
              <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 9.5 2z"/>
                <path d="M14.5 8A2.5 2.5 0 0 1 17 10.5v9a2.5 2.5 0 0 1-5 0v-9A2.5 2.5 0 0 1 14.5 8z"/>
              </svg>
            </div>
            <span style={s.logoText}>Neuro<span style={s.logoAccent}>Thrive</span></span>
          </div>
          <h2 style={s.leftTitle}>AI-Powered Autism Care Platform</h2>
          <p style={s.leftDesc}>
            From early detection to lifelong thriving — unified screening,
            therapy prediction, monitoring, and family support.
          </p>
          <div style={s.features}>
            {[
              "Early autism detection with 94% accuracy",
              "Personalised AI therapy plan generation",
              "Real-time crisis monitoring & alerts",
              "Unified family & clinician collaboration",
            ].map(f => (
              <div key={f} style={s.featureRow}>
                <div style={s.featureDot} />
                <span style={s.featureText}>{f}</span>
              </div>
            ))}
          </div>
          <div style={s.hipaa}>🔒 HIPAA Compliant · SOC 2 · 256-bit Encryption</div>
        </div>
      </div>

      {/* Right panel */}
      <div style={s.rightPanel}>
        <div style={s.formContainer}>
          <h1 style={s.heading}>Welcome back</h1>
          <p style={s.subheading}>Sign in to your dashboard</p>

          {error && (
            <div style={s.errorBox}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.formGroup}>
              <label style={s.label}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required style={s.input}
                onFocus={e => Object.assign(e.target.style, s.inputFocus)}
                onBlur={e  => Object.assign(e.target.style, s.input)}
              />
            </div>
            <div style={s.formGroup}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label style={s.label}>Password</label>
                <button type="button" style={s.forgotLink}>Forgot password?</button>
              </div>
              <div style={s.passwordWrapper}>
                <input type={showPassword ? "text" : "password"} value={pwd}
                  onChange={e => setPwd(e.target.value)}
                  placeholder="••••••••" required
                  style={{ ...s.input, paddingRight: 56 }}
                  onFocus={e => Object.assign(e.target.style, { ...s.inputFocus, paddingRight: "56px" })}
                  onBlur={e  => Object.assign(e.target.style, { ...s.input,      paddingRight: "56px" })}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)} style={s.eyeBtn}>
                  {showPassword
                    ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={loading ? { ...s.submitBtn, opacity: 0.7, cursor: "not-allowed" } : s.submitBtn}>
              {loading ? <><span style={s.spinner} />Signing in…</> : "Sign In"}
            </button>
          </form>

          <div style={s.divider}>
            <div style={s.dividerLine} /><span style={s.dividerText}>or continue with</span><div style={s.dividerLine} />
          </div>
          <div style={s.socialRow}>
            {["Google", "Microsoft"].map(p => (
              <button key={p} style={s.socialBtn}>
                <span style={{ fontWeight: 800, fontSize: 15 }}>{p[0]}</span>{p}
              </button>
            ))}
          </div>

          <p style={s.toggleText}>
            Don't have an account?{" "}
            <button type="button" style={s.toggleLink} onClick={() => navigate("/register")}>Sign up</button>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  container:   { display: "flex", minHeight: "100vh", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  leftPanel:   { flex: "0 0 46%", background: "linear-gradient(145deg,#0a1628,#0d2a40,#0a2420)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 52px", position: "relative", overflow: "hidden" },
  leftGlow:    { position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 400, background: "radial-gradient(circle,rgba(20,184,166,0.15) 0%,transparent 65%)", pointerEvents: "none" },
  leftContent: { maxWidth: 380, textAlign: "center", position: "relative", zIndex: 1 },
  logo:        { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 28 },
  logoIconBox: { width: 42, height: 42, borderRadius: 10, background: "linear-gradient(135deg,#14b8a6,#0d9488)", display: "flex", alignItems: "center", justifyContent: "center" },
  logoText:    { fontSize: 26, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em" },
  logoAccent:  { color: "#14b8a6" },
  leftTitle:   { fontSize: 22, fontWeight: 700, color: "#f1f5f9", margin: "0 0 14px", lineHeight: 1.3 },
  leftDesc:    { fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: "0 0 32px" },
  features:    { display: "flex", flexDirection: "column", gap: 12, textAlign: "left", marginBottom: 32 },
  featureRow:  { display: "flex", alignItems: "center", gap: 10 },
  featureDot:  { width: 7, height: 7, borderRadius: "50%", background: "#14b8a6", flexShrink: 0 },
  featureText: { fontSize: 14, color: "rgba(255,255,255,0.7)" },
  hipaa:       { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 20, background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.25)", color: "#5eead4", fontSize: 12, fontWeight: 600 },
  rightPanel:  { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 32px", background: "#0f1923" },
  formContainer: { width: "100%", maxWidth: 420 },
  heading:     { fontSize: 30, fontWeight: 800, color: "#f1f5f9", margin: "0 0 6px", letterSpacing: "-0.02em" },
  subheading:  { fontSize: 14, color: "#64748b", margin: "0 0 28px" },
  errorBox:    { display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderRadius: 8, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: 13, marginBottom: 20 },
  form:        { display: "flex", flexDirection: "column", gap: 18 },
  formGroup:   { display: "flex", flexDirection: "column", gap: 7 },
  label:       { fontSize: 13, fontWeight: 600, color: "#94a3b8" },
  input:       { width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 14, color: "#e2e8f0", outline: "none", boxSizing: "border-box", caretColor: "#14b8a6", transition: "border-color 0.15s" },
  inputFocus:  { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(20,184,166,0.5)", boxShadow: "0 0 0 3px rgba(20,184,166,0.1)" },
  passwordWrapper: { position: "relative" },
  eyeBtn:      { position: "absolute", top: 0, bottom: 0, right: 0, padding: "0 14px", display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", color: "#64748b" },
  forgotLink:  { background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#14b8a6", fontWeight: 600, padding: 0 },
  submitBtn:   { width: "100%", padding: "13px", background: "linear-gradient(135deg,#14b8a6,#0d9488)", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 16px rgba(20,184,166,0.35)", marginTop: 4 },
  spinner:     { width: 15, height: 15, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" },
  divider:     { display: "flex", alignItems: "center", gap: 12, margin: "24px 0" },
  dividerLine: { flex: 1, height: 1, background: "rgba(255,255,255,0.07)" },
  dividerText: { fontSize: 12, color: "#475569", whiteSpace: "nowrap" },
  socialRow:   { display: "flex", gap: 10, marginBottom: 24 },
  socialBtn:   { flex: 1, padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#94a3b8", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  toggleText:  { textAlign: "center", fontSize: 13, color: "#475569", margin: 0 },
  toggleLink:  { color: "#14b8a6", fontWeight: 700, cursor: "pointer", border: "none", background: "none" },
};

export default function Login() {
  return (
    <ErrorBoundary fallback={<div style={{ padding: 32, textAlign: "center", color: "#e2e8f0", background: "#0f1923", minHeight: "100vh" }}><h2>Something went wrong</h2></div>}>
      <LoginInner />
    </ErrorBoundary>
  );
}




