import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('nt_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
