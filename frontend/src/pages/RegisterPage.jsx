import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function RegisterPage() {
  const [step, setStep] = useState(1) // 1: role selection, 2: credentials
  const [role, setRole] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const roles = [
    {
      id: 'parent',
      title: 'Parent / Caregiver',
      icon: '👨‍👩‍👧',
      description: 'Track your child\'s progress and access therapy recommendations',
      features: ['Video screening', 'Progress tracking', 'Crisis alerts', 'Therapy logs'],
    },
    {
      id: 'clinician',
      title: 'Clinician / Therapist',
      icon: '👨‍⚕️',
      description: 'Manage patients, review screenings, and coordinate care',
      features: ['Patient management', 'All screening tools', 'Therapy planning', 'Analytics dashboard'],
    },
    {
      id: 'admin',
      title: 'Administrator',
      icon: '⚙️',
      description: 'Full system access for research and management',
      features: ['User management', 'System analytics', 'Data export', 'All features unlocked'],
    },
  ]

  const handleRoleSelect = (roleId) => {
    setRole(roleId)
    setStep(2)
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.email || !formData.password || !formData.fullName) {
      setError('All fields are required')
      return
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      // TODO: Replace with actual API call to /api/auth/register
      // For now, simulate success and store in localStorage
      const user = {
        email: formData.email,
        fullName: formData.fullName,
        role: role,
        token: 'temp_token_' + Date.now(),
      }
      
      localStorage.setItem('auth_token', user.token)
      localStorage.setItem('user', JSON.stringify(user))
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect based on role
      navigate('/screening')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div onClick={() => navigate('/')} style={s.logo}>
          <span style={{ ...s.logoIcon, filter: 'hue-rotate(280deg) saturate(1.2)' }}>🧠</span>
          <span style={s.logoText}>Neuro<span style={{ color: '#14b8a6' }}>Thrive</span></span>
        </div>
        <button onClick={() => navigate('/login')} style={s.headerBtn}>
          Already have an account? <strong>Sign In</strong>
        </button>
      </div>

      <div style={s.content}>
        {step === 1 ? (
          /* Step 1: Role Selection */
          <div style={s.container}>
            <h1 style={s.title}>Choose Your Role</h1>
            <p style={s.subtitle}>Select the option that best describes you</p>

            <div style={s.rolesGrid}>
              {roles.map((r) => (
                <div
                  key={r.id}
                  onClick={() => handleRoleSelect(r.id)}
                  style={s.roleCard}
                >
                  <div style={s.roleIcon}>{r.icon}</div>
                  <h3 style={s.roleTitle}>{r.title}</h3>
                  <p style={s.roleDesc}>{r.description}</p>
                  <ul style={s.roleFeatures}>
                    {r.features.map((f, i) => (
                      <li key={i} style={s.roleFeature}>✓ {f}</li>
                    ))}
                  </ul>
                  <button style={s.roleBtn}>Select</button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Step 2: Credentials */
          <div style={s.formContainer}>
            <button onClick={() => setStep(1)} style={s.backBtn}>
              ← Back to role selection
            </button>
            
            <h1 style={s.formTitle}>Create Your Account</h1>
            <p style={s.formSubtitle}>
              Registering as: <strong>{roles.find(r => r.id === role)?.title}</strong>
            </p>

            {error && <div style={s.errorBox}>{error}</div>}

            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.formGroup}>
                <label style={s.label}>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Dr. Jane Smith"
                  style={s.input}
                  autoFocus
                />
              </div>

              <div style={s.formGroup}>
                <label style={s.label}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="jane@example.com"
                  style={s.input}
                />
              </div>

              <div style={s.formGroup}>
                <label style={s.label}>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Minimum 8 characters"
                  style={s.input}
                />
              </div>

              <div style={s.formGroup}>
                <label style={s.label}>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Re-enter password"
                  style={s.input}
                />
              </div>

              <button type="submit" disabled={loading} style={s.submitBtn}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p style={s.terms}>
              By creating an account, you agree to our Terms of Service and Privacy Policy.
              All data is HIPAA compliant and encrypted.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  header: {
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
  logoIcon: { fontSize: '32px' },
  logoText: { fontSize: '24px', fontWeight: '700', color: 'white' },
  headerBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: 'rgba(255,255,255,0.15)',
    color: 'white',
    fontSize: '14px',
    cursor: 'pointer',
  },
  content: {
    padding: '60px 40px',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center',
  },
  title: {
    fontSize: '40px',
    fontWeight: '800',
    color: 'white',
    margin: '0 0 12px 0',
  },
  subtitle: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.85)',
    opacity: 1,
    margin: '0 0 48px 0',
  },
  rolesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  },
  roleCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    ':hover': { transform: 'translateY(-4px)' },
  },
  roleIcon: { fontSize: '48px', marginBottom: '16px' },
  roleTitle: { fontSize: '22px', fontWeight: '700', margin: '0 0 8px 0', color: '#1a1a1a' },
  roleDesc: { fontSize: '14px', color: '#6b7280', margin: '0 0 20px 0', lineHeight: 1.6 },
  roleFeatures: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 24px 0',
    textAlign: 'left',
  },
  roleFeature: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '8px',
  },
  roleBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    background: '#14b8a6',
    color: 'white',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  formContainer: {
    maxWidth: '480px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
  },
  backBtn: {
    padding: '8px 0',
    border: 'none',
    background: 'none',
    color: '#14b8a6',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '24px',
  },
  formTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 8px 0',
  },
  formSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 32px 0',
  },
  errorBox: {
    padding: '12px 16px',
    borderRadius: '8px',
    background: '#fee2e2',
    border: '1px solid #fecaca',
    color: '#991b1b',
    fontSize: '14px',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    textAlign: 'left',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  submitBtn: {
    padding: '14px',
    borderRadius: '8px',
    border: 'none',
    background: '#14b8a6',
    color: 'white',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '8px',
  },
  terms: {
    fontSize: '12px',
    color: '#888',
    marginTop: '24px',
    lineHeight: 1.6,
  },
}
