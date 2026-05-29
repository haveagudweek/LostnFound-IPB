const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false';

const storageKey = (key) => `seekem-mock-${key}`;
const asset = (fileName) => new URL(`../assets/images/${fileName}`, import.meta.url).href;

const demoUsers = [
  {
    id: 'usr-admin',
    name: 'Admin SEEKEM',
    email: 'admin@apps.ipb.ac.id',
    nim: 'ADM001',
    role: 'admin',
    password: 'admin123',
  },
  {
    id: 'usr-rizky',
    name: 'Rizky Pratama',
    email: 'rizky@apps.ipb.ac.id',
    nim: 'G6401201010',
    role: 'user',
    password: 'user123',
  },
];

const seedItems = [
  {
    id: 'item-001',
    name: 'iPhone 13 Hitam',
    category: 'Elektronik',
    location: 'Perpustakaan IPB',
    time: 'Hari ini, 10:30',
    status: 'found',
    image: asset('iphone.png'),
    description: 'Ditemukan di meja baca lantai 2. Ada casing hitam dan stiker kecil di belakang.',
    reporterName: 'Budi Santoso',
  },
  {
    id: 'item-002',
    name: 'Kartu Mahasiswa',
    category: 'Kartu Identitas',
    location: 'Golden Corner',
    time: 'Kemarin, 16:15',
    status: 'found',
    image: asset('student-card.png'),
    description: 'Kartu mahasiswa ditemukan dekat area kasir.',
    reporterName: 'Siti Aminah',
  },
  {
    id: 'item-003',
    name: 'Kunci Motor Honda',
    category: 'Kunci',
    location: 'Parkiran Faperta',
    time: '20 Mei 2026, 13:00',
    status: 'found',
    image: asset('car-keys.png'),
    description: 'Satu kunci motor dengan gantungan kecil berwarna merah.',
    reporterName: 'Dewi Lestari',
  },
  {
    id: 'item-004',
    name: 'Headphone Sony',
    category: 'Elektronik',
    location: 'Student Center',
    time: '19 Mei 2026, 18:40',
    status: 'lost',
    image: asset('sony-headphones.png'),
    description: 'Headphone warna hitam, terakhir terlihat di area Student Center.',
    reporterName: 'Rizky Pratama',
  },
  {
    id: 'item-005',
    name: 'Tas Laptop Abu-abu',
    category: 'Tas',
    location: 'Auditorium FMIPA',
    time: '18 Mei 2026, 09:20',
    status: 'lost',
    image: asset('laptop-bag.png'),
    description: 'Tas laptop berisi charger dan buku catatan.',
    reporterName: 'Nadia Putri',
  },
  {
    id: 'item-006',
    name: 'Tumbler Hijau',
    category: 'Botol Minum',
    location: 'Kantin Sapta',
    time: '17 Mei 2026, 12:05',
    status: 'found',
    image: asset('tumbler.png'),
    description: 'Tumbler hijau tertinggal di meja kantin.',
    reporterName: 'Andi Saputra',
  },
];

const seedReports = [
  {
    id: 'RPT-001',
    name: 'Apple Watch',
    category: 'Elektronik',
    location: 'Gymnasium IPB',
    detailLocation: 'Tribun sisi timur',
    time: '24 Mei 2026, 08:30',
    reportTime: '24 Mei 2026, 09:00',
    status: 'pending_verification',
    tag: 'Temuan',
    image: asset('apple-watch.png'),
    description: 'Apple Watch dengan strap hitam ditemukan setelah kegiatan olahraga pagi.',
    reporterName: 'Fajar Nugraha',
  },
  {
    id: 'RPT-002',
    name: 'Dompet Cokelat',
    category: 'Dompet',
    location: 'Halte Bus Kampus',
    detailLocation: 'Bangku tunggu halte',
    time: '23 Mei 2026, 17:45',
    reportTime: '23 Mei 2026, 18:05',
    status: 'verified',
    tag: 'Temuan',
    image: asset('brown-teddy.png'),
    description: 'Dompet cokelat berisi beberapa kartu, disimpan oleh admin.',
    reporterName: 'Maya Sari',
  },
];

const seedClaims = [
  {
    id: 'CLM-001',
    itemId: 'item-001',
    reportId: 'RPT-001',
    itemName: 'iPhone 13 Hitam',
    ownerName: 'Rizky Pratama',
    nim: 'G6401201010',
    faculty: 'FMIPA',
    contact: '081234567890',
    location: 'Perpustakaan IPB',
    foundDate: '24 Mei 2026',
    foundTime: '10:30',
    claimDate: '24 Mei 2026',
    status: 'pending',
    image: asset('iphone.png'),
    description: 'Ponsel memakai casing hitam dan wallpaper keluarga.',
    history: 'Klaim pertama untuk barang ini.',
    adminNote: 'Cocokkan detail casing dan bukti kepemilikan sebelum menyetujui.',
  },
];

const delay = (value) => new Promise((resolve) => {
  window.setTimeout(() => resolve(structuredClone(value)), 250);
});

