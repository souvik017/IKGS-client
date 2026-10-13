import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { get, post, setAccessToken } from '../lib/api';

const AuthContext = createContext(null);

/**
 * Should we probe the server for an existing admin session?
 *
 * The auth token is an httpOnly cookie, so JavaScript cannot see it directly.
 * The API also sets a readable CSRF cookie at login (see Backend/src/utils/jwt.js),
 * which is a reliable "a session was established in this browser" signal.
 * Probing only when that cookie exists — or when the admin area is being
 * loaded — keeps anonymous visitors from producing a 401 on every page view
 * of the public site. The admin panel always probes, so a signed-in admin
 * still gets their session restored after a reload.
 */
function shouldProbeSession() {
  if (typeof window === 'undefined') return false;
  if (window.location.pathname.startsWith('/admin')) return true;
  return document.cookie.split('; ').some((c) => c.startsWith('ikgs_csrf='));
}

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(shouldProbeSession);

  const loadSession = useCallback(async () => {
    try {
      const res = await get('/auth/me');
      setAdmin(res.data.admin);
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!shouldProbeSession()) {
      setLoading(false);
      return;
    }
    loadSession();
  }, [loadSession]);

  // React to session expiry signalled by the API client.
  useEffect(() => {
    const handler = () => setAdmin(null);
    window.addEventListener('ikgs:unauthorized', handler);
    return () => window.removeEventListener('ikgs:unauthorized', handler);
  }, []);

  const login = async (email, password) => {
    const res = await post('/auth/login', { email, password });
    setAccessToken(res.data.token);
    setAdmin(res.data.admin);
    return res.data.admin;
  };

  const logout = async () => {
    try {
      await post('/auth/logout');
    } catch {
      /* ignore network errors on logout */
    }
    setAccessToken(null);
    setAdmin(null);
    toast.success('Signed out');
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, reload: loadSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
