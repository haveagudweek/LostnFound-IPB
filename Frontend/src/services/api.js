const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.detail || data?.message || 'Terjadi kesalahan pada server.');
  }

  return data;
};

export const api = {
  // --- AUTHENTICATION ---
  login: ({ email, password }) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),

  register: ({ name, email, nim, password }) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, nim, password }),
  }),

  // --- ITEMS ---
  getItems: (type = 'all', query = '', filters = {}) => {
    const params = new URLSearchParams({ type, query });
    if (filters.category) params.set('category', filters.category);
    if (filters.location) params.set('location', filters.location);
    return request(`/items?${params.toString()}`);
  },

  getItemById: (id) => request(`/items/${id}`),

  // --- REPORTING ---
  reportItem: (data, type) => request(`/items/report/${type}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  sendMessage: (itemId, message) => request(`/contact/${itemId}`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  }),

  createClaim: (payload) => request('/admin/claims', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // --- ADMIN ---
  getVerificationReports: () => request('/admin/verification'),

  getVerificationReportById: (id) => request(`/admin/verification/${id}`),

  verifyReport: (id, action) => request(`/admin/verification/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ action }),
  }),

  getClaims: () => request('/admin/claims'),

  getClaimById: (id) => request(`/admin/claims/${id}`),

  verifyClaim: (id, action) => request(`/admin/claims/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ action }),
  }),
};
