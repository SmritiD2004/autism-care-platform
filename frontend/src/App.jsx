import { useState, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import Screening from './pages/Screening'
import TherapyLog from './pages/TherapyLog'
import Alerts from './pages/Alerts'
import './App.css'

const AuthContext = createContext(null)

function useAuth() {
  return useContext(AuthContext)
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const t = localStorage.getItem('auth_token')
      if (t) return { token: t, loggedIn: true }
    } catch (_) {}
    return null
  })

  const login = (token) => {
    localStorage.setItem('auth_token', token)
    setUser({ token, loggedIn: true })
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
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
  if (!user?.loggedIn) {
    return <Navigate to="/login" replace />
  }
  return children
}

function LoginPage() {
  const [token, setToken] = useState('')
  const { login } = useAuth()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (token.trim()) login(token.trim())
  }

  return (
    <div className="login-page">
      <h1>Clinician Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Enter token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button type="submit">Log in</button>
      </form>
      <p className="hint">Prototype: enter any string as token</p>
    </div>
  )
}

function Layout({ children }) {
  const { user, logout } = useAuth()
  return (
    <div className="layout">
      <nav>
        <Link to="/screening">Screening</Link>
        <Link to="/therapy">Therapy Log</Link>
        <Link to="/alerts">Alerts</Link>
        {user && <button onClick={logout}>Logout</button>}
      </nav>
      <main>{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/screening" replace />} />
          <Route
            path="/screening"
            element={
              <ProtectedRoute>
                <Layout><Screening /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/therapy"
            element={
              <ProtectedRoute>
                <Layout><TherapyLog /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <Layout><Alerts /></Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
