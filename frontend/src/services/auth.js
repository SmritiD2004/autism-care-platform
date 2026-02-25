// src/services/auth.js
import { api } from './api';

/**
 * POST /auth/login  –  returns { token, fullName, role, email }
 */
export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  // Persist to localStorage – the AuthContext will read it on reload
  localStorage.setItem('nt_token', data.token);
  localStorage.setItem('nt_user', JSON.stringify(data));
  return data;
}

/** Optional helper – clears everything */
export function logout() {
  localStorage.removeItem('nt_token');
  localStorage.removeItem('nt_user');
}

// -----------------------------
// Proto-only auth helpers
// -----------------------------

/**
 * POST /proto/users
 * Prototype "register": creates a proto user record.
 * Note: proto has no password validation.
 */
export async function protoRegister({ email, fullName, role, password }) {
  const { data } = await api.post('/proto/users', {
    email,
    full_name: fullName,
    role,
    password,
  });
  return data;
}

/**
 * GET /proto/users
 * Prototype "login": finds user by email (no password validation).
 */
export async function protoLogin(email, password) {
  const { data } = await api.post('/proto/login', { email, password });
  const user = data;

  return {
    token: `demo-${Date.now()}`,
    id: user.id,
    email: user.email,
    fullName: user.full_name || '',
    role: user.role || 'parent',
  };
}