const read = (key, fallback) => {
  const raw = window.localStorage.getItem(storageKey(key));
  if (!raw) return structuredClone(fallback);

  try {
    return JSON.parse(raw);
  } catch {
    return structuredClone(fallback);
  }
};

const write = (key, value) => {
  window.localStorage.setItem(storageKey(key), JSON.stringify(value));
  return value;
};

const publicUser = (user) => {
  const safeUser = { ...user };
  delete safeUser.password;
  return safeUser;
};

const getUsers = () => read('users', demoUsers);
const setUsers = (users) => write('users', users);
const getItems = () => read('items', seedItems);
const setItems = (items) => write('items', items);
const getReports = () => read('reports', seedReports);
const setReports = (reports) => write('reports', reports);
const getClaims = () => read('claims', seedClaims);
const setClaims = (claims) => write('claims', claims);

const createId = (prefix, existing) => {
  const next = existing.length + 1;
  return `${prefix}-${String(next).padStart(3, '0')}`;
};

const matchesText = (item, query) => {
  const term = query.trim().toLowerCase();
  if (!term) return true;

  return [item.name, item.category, item.location, item.description]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(term));
};

const mockApi = {
  async login({ email, password }) {
    const user = getUsers().find((candidate) =>
      candidate.email.toLowerCase() === email.trim().toLowerCase()
      && candidate.password === password
    );

    if (!user) {
      throw new Error('Email atau password salah.');
    }

    return delay(publicUser(user));
  },

  async register({ name, email, nim, password }) {
    const users = getUsers();
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
      throw new Error('Email sudah terdaftar.');
    }

    const user = {
      id: createId('usr', users),
      name: name.trim(),
      email: normalizedEmail,
      nim: nim.trim(),
      role: 'user',
      password,
    };

    setUsers([...users, user]);
    return delay(publicUser(user));
  },

  async getItems(type = 'all', query = '', filters = {}) {
    const items = getItems().filter((item) => {
      const matchesType = type === 'all' || item.status === type;
      const matchesCategory = !filters.category || item.category === filters.category;
      const matchesLocation = !filters.location || item.location === filters.location;
      const isPubliclyPosted = item.postingStatus !== 'held';
      return isPubliclyPosted && matchesType && matchesCategory && matchesLocation && matchesText(item, query);
    });

    return delay(items);
  },

  async getPostedItems() {
    return delay(getItems());
  },

  async getItemById(id) {
    const item = getItems().find((candidate) => candidate.id === id);
    if (!item) throw new Error('Barang tidak ditemukan.');
    return delay(item);
  },

  async reportItem(data, type) {
    const reports = getReports();
    const report = {
      ...data,
      id: createId('RPT', reports),
      status: 'pending_verification',
      tag: type === 'found' ? 'Temuan' : 'Hilang',
      image: data.image || asset(type === 'found' ? 'illust-found.png' : 'illust-lost.png'),
      reportTime: new Date().toLocaleString('id-ID'),
      reporterName: data.reporterName || 'Pelapor SEEKEM',
    };

    setReports([report, ...reports]);
    return delay(report);
  },

  async sendMessage(itemId, message) {
    await mockApi.getItemById(itemId);
    return delay({ ok: true, message });
  },

  async createClaim(payload) {
    const item = await mockApi.getItemById(payload.itemId);
    const claims = getClaims();
    const claim = {
      ...payload,
      id: createId('CLM', claims),
      reportId: payload.reportId || 'RPT-001',
      itemName: item.name,
      location: item.location,
      foundDate: item.time?.split(',')[0] || 'Hari ini',
      foundTime: item.time?.split(',')[1]?.trim() || '',
      claimDate: new Date().toLocaleDateString('id-ID'),
      status: 'pending',
      image: payload.evidenceImage || item.image,
      history: 'Klaim dikirim melalui mode lokal.',
      adminNote: 'Periksa kecocokan detail sebelum menyetujui klaim.',
    };

    setClaims([claim, ...claims]);
    return delay(claim);
  },

  async getUserHistory(user) {
    if (!user) return delay({ reports: [], claims: [] });

    const normalizedName = user.name?.trim().toLowerCase();
    const reports = getReports().filter((report) =>
      report.reporterId === user.id
      || report.reporterName?.trim().toLowerCase() === normalizedName
    );
    const claims = getClaims().filter((claim) =>
      claim.userId === user.id
      || claim.nim === user.nim
      || claim.ownerName?.trim().toLowerCase() === normalizedName
    );

    return delay({ reports, claims });
  },

  async getVerificationReports() {
    return delay(getReports());
  },

  async getVerificationReportById(id) {
    const report = getReports().find((candidate) => candidate.id === id);
    if (!report) throw new Error('Laporan tidak ditemukan.');
    return delay(report);
  },

  async verifyReport(id, action) {
    const reports = getReports();
    const report = reports.find((candidate) => candidate.id === id);
    if (!report) throw new Error('Laporan tidak ditemukan.');

    const updated = {
      ...report,
      status: action === 'approve' ? 'verified' : 'rejected',
    };

    setReports(reports.map((candidate) => (candidate.id === id ? updated : candidate)));

    if (action === 'approve') {
      const items = getItems();
      if (!items.some((item) => item.reportId === id)) {
        const item = {
          id: createId('item', items),
          reportId: id,
          name: updated.name,
          category: updated.category,
          location: updated.location,
          time: updated.time,
          status: updated.tag === 'Hilang' ? 'lost' : 'found',
          image: updated.image,
          description: updated.description,
          reporterName: updated.reporterName,
        };
        setItems([item, ...items]);
      }
    }

    return delay(updated);
  },

  async getClaims() {
    return delay(getClaims());
  },

  async getClaimById(id) {
    const claim = getClaims().find((candidate) => candidate.id === id);
    if (!claim) throw new Error('Klaim tidak ditemukan.');
    return delay(claim);
  },

  async verifyClaim(id, action) {
    const claims = getClaims();
    const claim = claims.find((candidate) => candidate.id === id);
    if (!claim) throw new Error('Klaim tidak ditemukan.');

    const updated = {
      ...claim,
      status: action === 'approve' ? 'approved' : 'rejected',
    };

    setClaims(claims.map((candidate) => (candidate.id === id ? updated : candidate)));

    if (action === 'approve' && claim.itemId) {
      const items = getItems();
      setItems(items.map((item) =>
        item.id === claim.itemId
          ? { ...item, claimStatus: 'claimed', claimantName: claim.ownerName, claimId: claim.id }
          : item
      ));
    }

    if (action !== 'approve' && claim.itemId) {
      const items = getItems();
      setItems(items.map((item) => {
        if (item.id !== claim.itemId || item.claimId !== claim.id) return item;

        const updatedItem = { ...item };
        delete updatedItem.claimStatus;
        delete updatedItem.claimantName;
        delete updatedItem.claimId;
        return updatedItem;
      }));
    }

    return delay(updated);
  },

  async managePostedItem(id, action) {
    const items = getItems();
    const item = items.find((candidate) => candidate.id === id);
    if (!item) throw new Error('Barang tidak ditemukan.');

    if (action === 'delete') {
      setItems(items.filter((candidate) => candidate.id !== id));

      if (item.reportId) {
        const reports = getReports();
        setReports(reports.map((report) =>
          report.id === item.reportId
            ? { ...report, status: 'rejected', adminNote: 'Laporan ditandai ditolak dari halaman barang diposting.' }
            : report
        ));
      }

      return delay({ ok: true, item: { ...item, removed: true, reportStatus: 'rejected' } });
    }

    if (action === 'hold') {
      const updatedItem = { ...item, postingStatus: 'held' };
      setItems(items.map((candidate) => (candidate.id === id ? updatedItem : candidate)));
      return delay({ ok: true, item: updatedItem });
    }

    if (action === 'post') {
      const updatedItem = { ...item };
      delete updatedItem.postingStatus;
      setItems(items.map((candidate) => (candidate.id === id ? updatedItem : candidate)));
      return delay({ ok: true, item: updatedItem });
    }

    if (action === 'cancel_claim') {
      const updatedItem = {
        ...item,
      };
      delete updatedItem.claimStatus;
      delete updatedItem.claimantName;
      delete updatedItem.claimId;

      setItems(items.map((candidate) => (candidate.id === id ? updatedItem : candidate)));

      const claims = getClaims();
      setClaims(claims.map((claim) =>
        claim.itemId === id && claim.status === 'approved'
          ? { ...claim, status: 'pending', adminNote: 'Status klaim dibatalkan oleh admin.' }
          : claim
      ));

      return delay({ ok: true, item: updatedItem });
    }

    throw new Error('Aksi barang tidak dikenal.');
  },
};

const request = async (path, options = {}) => {
  if (!API_BASE_URL) {
    throw new Error('Backend belum dikonfigurasi. Jalankan dengan mock API atau set VITE_API_BASE_URL.');
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Tidak dapat terhubung ke backend. Periksa server API atau gunakan mock API lokal.');
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.detail || data?.message || 'Terjadi kesalahan pada server.');
  }

  return data;
};

const backendApi = {
  login: ({ email, password }) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  register: ({ name, email, nim, password }) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, nim, password }),
  }),
  getItems: (type = 'all', query = '', filters = {}) => {
    const params = new URLSearchParams({ type, query });
    if (filters.category) params.set('category', filters.category);
    if (filters.location) params.set('location', filters.location);
    return request(`/items?${params.toString()}`);
  },
  getPostedItems: () => request('/admin/items'),
  getItemById: (id) => request(`/items/${id}`),
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
  getUserHistory: (user) => {
    const params = new URLSearchParams();
    if (user?.id) params.set('userId', user.id);
    if (user?.nim) params.set('nim', user.nim);
    return request(`/history?${params.toString()}`);
  },
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
  managePostedItem: (id, action) => request(`/admin/items/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ action }),
  }),
};

export const api = USE_MOCK_API ? mockApi : backendApi;
