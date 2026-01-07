import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials, setAuthStatus } from '../store/slices/authSlice';

const API_BASE = import.meta.env.VITE_API_URL;

export default function AuthBootstrap() {
  const dispatch = useDispatch();

  useEffect(() => {
    let cancelled = false;
    async function restoreSession() {
      try {
        const res = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (!res.ok) return;
        const data = await res.json().catch(() => null);
        if (!data || !data.accessToken || !data.user) return;
        if (!cancelled) {
          dispatch(setCredentials({ token: data.accessToken, user: data.user }));
          dispatch(setAuthStatus('authenticated'));
        }
      } catch {
        // ignore: no session
      }
    }
    restoreSession();
    return () => { cancelled = true; };
  }, [dispatch]);

  return null;
}
