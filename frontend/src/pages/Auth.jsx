import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Stethoscope, Heart, Users, Eye, EyeOff, ArrowRight, CheckCircle2, Shield, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const roles = [
  { value: "clinician", label: "Clinician", icon: Stethoscope, desc: "Pediatrician or specialist", color: "from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-400/60" },
  { value: "parent", label: "Parent", icon: Heart, desc: "Caregiver or family", color: "from-rose-500/20 to-rose-600/10 border-rose-500/30 hover:border-rose-400/60" },
  { value: "therapist", label: "Therapist", icon: Users, desc: "Speech, ABA or OT", color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 hover:border-emerald-400/60" },
];

const roleAccentColors = {
  clinician: "text-blue-400",
  parent: "text-rose-400",
  therapist: "text-emerald-400",
};

const trustedBy = ["Children's Hospital", "ASHA Certified", "ABA Network", "NIH Partner"];

const Auth = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState("parent");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 800));

    try {
      if (isSignUp) {
        // Mock sign up — store user in localStorage
        const user = {
          email,
          full_name: fullName,
          role: selectedRole,
          token: "mock_token_" + Date.now(),
        };
        localStorage.setItem("auth_token", user.token);
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/dashboard");
      } else {
        // Mock sign in — just check something is stored or create a session
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        if (stored.email && stored.email !== email) {
          setError("No account found with this email. Please sign up first.");
          setLoading(false);
          return;
        }
        const user = stored.email
          ? stored
          : { email, full_name: email.split("@")[0], role: "parent", token: "mock_token_" + Date.now() };
        localStorage.setItem("auth_token", user.token);
        localStorage.setItem("user", JSON.stringify(user));

        // Route based on role
        if (user.role === "clinician") navigate("/clinician/dashboard");
        else if (user.role === "therapist") navigate("/therapist/dashboard");
        else navigate("/parent/dashboard");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setEmail("");
    setPassword("");
    setFullName("");
    setError("");
  };

  const strength =
    password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 8 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4
    : 3;
  const strengthColors = ["bg-border", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-secondary"];

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">

      {/* ── Left panel ── */}
      <div className="relative hidden w-[52%] overflow-hidden lg:block">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />

        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/20 backdrop-blur-sm border border-secondary/30">
              <Brain className="h-5 w-5 text-secondary" />
            </div>
            <span className="font-display text-2xl font-bold text-primary-foreground">
              Neuro<span className="text-secondary">Thrive</span>
            </span>
          </motion.div>

          {/* Main copy */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-xs font-medium text-secondary backdrop-blur-sm">
                <Sparkles className="h-3 w-3" />
                AI-Powered Care Platform
              </div>
              <h2 className="text-4xl font-bold leading-tight tracking-tight text-primary-foreground">
                From Early Detection<br />
                to <span className="text-gradient-hero">Lifelong Thriving</span>
              </h2>
              <p className="mt-4 max-w-sm text-base text-primary-foreground/60 leading-relaxed">
                Unified screening, therapy prediction, real-time monitoring, and family support.
              </p>
            </motion.div>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-3"
            >
              {[
                { icon: "🧬", text: "Video-based autism screening in 2–5 minutes" },
                { icon: "📊", text: "XGBoost therapy outcome predictions" },
                { icon: "🔔", text: "Real-time crisis monitoring & alerts" },
                { icon: "💛", text: "Caregiver burnout detection & support" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
                  className="flex items-center gap-3 rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 px-4 py-3 backdrop-blur-sm"
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="text-sm text-primary-foreground/80">{item.text}</span>
                  <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-secondary/70" />
                </motion.div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { v: "78%", l: "Detection Accuracy" },
                { v: "2-5m", l: "Screening Time" },
                { v: "35%", l: "Better Adherence" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-3 text-center backdrop-blur-sm">
                  <div className="font-display text-xl font-bold text-secondary">{s.v}</div>
                  <div className="mt-0.5 text-xs text-primary-foreground/50">{s.l}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Trusted by */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-primary-foreground/40">Trusted by</p>
            <div className="flex flex-wrap gap-2">
              {trustedBy.map((org) => (
                <span key={org} className="rounded-lg border border-primary-foreground/10 bg-primary-foreground/5 px-3 py-1.5 text-xs text-primary-foreground/50 backdrop-blur-sm">
                  {org}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Right: Form ── */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Brain className="h-6 w-6 text-secondary" />
            <span className="font-display text-lg font-bold text-foreground">
              Neuro<span className="text-secondary">Thrive</span>
            </span>
          </div>

          <div className="mb-8">
            <div className="mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-secondary" />
              <span className="text-xs font-medium text-muted-foreground">HIPAA Compliant · Encrypted</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              {isSignUp ? "Create account" : "Welcome back"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {isSignUp ? "Join thousands of clinicians and families" : "Sign in to your NeuroThrive dashboard"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  key="signup-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5 overflow-hidden"
                >
                  <div>
                    <Label htmlFor="fullName" className="text-sm font-medium text-foreground">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Dr. Jane Smith"
                      required={isSignUp}
                      className="mt-1.5 h-11 border-border bg-card text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-secondary"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-foreground">I am a...</Label>
                    <div className="mt-2 grid grid-cols-3 gap-2.5">
                      {roles.map((r) => {
                        const active = selectedRole === r.value;
                        return (
                          <button
                            key={r.value}
                            type="button"
                            onClick={() => setSelectedRole(r.value)}
                            className={`relative flex flex-col items-center gap-2 rounded-xl border-2 bg-gradient-to-b p-3.5 text-center transition-all duration-200 ${r.color} ${
                              active ? "shadow-md scale-[1.02]" : "border-border bg-card hover:scale-[1.01]"
                            }`}
                          >
                            {active && (
                              <motion.div
                                layoutId="role-active"
                                className="absolute inset-0 rounded-[10px] border-2 border-secondary/60"
                                transition={{ duration: 0.2 }}
                              />
                            )}
                            <r.icon className={`h-5 w-5 transition-colors ${active ? roleAccentColors[r.value] : "text-muted-foreground"}`} />
                            <div>
                              <p className={`text-xs font-semibold ${active ? "text-foreground" : "text-muted-foreground"}`}>{r.label}</p>
                              <p className="mt-0.5 text-[10px] text-muted-foreground/70 leading-tight">{r.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="mt-1.5 h-11 border-border bg-card text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-secondary"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                {!isSignUp && (
                  <button type="button" className="text-xs text-secondary hover:underline">Forgot password?</button>
                )}
              </div>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? "Min. 8 characters" : "••••••••"}
                  required
                  minLength={isSignUp ? 8 : 6}
                  className="h-11 border-border bg-card pr-11 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-secondary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {isSignUp && password.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div key={level} className={`h-1 flex-1 rounded-full transition-colors ${strength >= level ? strengthColors[strength] : "bg-border"}`} />
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="group mt-2 h-11 w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold shadow-md transition-all"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-secondary-foreground/30 border-t-secondary-foreground" />
                  Please wait...
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  {isSignUp ? "Create Account" : "Sign In"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs text-muted-foreground">or</span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={switchMode} className="font-semibold text-secondary hover:underline focus:outline-none">
              {isSignUp ? "Sign in" : "Sign up free"}
            </button>
          </p>

          <p className="mt-8 text-center text-xs text-muted-foreground/60">
            By continuing, you agree to our Terms of Service and Privacy Policy.
            <br />All patient data is encrypted and HIPAA compliant.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;