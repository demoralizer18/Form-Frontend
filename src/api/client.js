const BASE_URL = 'https://form-backend-wsxz.onrender.com';

function authHeader() {
  const token = sessionStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export async function apiLogin(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function apiGetMyTeam() {
  const res = await fetch(`${BASE_URL}/api/me/team`, {
    headers: { ...authHeader() },
  });
  return handleResponse(res);
}

export async function apiGetMe() {
  const res = await fetch(`${BASE_URL}/api/me`, {
    headers: { ...authHeader() },
  });
  return handleResponse(res);
}

export async function apiSubmit(placements) {
  const res = await fetch(`${BASE_URL}/api/submit`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body:    JSON.stringify({ placements }),
  });
  return handleResponse(res);
}

export async function apiGetRankings() {
  const res = await fetch(`${BASE_URL}/api/admin/rankings`, {
    headers: { ...authHeader() },
  });
  return handleResponse(res);
}
