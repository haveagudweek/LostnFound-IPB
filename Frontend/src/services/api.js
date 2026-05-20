import { foundItems, lostItems } from '../data/mockData';
import laptopBagImg from '../assets/images/laptop-bag.png';
import studentCardImg from '../assets/images/student-card.png';

// Simulated delay to mimic network request
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Store in memory for this mock
let currentFoundItems = [...foundItems];
let currentLostItems = [...lostItems];
let adminVerificationReports = [
  {
    id: 'LF-0892',
    itemId: 'F006',
    name: 'MacBook Pro M1 Silver',
    reporterName: 'Budi Santoso',
    image: laptopBagImg,
    location: 'Perpustakaan Lt. 2',
    detailLocation: 'FMIPA',
    time: '24 Apr 2026, 14:30',
    reportTime: '25 Apr 2026, 14:30 WIB',
    category: 'Elektronik',
    tag: 'Hilang',
    reportType: 'lost',
    status: 'pending_verification',
    description: 'Telah ditemukan laptop dengan ciri ciri bla bla bla',
  },
  {
    id: 'LF-0891',
    itemId: 'F007',
    name: 'Dompet Kulit Coklat',
    reporterName: 'Siti Aminah',
    image: currentFoundItems[1]?.image,
    location: 'Kantin Sapta',
    detailLocation: 'Kantin Sapta',
    time: '24 Apr 2026, 10:15',
    reportTime: '24 Apr 2026, 10:20 WIB',
    category: 'Lainnya',
    tag: 'Hilang',
    reportType: 'lost',
    status: 'verified',
    description: 'Dompet kulit coklat ditemukan di meja dekat kasir.',
  },
  {
    id: 'LF-0890',
    itemId: 'F008',
    name: 'KTM a/n Budi Santoso',
    reporterName: 'Dian Putri',
    image: studentCardImg,
    location: 'CCR',
    detailLocation: 'CCR',
    time: '23 Apr 2026, 16:45',
    reportTime: '23 Apr 2026, 16:50 WIB',
    category: 'Dokumen',
    tag: 'Temuan',
    reportType: 'found',
    status: 'pending_verification',
    description: 'Kartu tanda mahasiswa ditemukan di area CCR.',
  },
];

let adminClaims = [
  {
    id: 'CLM-882',
    itemId: 'F006',
    reportId: 'LF-0892',
    itemName: 'MacBook Pro 16"',
    image: laptopBagImg,
    ownerName: 'Budi Santoso',
    nim: 'G64180012',
    faculty: 'FMIPA',
    contact: '0812-3456-7890',
    location: 'Library Lt. 3',
    foundDate: 'Oct 24, 2023',
    foundTime: '14:30',
    claimDate: 'Oct 25, 2023 - 14:30 WIB',
    status: 'pending',
    evidenceAttached: true,
    description: 'Laptop saya tertinggal di meja dekat jendela perpustakaan lantai 3 kemarin sore sekitar jam 15.00. Ciri-cirinya ada stiker IPB di pojok kanan bawah lid-nya, dan ada baret sedikit di dekat port USB-C sebelah kiri. Wallpaper-nya foto gunung salju.',
    adminNote: 'Ciri-ciri fisik yang disebutkan cocok dengan barang yang ditemukan. Menunggu verifikasi login/password saat pengambilan fisik.',
    history: 'User has no previous claim history. This is their first interaction with the L&F system.',
  },
  {
    id: 'CLM-883',
    itemId: 'F007',
    reportId: 'LF-0891',
    itemName: 'Dompet Kulit Hitam',
    image: currentFoundItems[1]?.image,
    ownerName: 'Rizky Pratama',
    nim: 'G64210014',
    faculty: 'FEM',
    contact: '0812-2211-3400',
    location: 'Golden Corner',
    foundDate: 'Oct 24, 2023',
    foundTime: '15:10',
    claimDate: 'Oct 25, 2023 - 15:40 WIB',
    status: 'pending',
    evidenceAttached: true,
    description: 'Dompet berisi KTM dan kartu ATM, ada noda kecil di bagian dalam.',
    adminNote: 'Cocokkan KTM saat pemilik datang mengambil barang.',
    history: 'No claim issues found.',
  },
  {
    id: 'CLM-884',
    itemId: 'F008',
    reportId: 'LF-0890',
    itemName: 'Kunci Motor Honda',
    image: currentLostItems[0]?.image,
    ownerName: 'Andi Wijaya',
    nim: 'G64200098',
    faculty: 'Faperta',
    contact: '0813-9021-4421',
    location: 'Parkiran Faperta',
    foundDate: 'Oct 24, 2023',
    foundTime: '16:20',
    claimDate: 'Oct 25, 2023 - 16:00 WIB',
    status: 'pending',
    evidenceAttached: false,
    description: 'Gantungan kunci warna hitam bertuliskan Vario.',
    adminNote: 'Minta bukti STNK atau foto kendaraan.',
    history: 'No previous claim history.',
  },
];

