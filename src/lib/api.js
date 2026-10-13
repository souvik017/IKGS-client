import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

// Token is kept in memory for the session. The backend also sets an httpOnly
// cookie, so a page reload keeps the admin logged in without exposing the token.
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token || null;
};

export const getAccessToken = () => accessToken;

const readCookie = (name) => {
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
};

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  } else {
    // Cookie-authenticated requests use the double-submit CSRF token.
    const csrf = readCookie('ikgs_csrf');
    if (csrf) config.headers['x-csrf-token'] = csrf;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      (error.code === 'ERR_NETWORK'
        ? 'Unable to reach the server. Please check your connection.'
        : 'Something went wrong.');

    // Session expiry: clear the in-memory token so the UI can redirect.
    if (status === 401) {
      accessToken = null;
      window.dispatchEvent(new CustomEvent('ikgs:unauthorized'));
    }

    const normalised = new Error(message);
    normalised.status = status;
    normalised.errors = error.response?.data?.errors;
    return Promise.reject(normalised);
  }
);

export default api;

/** Convenience wrappers returning the `data` payload directly. */
export const get = (url, params) => api.get(url, { params }).then((r) => r.data);
export const post = (url, body, config) => api.post(url, body, config).then((r) => r.data);
export const put = (url, body, config) => api.put(url, body, config).then((r) => r.data);
export const del = (url) => api.delete(url).then((r) => r.data);

/** Fetch a PDF (or other blob) and trigger a download/open in a new tab. */
export async function fetchPdf(url, { download = false } = {}) {
  const response = await api.get(url, {
    params: download ? { download: 1 } : undefined,
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const objectUrl = URL.createObjectURL(blob);
  if (download) {
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = 'document.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
  } else {
    window.open(objectUrl, '_blank', 'noopener');
  }
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
}

/**
 * Resolve an uploaded image path. Relative /uploads paths are prefixed with the
 * API origin so they work when the frontend and API are on different hosts.
 */
export function resolveAsset(path) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const origin = apiUrl.replace(/\/api\/?$/, '');
  return `${origin}${path}`;
}
