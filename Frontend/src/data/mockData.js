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
    time: '2 jam yang lalu',
    category: 'Elektronik',
    status: 'found',
  },
  {
    id: 'F002',
    name: 'Tumbler Hydroflask',
    image: tumblerImg,
    location: 'Golden Corner',
    time: '5 jam yang lalu',
    category: 'Lainnya',
    status: 'found',
  },
  {
    id: 'F003',
    name: 'Sony WH-1000XM4',
    image: sonyHeadphonesImg,
    location: 'Auditorium FMIPA',
    time: 'Kemarin',
    category: 'Elektronik',
    status: 'found',
  },
  {
    id: 'F004',
    name: 'Kartu Mahasiswa IPB',
    image: studentCardImg,
    location: 'Halte Bus Kampus',
    time: 'Kemarin',
    category: 'Kartu',
    status: 'found',
  },
];

export const lostItems = [
  {
    id: 'L001',
    name: 'Kunci Mobil Toyota',
    image: carKeysImg,
    location: 'Gymnasium IPB',
    time: '2 jam yang lalu',
    category: 'Kunci',
    status: 'lost',
  },
  {
    id: 'L002',
    name: 'Tas Laptop Hitam',
    image: laptopBagImg,
    location: 'Dramaga Campus Bus',
    time: 'Kemarin',
    category: 'Lainnya',
    status: 'lost',
  },
  {
    id: 'L003',
    name: 'Boneka Kulit Coklat',
    image: brownTeddyImg,
    location: 'Masjid Al-Hurriyah',
    time: 'Kemarin',
    category: 'Lainnya',
    status: 'lost',
  },
  {
    id: 'L004',
    name: 'iPhone 13 Pro Max',
    image: iphoneImg,
    location: 'Graha Widya Wisuda',
    time: '2 hari yang lalu',
    category: 'Elektronik',
    status: 'lost',
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
