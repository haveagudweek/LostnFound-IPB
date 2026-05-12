import { foundItems, lostItems } from '../data/mockData';

// Simulated delay to mimic network request
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Store in memory for this mock
let currentFoundItems = [...foundItems];
let currentLostItems = [...lostItems];
let adminVerificationReports = []; // Simulating admin view

export const api = {
  // --- AUTHENTICATION ---
  login: async ({ email, password }) => {
    await delay(1000);
    if (!email || !password) throw new Error('Email dan password wajib diisi.');
    
    // Hardcoded mock users
    if (email === 'admin@apps.ipb.ac.id' && password === 'admin123') {
      return { id: 1, name: 'Admin', email, role: 'admin' };
    }
    if (email === 'rizky@apps.ipb.ac.id' && password === 'user123') {
      return { id: 2, name: 'Rizky', email, role: 'user' };
    }
    
    throw new Error('Email atau password salah.');
  },

  register: async ({ name, email, password }) => {
    await delay(1000);
    if (!name || !email || !password) throw new Error('Semua kolom wajib diisi.');
    if (!email.endsWith('@apps.ipb.ac.id')) throw new Error('Gunakan email institusi IPB (@apps.ipb.ac.id).');
    
    // Simulate successful registration
    return { id: Date.now(), name, email, role: 'user' };
  },

  // --- ITEMS ---
  getItems: async (type = 'all', query = '') => {
    await delay(800);
    let items;
    if (type === 'found') {
      items = currentFoundItems;
    } else if (type === 'lost') {
      items = currentLostItems;
    } else {
      items = [...currentFoundItems, ...currentLostItems];
    }

    if (query) {
      const q = query.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(q) || 
        item.location.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return items;
  },

  getItemById: async (id) => {
    await delay(500);
    const item = [...currentFoundItems, ...currentLostItems].find(i => i.id === id);
    if (!item) throw new Error('Barang tidak ditemukan.');
    return item;
  },

  // --- REPORTING ---
  reportItem: async (data, type) => {
    await delay(1500);
    if (!data.name || !data.location || !data.time || !data.category) {
      throw new Error('Kolom bertanda * wajib diisi.');
    }
    
    const newItem = {
      id: `${type === 'found' ? 'F' : 'L'}${Date.now().toString().slice(-4)}`,
      name: data.name,
      image: data.image || null, // in real app this would be a URL after upload
      location: data.location,
      time: data.time,
      category: data.category,
      status: type,
      description: data.description,
      reporterId: data.reporterId || 2
    };

    if (type === 'found') currentFoundItems.unshift(newItem);
    else currentLostItems.unshift(newItem);
    
    // Add to admin verification queue
    adminVerificationReports.unshift({
      ...newItem,
      reportType: type,
      status: 'pending_verification'
    });

    return newItem;
  },

  // --- ADMIN ---
  getVerificationReports: async () => {
    await delay(1000);
    return adminVerificationReports;
  },

  verifyReport: async (id, action) => { // action: 'approve' | 'reject'
    await delay(1000);
    const index = adminVerificationReports.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Laporan tidak ditemukan.');
    
    adminVerificationReports[index].status = action === 'approve' ? 'verified' : 'rejected';
    return adminVerificationReports[index];
  }
};
