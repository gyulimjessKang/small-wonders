import { auth } from '../firebase';

const API_BASE = import.meta.env.VITE_API_URL || '';

export function apiUrl(path: string) {
  return API_BASE ? `${API_BASE}${path}` : path;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const user = auth.currentUser;
  let token = localStorage.getItem('token') || undefined;
  if (user) {
    token = await user.getIdToken();
    localStorage.setItem('token', token);
  }
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  // Make HTTP request
  const res = await fetch(apiUrl(path), { ...options, headers });
  if (res.status === 401) {
    // token maybe expired, try once more
    if (user) {
      token = await user.getIdToken(true);
      localStorage.setItem('token', token);
      headers.Authorization = `Bearer ${token}`;
      return fetch(apiUrl(path), { ...options, headers });
    }
  }
  return res;
} 