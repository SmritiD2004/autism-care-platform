// src/services/auth.js
import { api } from './api';

/**
 * POST /auth/login  –  normalize backend response to frontend auth shape.
 */
export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });

  // Backend returns: { access_token, token_type, user: { ... } }
  // Frontend expects: { token, email, fullName, role, ... }
  const user = data.user || {};
  const normalized = {
    token: data.access_token || data.token,
    email: user.email || email,
    fullName: user.full_name || user.fullName || '',
    role: user.role || data.role,
    userId: user.id,
  };

  // Persist to localStorage – AuthContext reads this on reload.
  localStorage.setItem('nt_token', normalized.token);
  localStorage.setItem('nt_user', JSON.stringify(normalized));
  return normalized;
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
