import { useState, createContext, useContext, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import RegisterPage from './pages/RegisterPage'
import Screening from './pages/Screening'
import TherapyLog from './pages/TherapyLog'
import Alerts from './pages/Alerts'

const AuthContext = createContext(null)

function useAuth() {
  return useContext(AuthContext)
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = (userData) => {
    localStorage.setItem('auth_token', userData.token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const existing = localStorage.getItem('user')
    if (existing) navigate('/screening')
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    setLoading(true)

    try {
      // TODO: Replace with actual API call to /api/auth/login
      const user = {
        email: email,
        fullName: 'Demo User',
        role: 'clinician',
        token: 'demo_token_' + Date.now(),
      }

      await new Promise(resolve => setTimeout(resolve, 800))

      login(user)
      navigate('/screening')
    } catch (err) {
      setError(err.message || 'Login failed')
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
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontFamily: 'inherit',
      outline: 'none',
      transition: 'border-color 0.2s',
    },
    inputFocus: {
      borderColor: '#14b8a6',
    },
    errorBox: {
      padding: '12px 16px',
      borderRadius: '8px',
      background: '#fee2e2',
      color: '#991b1b',
      fontSize: '14px',
      marginBottom: '8px',
    },
    submitBtn: {
      padding: '13px 16px',
      fontSize: '16px',
      fontWeight: '600',
      border: 'none',
      borderRadius: '8px',
      background: '#14b8a6',
      color: 'white',
      cursor: 'pointer',
      transition: 'background 0.2s',
      marginTop: '4px',
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
      fontSize: '14px',
    },
  }

  return (
    <div style={s.container}>
      {/* Left Panel */}
      <div style={s.leftPanel}>
        <div style={s.leftContent}>
          <div style={s.logo}>
            <span style={{ ...s.logoIcon, filter: 'hue-rotate(280deg) saturate(1.2)' }}>🧠</span>
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
          <h1 style={s.heading}>Welcome back</h1>
          <p style={s.subheading}>Sign in to your dashboard</p>

          {error && <div style={s.errorBox}>{error}</div>}

          <form onSubmit={handleLogin} style={s.form}>
            <div style={s.formGroup}>
              <label style={s.label}>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={s.input}
                onFocus={(e) => (e.target.style.borderColor = '#14b8a6')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                autoFocus
              />
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={s.input}
                onFocus={(e) => (e.target.style.borderColor = '#14b8a6')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }}
              onMouseEnter={(e) => !loading && (e.target.style.background = '#0d9488')}
              onMouseLeave={(e) => (e.target.style.background = '#14b8a6')}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={s.toggleText}>
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              style={s.toggleLink}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  const navItems = [
    { path: '/screening', label: 'Screening', icon: '🎥', roles: ['admin', 'clinician', 'parent'] },
    { path: '/therapy', label: 'Therapy', icon: '📋', roles: ['admin', 'clinician'] },
    { path: '/alerts', label: 'Alerts', icon: '🔔', roles: ['admin', 'clinician'] },
  ]

  const visibleNav = navItems.filter(item => item.roles.includes(user?.role))

  return (
    <div style={styles.layout}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <span style={{ ...styles.sidebarIcon, filter: 'hue-rotate(280deg) saturate(1.2)' }}>🧠</span>
          <span style={styles.sidebarTitle}>NeuroThrive</span>
        </div>

        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>
            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <div style={styles.userName}>{user?.fullName || 'User'}</div>
            <div style={styles.userRole}>{user?.role || 'Role'}</div>
          </div>
        </div>

        <nav style={styles.nav}>
          {visibleNav.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {}),
                }}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <button onClick={logout} style={styles.logoutButton}>
          🚪 Sign Out
        </button>
      </div>

      <div style={styles.mainContent}>{children}</div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/screening" element={
            <ProtectedRoute>
              <Layout><Screening /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/therapy" element={
            <ProtectedRoute>
              <Layout><TherapyLog /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/alerts" element={
            <ProtectedRoute>
              <Layout><Alerts /></Layout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    background: '#f5f7fb',
  },
  sidebar: {
    width: '240px',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0f172a 0%, #134e4a 100%)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px 16px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    marginBottom: '16px',
  },
  sidebarIcon: { fontSize: '28px' },
  sidebarTitle: { color: 'white', fontSize: '18px', fontWeight: '700' },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#14b8a6',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '18px',
  },
  userName: { color: 'white', fontSize: '14px', fontWeight: '600' },
  userRole: { color: 'rgba(255,255,255,0.6)', fontSize: '12px', textTransform: 'capitalize' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.65)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  navItemActive: {
    background: 'rgba(20, 184, 166, 0.25)',
    color: 'white',
    borderLeft: '3px solid #14b8a6',
  },
  navIcon: { fontSize: '18px' },
  logoutButton: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: 'rgba(255,255,255,0.7)',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    textAlign: 'left',
    marginTop: 'auto',
  },
  mainContent: { marginLeft: '240px', flex: 1, padding: '32px', minHeight: '100vh' },
}