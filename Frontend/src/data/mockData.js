import appleWatchImg from '../assets/images/apple-watch.png';
import tumblerImg from '../assets/images/tumbler.png';
import sonyHeadphonesImg from '../assets/images/sony-headphones.png';
import studentCardImg from '../assets/images/student-card.png';
import carKeysImg from '../assets/images/car-keys.png';
import laptopBagImg from '../assets/images/laptop-bag.png';
import brownTeddyImg from '../assets/images/brown-teddy.png';
import iphoneImg from '../assets/images/iphone.png';

export const foundItems = [
  {
    id: 'F001',
    name: 'Apple Watch SE',
    image: appleWatchImg,
    location: 'Dekat Perpustakaan IPB',
    time: '14 Apr 2026, 09:00 WIB',
    category: 'Elektronik',
    status: 'found',
    description: 'Smartwatch Apple Watch SE warna silver ditemukan di bangku taman dekat Perpustakaan IPB.',
  },
  {
    id: 'F002',
    name: 'Tumbler Hydroflask',
    image: tumblerImg,
    location: 'Golden Corner',
    time: '13 Apr 2026, 14:30 WIB',
    category: 'Lainnya',
    status: 'found',
    description: 'Tumbler Hydroflask warna hijau ditemukan di meja area makan Golden Corner.',
  },
  {
    id: 'F003',
    name: 'Kunci Kosan + Loker',
    image: sonyHeadphonesImg,
    location: 'Kantin Sapta',
    time: '11 Apr 2026, 13:15 WIB',
    category: 'Kunci',
    status: 'found',
    description: 'Dua anak kunci dengan gantungan akrilik bening. Ditemukan di meja kantin.',
  },
  {
    id: 'F004',
    name: 'Kartu Mahasiswa IPB',
    image: studentCardImg,
    location: 'Halte Bus Kampus',
    time: '10 Apr 2026, 11:00 WIB',
    category: 'Kartu',
    status: 'found',
    description: 'Kartu mahasiswa IPB atas nama tidak diketahui. Ditemukan di lantai halte bus kampus.',
  },
  {
    id: 'F005',
    name: 'Smart Key Mobil Toyota',
    image: carKeysImg,
    location: 'Gedung Rektorat Andi Hakim',
    time: '10 Apr 2026, 16:45 WIB',
    category: 'Kunci',
    status: 'found',
    description: 'Kunci mobil Toyota warna hitam polos tanpa gantungan. Diserahkan oleh satpam.',
  },
];

export const lostItems = [
  {
    id: 'L001',
    name: 'Kunci Motor Honda',
    image: carKeysImg,
    location: 'Parkiran Faperta',
    time: '12 Apr 2026, 08:30 WIB',
    category: 'Kunci',
    status: 'lost',
    description: "Gantungan kunci karet warna hitam tulisan 'Vario'. Hilang sekitar parkiran Fakultas...",
  },
  {
    id: 'L002',
    name: 'Tas Laptop Hitam',
    image: laptopBagImg,
    location: 'Dramaga Campus Bus',
    time: '11 Apr 2026, 17:00 WIB',
    category: 'Lainnya',
    status: 'lost',
    description: 'Tas laptop warna hitam merk Targus. Tertinggal di bus kampus Dramaga.',
  },
  {
    id: 'L003',
    name: 'Boneka Kulit Coklat',
    image: brownTeddyImg,
    location: 'Masjid Al-Hurriyah',
    time: '09 Apr 2026, 12:00 WIB',
    category: 'Lainnya',
    status: 'lost',
    description: 'Boneka teddy bear kecil warna coklat. Hilang di sekitar area Masjid Al-Hurriyah.',
  },
  {
    id: 'L004',
    name: 'iPhone 13 Pro Max',
    image: iphoneImg,
    location: 'Graha Widya Wisuda',
    time: '08 Apr 2026, 19:30 WIB',
    category: 'Elektronik',
    status: 'lost',
    description: 'iPhone 13 Pro Max warna Sierra Blue dengan case transparan. Hilang saat acara wisuda.',
  },
];

export const categories = [
  { id: 'elektronik', label: 'Elektronik', icon: 'Smartphone' },
  { id: 'dompet', label: 'Dompet', icon: 'Wallet' },
  { id: 'kunci', label: 'Kunci', icon: 'Key' },
  { id: 'kartu', label: 'Kartu', icon: 'CreditCard' },
  { id: 'lainnya', label: 'Lainnya', icon: 'Package' },
];

export const navLinks = [
  { label: 'Beranda', href: '/', active: true },
  { label: 'Barang Hilang', href: '/lost', active: false },
  { label: 'Barang Ditemukan', href: '/found', active: false },
];
