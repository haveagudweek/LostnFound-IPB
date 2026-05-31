# SEEKEM (Sistem Elektronik Etalase Kehilangan & Penemuan) - IPB
Sistem berbasis *website* untuk mengelola, melaporkan, dan mengklaim barang hilang atau temuan di wilayah kampus IPB University.

## ✨ Fitur Utama
- **Sistem Pelaporan**: Mahasiswa dapat melaporkan barang hilang atau ditemukan.
- **Sistem Klaim**: Bukti kepemilikan diperlukan sebelum klaim disetujui.
- **Dashboard Admin**: Pengelolaan data laporan, verifikasi klaim, dan *monitoring* metrik harian.
- **Katalog Publik**: Etalase barang yang terverifikasi bisa dicari dan disaring berdasarkan lokasi/kategori.
- **Notifikasi In-App**: Pemberitahuan interaktif saat laporan disetujui, ditolak, atau ada pesan baru.

## 🛠️ Teknologi yang Digunakan
- **Frontend**: React.js (Vite), Zustand (State Management), CSS Vanilla, Lucide Icons.
- **Backend**: FastAPI (Python), SQLAlchemy, PostgreSQL, JWT Authentication.
- **Layanan Cloud**: Cloudinary (Penyimpanan Foto).

## 🚀 Prasyarat
Pastikan komputer Anda sudah terinstal:
- [Node.js](https://nodejs.org/) (versi 16 atau lebih baru)
- [Python](https://www.python.org/) (versi 3.9 atau lebih baru)
- PostgreSQL (aktif dan berjalan)

---

## 💻 Cara Menjalankan di Lokal (Development)

### 1. Setup Backend (FastAPI)
Buka terminal baru dan masuk ke folder backend:
```bash
cd backend
```

Buat *virtual environment* dan aktifkan:
```bash
python -m venv venv
# Untuk Windows:
venv\Scripts\activate
# Untuk Mac/Linux:
source venv/bin/activate
```

Install dependensi Python:
```bash
pip install -r requirements.txt
```

Siapkan file konfigurasi. Buat file `.env` di dalam folder `backend/`:
```env
# Contoh isi backend/.env
DATABASE_URL=postgresql://user:password@localhost:5432/namadatabase
SECRET_KEY=bikin_kunci_rahasia_bebas
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

CLOUDINARY_CLOUD_NAME=nama_cloud
CLOUDINARY_API_KEY=api_key
CLOUDINARY_API_SECRET=api_secret

# Konfigurasi SMTP (Untuk Fitur Hubungi Pelapor)
MAIL_USERNAME=email_anda@gmail.com
MAIL_PASSWORD=password_app_gmail_anda
MAIL_FROM=email_anda@gmail.com
MAIL_PORT=465
MAIL_SERVER=smtp.gmail.com
```

Jalankan server backend:
```bash
uvicorn app.main:app --reload --port 8000
```
*(Backend akan berjalan di `http://localhost:8000`. Dokumentasi interaktif Swagger API ada di `http://localhost:8000/docs`)*

### 2. Setup Frontend (React + Vite)
Buka terminal baru (biarkan terminal backend tetap berjalan) dan masuk ke folder Frontend:
```bash
cd Frontend
```

Install dependensi Node.js:
```bash
npm install
```

Siapkan koneksi ke API. Buat file `.env` di dalam folder `Frontend/`:
```env
VITE_API_URL=http://localhost:8000
```

Jalankan server frontend:
```bash
npm run dev
```
*(Aplikasi web akan berjalan di `http://localhost:5173`. Buka URL tersebut di browser Anda)*

---

## 🌐 Catatan Deployment
- **Frontend (mis. Vercel)**: Pastikan Anda menambahkan variabel `VITE_API_URL` ke URL backend production Anda di dashboard Vercel. File konfigurasi *rewrite routing SPA* (`vercel.json`) sudah ada di folder Frontend untuk mencegah error *404 Not Found*.
- **Backend (mis. Railway/Render)**: Masukkan semua kunci rahasia (Database URL, Secret Key, Cloudinary API) ke dalam bagian Environment Variables pada platform hosting Anda.
