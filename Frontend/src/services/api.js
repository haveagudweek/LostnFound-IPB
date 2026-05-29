const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

/**
 * Helper untuk mendapatkan token dari Zustand persist storage.
 * Tidak bisa import useAuthStore langsung (hook-only), jadi baca dari localStorage.
 */
function getToken() {
  try {
    const raw = localStorage.getItem('seekem-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.user?.token || null;
  } catch {
    return null;
  }
}

const request = async (path, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.detail || data?.message || 'Terjadi kesalahan pada server.');
  }

  return data;
};

const requestFormData = async (path, options = {}) => {
  const token = getToken();
  const headers = {
    ...options.headers,
  };
  // Do NOT set Content-Type here, let fetch generate the boundary for multipart/form-data
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.detail || data?.message || 'Terjadi kesalahan pada server.');
  }

  return data;
};

export const api = {
  login: ({ email, password }) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  register: ({ name, email, nim, phone, password }) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, nim, phone, password }),
  }),
  getItems: (type = 'all', query = '', filters = {}) => {
    const params = new URLSearchParams({ type, query });
    if (filters.category) params.set('category', filters.category);
    if (filters.location) params.set('location', filters.location);
    return request(`/items?${params.toString()}`);
  },
  getPostedItems: () => request('/admin/items'),
  getItemById: (id) => request(`/items/${id}`),

  // --- REPORTING ---
  reportItem: (data, type) => {
    if (data.file instanceof File) {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('category', data.category);
      formData.append('location', data.location);
      formData.append('time', data.time);
      if (data.description) formData.append('description', data.description);
      formData.append('image', data.file);
      
      return requestFormData(`/items/report/${type}`, {
        method: 'POST',
        body: formData,
      });
    }

    return request(`/items/report/${type}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  sendMessage: (itemId, data) => request(`/laporan/${itemId}/hubungi`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  createClaim: (data) => {
    const formData = new FormData();
    formData.append('ownerName', data.ownerName);
    formData.append('nim', data.nim);
    formData.append('faculty', data.faculty || '');
    formData.append('contact', data.contact || '');
    formData.append('description', data.description);
    if (data.evidenceImage instanceof File) {
      formData.append('evidenceImage', data.evidenceImage);
    }
    return requestFormData(`/items/${data.itemId}/claims`, {
      method: 'POST',
      body: formData,
    });
  },
  confirmLostItemClaimed: (id, user) => request(`/items/${id}/claim-confirmation`, {
    method: 'PATCH',
    body: JSON.stringify(user),
  }),
  getUserHistory: (user) => {
    const params = new URLSearchParams();
    if (user?.id) params.set('userId', user.id);
    if (user?.nim) params.set('nim', user.nim);
    return request(`/history?${params.toString()}`);
  },
  
  // --- NOTIFIKASI ---
  getNotifications: () => request('/notifikasi'),
  markNotificationRead: (id) => request(`/notifikasi/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/notifikasi/read-all', { method: 'PATCH' }),

  getVerificationReports: () => request('/admin/verification'),
  getVerificationReportById: (id) => request(`/admin/verification/${id}`),
  verifyReport: (id, action) => request(`/admin/verification/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ action }),
  }),
  getDashboardStats: () => request('/admin/stats'),
  getClaims: () => request('/admin/claims'),
  getClaimById: (id) => request(`/admin/claims/${id}`),
  verifyClaim: (id, action) => request(`/admin/claims/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ action }),
  }),
  managePostedItem: (id, action) => request(`/admin/items/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ action }),
  }),
};
