import { API_BASE_URL } from '../constants/config';

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  let res;
  try {
    res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
      signal: controller.signal,
    });
  } catch (networkErr) {
    throw new Error('Network error: is the backend running and reachable?');
  } finally {
    clearTimeout(timeout);
  }

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Server returned non-JSON response (HTTP ${res.status})`);
  }

  if (!res.ok || json?.success !== true) {
    const msg = json?.message || `Request failed (HTTP ${res.status})`;
    const err = new Error(msg);
    err.statusCode = res.status;
    err.data = json;
    throw err;
  }

  return json.data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
};
