import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const roles = [
  { value: 'clinician', label: 'Clinician', emoji: '🩺', desc: 'Pediatrician or specialist' },
  { value: 'parent', label: 'Parent', emoji: '💛', desc: 'Caregiver or family member' },
  { value: 'therapist', label: 'Therapist', emoji: '🧠', desc: 'Speech, ABA, or OT therapist' },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [selectedRole, setSelectedRole] = useState('parent')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    if (isSignUp && !fullName) {
      setError('Full name is required')
      return
    }

    setLoading(true)

    try {
      // TODO: Replace with actual Supabase auth
      const user = {
        email,
        fullName: fullName || email.split('@')[0],
        role: selectedRole,
        token: 'demo_token_' + Date.now(),
      }
      
      await new Promise(resolve => setTimeout(resolve, 800))
      
      localStorage.setItem('auth_token', user.token)
      localStorage.setItem('user', JSON.stringify(user))
      
      if (user.role === 'parent') {
        navigate('/parent/dashboard')
      } else if (user.role === 'clinician') {
        navigate('/clinician/dashboard')
      } else {
        navigate('/therapist/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const s = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      background: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    },
    leftPanel: {
      flex: 1,
      background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px',
      color: 'white',
      minHeight: '100vh',
    },
    leftContent: {
      maxWidth: '400px',
      textAlign: 'center',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      marginBottom: '24px',
    },
    logoIcon: {
      fontSize: '40px',
    },
    logoText: {
      fontSize: '28px',
      fontWeight: '700',
      color: 'white',
    },
    logoAccent: {
      color: '#14b8a6',
    },
    leftTitle: {
      fontSize: '24px',
      fontWeight: '700',
      marginBottom: '16px',
      color: 'white',
    },
    leftDesc: {
      fontSize: '16px',
      color: 'rgba(255, 255, 255, 0.8)',
      lineHeight: '1.6',
    },
    rightPanel: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
      background: 'white',
    },
    formContainer: {
      width: '100%',
      maxWidth: '420px',
    },
    mobileLogoContainer: {
      display: 'none',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '32px',
    },
    mobileLogoText: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#1a1a1a',
    },
    heading: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1a1a1a',
      marginBottom: '8px',
    },
    subheading: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '32px',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    label: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1a1a1a',
    },
    input: {
      padding: '12px 16px',
      fontSize: '14px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      fontFamily: 'inherit',
    },
    roleSelector: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
    },
    roleBtn: {
      padding: '16px 12px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      background: '#f9fafb',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textAlign: 'center',
    },
    roleBtnActive: {
      borderColor: '#14b8a6',
      background: 'rgba(20, 184, 166, 0.1)',
    },
    roleIcon: {
      fontSize: '24px',
      marginBottom: '8px',
      display: 'block',
    },
    roleLabel: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#1a1a1a',
    },
    submitBtn: {
      padding: '12px 16px',
      fontSize: '16px',
      fontWeight: '600',
      border: 'none',
      borderRadius: '8px',
      background: '#14b8a6',
      color: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    submitBtnHover: {
      background: '#0d9488',
    },
    toggleText: {
      textAlign: 'center',
      fontSize: '14px',
      color: '#6b7280',
      marginTop: '24px',
    },
    toggleLink: {
      color: '#14b8a6',
      fontWeight: '600',
      cursor: 'pointer',
      border: 'none',
      background: 'none',
      textDecoration: 'none',
    },
    error: {
      padding: '12px 16px',
      borderRadius: '8px',
      background: '#fee2e2',
      color: '#991b1b',
      fontSize: '14px',
      marginBottom: '16px',
    },
    '@media (max-width: 1024px)': {
      leftPanel: { display: 'none' },
      mobileLogoContainer: { display: 'flex' },
      rightPanel: { flex: 1 },
    },
  }

  return (
    <div style={s.container}>
      {/* Left Panel */}
      <div style={s.leftPanel}>
        <div style={s.leftContent}>
          <div style={s.logo}>
            <span style={s.logoIcon}>🧠</span>
            <span style={s.logoText}>Neuro<span style={s.logoAccent}>Thrive</span></span>
          </div>
          <h2 style={s.leftTitle}>AI-Powered Autism Care Platform</h2>
          <p style={s.leftDesc}>
            From early detection to lifelong thriving — unified screening, therapy prediction, monitoring, and family support.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div style={s.rightPanel}>
        <div style={s.formContainer}>
          <div style={s.mobileLogoContainer}>
            <span style={{ fontSize: '28px' }}>🧠</span>
            <span style={s.mobileLogoText}>Neuro<span style={s.logoAccent}>Thrive</span></span>
          </div>

          <h1 style={s.heading}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p style={s.subheading}>
            {isSignUp ? 'Join the care network' : 'Sign in to your dashboard'}
          </p>

          {error && <div style={s.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={s.form}>
            {isSignUp && (
              <div style={s.formGroup}>
                <label style={s.label}>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Jane Smith"
                  style={s.input}
                  required={isSignUp}
                />
              </div>
            )}

            {isSignUp && (
              <div style={s.formGroup}>
                <label style={s.label}>I am a...</label>
                <div style={s.roleSelector}>
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setSelectedRole(role.value)}
                      style={{
                        ...s.roleBtn,
                        ...(selectedRole === role.value ? s.roleBtnActive : {}),
                      }}
                    >
                      <span style={s.roleIcon}>{role.emoji}</span>
                      <div style={s.roleLabel}>{role.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={s.formGroup}>
              <label style={s.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={s.input}
                required
              />
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={s.input}
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ ...s.submitBtn, opacity: loading ? 0.6 : 1 }}
              onMouseEnter={(e) => !loading && Object.assign(e.target.style, s.submitBtnHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, { background: '#14b8a6' })}
            >
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p style={s.toggleText}>
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
              }}
              style={s.toggleLink}
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
