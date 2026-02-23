// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem('nt_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const login = useCallback(userData => {
    localStorage.setItem('nt_token', userData.token);
    localStorage.setItem('nt_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('nt_token');
    localStorage.removeItem('nt_user');
    setUser(null);
  }, []);

  /** Returns the default route for the logged-in user's role */
  const defaultRoute = useCallback(() => {
    if (!user) return '/login';
    if (user.role === 'parent') return '/parent/dashboard';
    if (user.role === 'clinician' || user.role === 'admin') return '/clinician/dashboard';
    return '/';
  }, [user]);

  const value = {
    user,
    login,
    logout,
    defaultRoute,
    isAuthenticated: !!user,
    role: user?.role ?? null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
