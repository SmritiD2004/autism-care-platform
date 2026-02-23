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
