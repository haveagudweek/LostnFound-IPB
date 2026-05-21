export const ITEM_CATEGORIES = [
  { id: 'elektronik', label: 'Elektronik', icon: 'Smartphone' },
  { id: 'dompet', label: 'Dompet', icon: 'Wallet' },
  { id: 'kunci', label: 'Kunci', icon: 'Key' },
  { id: 'kartu-identitas', label: 'Kartu Identitas', icon: 'CreditCard' },
  { id: 'buku-dokumen', label: 'Buku & Dokumen', icon: 'BookOpen' },
  { id: 'tas', label: 'Tas', icon: 'Briefcase' },
  { id: 'botol-minum', label: 'Botol Minum', icon: 'Package' },
  { id: 'alat-tulis', label: 'Alat Tulis', icon: 'PenLine' },
  { id: 'pakaian-jaket', label: 'Pakaian / Jaket', icon: 'Shirt' },
  { id: 'aksesori', label: 'Aksesori', icon: 'Watch' },
  { id: 'perlengkapan-ibadah', label: 'Perlengkapan Ibadah', icon: 'Package' },
  { id: 'olahraga', label: 'Olahraga', icon: 'Package' },
  { id: 'lainnya', label: 'Lainnya', icon: 'Package' },
];

export const CAMPUS_LOCATIONS = [
  'Semua Lokasi',
  'Perpustakaan IPB',
  'Golden Corner',
  'Kantin Sapta',
  'Parkiran Faperta',
  'Dramaga Campus Bus',
  'Gedung Rektorat Andi Hakim',
  'Halte Bus Kampus',
  'Masjid Al-Hurriyah',
  'Graha Widya Wisuda',
  'CCR',
  'Auditorium FMIPA',
  'Gymnasium IPB',
  'Fakultas Kedokteran Hewan',
  'Fakultas Ekonomi dan Manajemen',
  'Fakultas Teknologi Pertanian',
  'Asrama TPB',
  'Student Center',
];

const CATEGORY_ALIASES = {
  kartu: 'kartu-identitas',
  'kartu identitas': 'kartu-identitas',
  dokumen: 'buku-dokumen',
  buku: 'buku-dokumen',
  'buku dokumen': 'buku-dokumen',
  'buku & dokumen': 'buku-dokumen',
  dompet_tas: 'dompet',
  tas: 'tas',
  'tas laptop': 'tas',
  minum: 'botol-minum',
  tumbler: 'botol-minum',
  botol: 'botol-minum',
  'botol minum': 'botol-minum',
  jaket: 'pakaian-jaket',
  pakaian: 'pakaian-jaket',
  'pakaian jaket': 'pakaian-jaket',
};

export function categoryIdFromLabel(value) {
  if (!value) return 'lainnya';

  const lowered = String(value).trim().toLowerCase();
  if (CATEGORY_ALIASES[lowered]) return CATEGORY_ALIASES[lowered];

  const slug = lowered
    .replace(/&/g, ' ')
    .replace(/\//g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return CATEGORY_ALIASES[slug] || slug || 'lainnya';
}

export function categoryLabelFromId(id) {
  return ITEM_CATEGORIES.find((category) => category.id === id)?.label || '';
}
