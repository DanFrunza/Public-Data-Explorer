// Use same-origin by default; override with VITE_API_BASE when needed
const API_BASE = import.meta.env.VITE_API_BASE || '';

// Normalized error type
function normalizeError(status, message, details) {
  return { status, message, details };
}

// Core request wrapper
export async function request(method, path, { body, auth = false, signal } = {}) {
  const url = `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
  };

  // Lazy import store to avoid circulars
  let token;
  if (auth) {
    try {
      const { store } = await import('../store/store.js');
      token = store.getState().auth?.token;
    } catch {
      token = null;
    }
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let opts = {
    method: method.toUpperCase(),
    headers,
    signal,
    // Ensure cross-origin cookies (e.g., refresh) are set/sent
    credentials: 'include',
  };
  if (body !== undefined) {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    if (isFormData) {
      // Let browser set correct multipart boundary; remove JSON header
      delete headers['Content-Type'];
      opts.headers = headers;
      opts.body = body;
    } else {
      opts.body = typeof body === 'string' ? body : JSON.stringify(body);
    }
  }

  let res = await fetch(url, opts);
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const payload = isJson ? await res.json().catch(() => null) : null;

  // Attempt token refresh on 401 for authenticated requests
  if (!res.ok && res.status === 401 && auth) {
    try {
      // Call refresh endpoint with cookies
      const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const refreshJson = (refreshRes.headers.get('content-type') || '').includes('application/json')
        ? await refreshRes.json().catch(() => null)
        : null;

      if (refreshRes.ok && refreshJson && refreshJson.accessToken) {
        // Update store with new token (and user if provided)
        try {
          const { store } = await import('../store/store.js');
          const { tokenRefreshed, setCredentials } = await import('../store/slices/authSlice.js');
          store.dispatch(tokenRefreshed({ token: refreshJson.accessToken }));
          if (refreshJson.user) {
            store.dispatch(setCredentials({ token: refreshJson.accessToken, user: refreshJson.user }));
          }
          // Retry original request with updated Authorization header
          const state = store.getState();
          const newToken = state.auth?.token;
          if (newToken) {
            // Preserve original headers and body type; only update Authorization
            opts = { ...opts, headers: { ...headers, 'Authorization': `Bearer ${newToken}` } };
          }
          res = await fetch(url, opts);
          const retryJson = (res.headers.get('content-type') || '').includes('application/json')
            ? await res.json().catch(() => null)
            : null;
          if (res.ok) return retryJson;
          const msg = retryJson?.message || `Request failed (${res.status})`;
          throw normalizeError(res.status, msg, retryJson);
        } catch {
          // If store import/dispatch fails, fall through to error
        }
      } else {
        const msg = refreshJson?.message || 'Unauthorized';
        throw normalizeError(401, msg, refreshJson);
      }
    } catch (err) {
      throw err;
    }
  }

  if (!res.ok) {
    const msg = payload?.message || `Request failed (${res.status})`;
    throw normalizeError(res.status, msg, payload);
  }
  return payload;
}

export const get = (path, opts) => request('GET', path, opts);
export const post = (path, body, opts) => request('POST', path, { ...(opts || {}), body });
export const put = (path, body, opts) => request('PUT', path, { ...(opts || {}), body });
export const del = (path, opts) => request('DELETE', path, opts);
