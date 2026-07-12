// Centralized API client
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || '';

function buildUrl(path) {
  return path.startsWith('http') ? path : `${BACKEND_URL}${path}`;
}

async function apiClient(path, options = {}) {
  const token = localStorage.getItem('token');
  const url = buildUrl(path);

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  };

  // Remove Content-Type for FormData
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const res = await fetch(url, config);
  const data = await res.json();

  if (!res.ok) {
    // Handle token expiry
    if (res.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    throw new Error(data.error || data.message || 'Request failed');
  }

  return data;
}

// Convenience methods
export const api = {
  get: (path) => apiClient(path),
  post: (path, body) => apiClient(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => apiClient(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => apiClient(path, { method: 'DELETE' }),
  raw: apiClient,
};

export default api;
