const BASE = process.env.REACT_APP_API || '';

export async function api(path, options = {}) {
  const token = localStorage.getItem('fm_token');
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const get = (path) => api(path);
export const post = (path, body) => api(path, { method: 'POST', body: JSON.stringify(body) });

export function wsUrl() {
  const base = (process.env.REACT_APP_API || window.location.origin).replace(/^http/, 'ws');
  return `${base}/ws/live`;
}