const toAdminReportItem = (report) => ({
  id: report.itemId || report.id,
  name: report.name,
  image: report.image,
  location: report.location,
  time: report.time,
  category: report.category,
  status: report.reportType === 'found' ? 'found' : 'lost',
  description: report.description,
  reporterId: report.reporterId || 2,
});

export const api = {
  // --- AUTHENTICATION ---
  login: async ({ email, password }) => {
    await delay(1000);
    if (!email || !password) throw new Error('Email dan password wajib diisi.');
    
    // Hardcoded mock users
    if (email === 'admin@apps.ipb.ac.id' && password === 'admin123') {
      return { id: 1, name: 'Admin', email, nim: 'ADM001', role: 'admin' };
    }
    if (email === 'rizky@apps.ipb.ac.id' && password === 'user123') {
      return { id: 2, name: 'Rizky', email, nim: 'G64210014', role: 'user' };
    }
    
    throw new Error('Email atau password salah.');
  },

  register: async ({ name, email, nim, password }) => {
    await delay(1000);
    if (!name || !email || !nim || !password) throw new Error('Semua kolom wajib diisi.');
    if (!email.endsWith('@apps.ipb.ac.id')) throw new Error('Gunakan email institusi IPB (@apps.ipb.ac.id).');
    
    // Simulate successful registration
    return { id: Date.now(), name, email, nim, role: 'user' };
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
      id: `LF-${Date.now().toString().slice(-4)}`,
      itemId: newItem.id,
      name: newItem.name,
      reporterName: 'Rizky',
      image: newItem.image,
      location: newItem.location,
      detailLocation: newItem.location,
      time: newItem.time,
      reportTime: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      category: newItem.category,
      tag: type === 'found' ? 'Temuan' : 'Hilang',
      reportType: type,
      status: 'pending_verification',
      description: newItem.description,
      reporterId: newItem.reporterId,
    });

    return newItem;
  },

  // --- ADMIN ---
  getVerificationReports: async () => {
    await delay(1000);
    return adminVerificationReports;
  },

  getVerificationReportById: async (id) => {
    await delay(500);
    const report = adminVerificationReports.find(r => r.id === id);
    if (!report) throw new Error('Laporan tidak ditemukan.');
    return report;
  },

  verifyReport: async (id, action) => { // action: 'approve' | 'reject'
    await delay(1000);
    const index = adminVerificationReports.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Laporan tidak ditemukan.');
    
    adminVerificationReports[index].status = action === 'approve' ? 'verified' : 'rejected';
    const report = adminVerificationReports[index];
    const existsInItems = [...currentFoundItems, ...currentLostItems].some(item => item.id === report.itemId);
    if (action === 'approve' && !existsInItems) {
      const item = toAdminReportItem(report);
      if (report.reportType === 'found') currentFoundItems.unshift(item);
      else currentLostItems.unshift(item);
    }
    return adminVerificationReports[index];
  },

  getClaims: async () => {
    await delay(700);
    return adminClaims;
  },

  getClaimById: async (id) => {
    await delay(500);
    const claim = adminClaims.find(c => c.id === id);
    if (!claim) throw new Error('Klaim tidak ditemukan.');
    return claim;
  },

  verifyClaim: async (id, action) => {
    await delay(900);
    const index = adminClaims.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Klaim tidak ditemukan.');

    adminClaims[index].status = action === 'approve' ? 'approved' : 'rejected';
    return adminClaims[index];
  },
};
