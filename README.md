# SEEKEM (Sistem Elektronik Etalase Kehilangan & Penemuan) - IPB
Sistem berbasis *website* untuk mengelola, melaporkan, dan mengklaim barang hilang atau temuan di wilayah kampus IPB University.

## ✨ Fitur Utama
- **Sistem Pelaporan**: Mahasiswa dapat melaporkan barang hilang atau ditemukan.
- **Sistem Klaim**: Bukti kepemilikan diperlukan sebelum klaim disetujui.
- **Dashboard Admin**: Pengelolaan data laporan, verifikasi klaim, dan *monitoring* metrik harian.
- **Katalog Publik**: Etalase barang yang terverifikasi bisa dicari dan disaring berdasarkan lokasi/kategori.
- **Verifikasi Email & Lupa Password**: Autentikasi aman melalui verifikasi pendaftaran email dan fitur *reset password* dengan tautan dinamis.
- **Notifikasi Email & In-App**: Pemberitahuan otomatis ketika barang diklaim, disetujui, atau dibatalkan.

## 🛠️ Teknologi yang Digunakan
- **Frontend**: React.js (Vite), Zustand (State Management), CSS Vanilla, Lucide Icons.
- **Backend**: FastAPI (Python), SQLAlchemy, PostgreSQL, Alembic (Migrasi DB), JWT Authentication, Jinja2 (Email Templates).
- **Layanan Cloud**: Cloudinary (Image Hosting), Google Apps Script (Webhook Email).

---

## 📁 Struktur Folder Utama
```text
LostnFound-IPB/
├── backend/                  # Server-side code (FastAPI)
│   ├── alembic/              # File migrasi database
│   ├── app/
│   │   ├── api/              # Endpoint router/controller
│   │   ├── cores/            # Konfigurasi utama & keamanan (JWT, Database)
│   │   ├── models/           # Definisi tabel SQLAlchemy
│   │   ├── schemas/          # Validasi data Pydantic
│   │   ├── services/         # Logika bisnis (EmailService, dll.)
│   │   ├── templates/        # Template HTML (mis. email_template.html)
│   │   └── utils/            # Modul utilitas keamanan, enkripsi (PII), & audit signature
│   ├── alembic.ini           # Konfigurasi koneksi Alembic
│   └── requirements.txt      # Dependensi Python
│
├── Frontend/                 # Client-side code (React + Vite)
│   ├── public/               # Aset statis (gambar, favicon)
│   ├── src/
│   │   ├── assets/           # Aset internal Frontend
│   │   ├── components/       # Komponen UI modular
│   │   ├── data/             # Data statis & dummy
│   │   ├── pages/            # Halaman utama aplikasi
│   │   ├── services/         # Konfigurasi Axios & pemanggilan API
│   │   └── store/            # State management (Zustand)
│   ├── package.json          # Dependensi Node.js
│   └── vite.config.js        # Konfigurasi build Vite
│
├── CONTEXT.md                # Blueprint dan Arsitektur Sistem
├── email_preview.html        # File bantu untuk mempratinjau UI Email (Jinja2) di browser
└── README.md                 # Panduan instalasi (Dokumen ini)
```

---

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

# Konfigurasi Email (Menggunakan Webhook Google Apps Script)
# Ikuti panduan di bagian "Setup Email (Google Apps Script)" di bawah
GAS_EMAIL_URL=https://script.google.com/macros/s/KODE_ANDA/exec

# URL Frontend (untuk generate link verifikasi email)
FRONTEND_URL=http://localhost:5173
```

**Jalankan Migrasi Database (Alembic):**
Sebelum menjalankan server, Anda wajib meng-generate tabel-tabel di database menggunakan Alembic:
```bash
alembic upgrade head
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
VITE_API_BASE_URL=http://localhost:8000/api
```

Jalankan server frontend:
```bash
npm run dev
```
*(Aplikasi web akan berjalan di `http://localhost:5173`. Buka URL tersebut di browser Anda)*

---

## 📧 Setup Email (Google Apps Script)

Fitur notifikasi email (verifikasi akun, pemberitahuan klaim) menggunakan **Google Apps Script (GAS)** sebagai relay/webhook. GAS akan menerima request HTTP dari backend dan meneruskannya menjadi email melalui akun Gmail Anda.

### Langkah 1: Buat Project Google Apps Script

1. Buka [Google Apps Script](https://script.google.com/) dan login dengan akun Google yang akan menjadi **pengirim email**.
2. Klik **"Proyek Baru"** (atau *New Project*).
3. Beri nama project, misalnya `SEEKEM Email Relay`.

### Langkah 2: Tulis Kode Script

Hapus semua isi default di editor, lalu tempel kode berikut:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var to = data.to;
    var subject = data.subject;
    var htmlBody = data.htmlBody;

    if (!to || !subject || !htmlBody) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "error", message: "Field to, subject, dan htmlBody wajib diisi." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    MailApp.sendEmail({
      to: to,
      subject: subject,
      htmlBody: htmlBody,
      name: "Admin SEEKEM"   // Nama pengirim yang tampil di inbox
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Email berhasil dikirim." }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Klik **💾 Simpan** (Ctrl+S).

### Langkah 3: Deploy sebagai Web App

1. Klik menu **Deploy** → **Deployment baru** (atau *New deployment*).
2. Di bagian **"Pilih jenis"** (ikon ⚙️), pilih **"Aplikasi web"** (*Web app*).
3. Isi konfigurasi:
   - **Deskripsi**: `SEEKEM Email Relay v1`
   - **Jalankan sebagai** (*Execute as*): **Saya** (*Me*) — agar email dikirim dari akun Google Anda.
   - **Siapa yang memiliki akses** (*Who has access*): **Siapa saja** (*Anyone*) — agar backend bisa memanggil tanpa autentikasi Google.
4. Klik **Deploy**.
5. Google akan meminta izin akses. Klik **"Tinjau Izin"** → pilih akun Anda → klik **"Lanjutkan"** (mungkin muncul peringatan "Aplikasi belum diverifikasi", klik **"Lanjutkan"** / *Advanced* → *Go to SEEKEM Email Relay*).
6. Setelah berhasil, Anda akan mendapatkan **URL Deployment** yang berbentuk:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```
7. **Salin URL tersebut** — ini adalah nilai untuk variabel `GAS_EMAIL_URL` di file `.env` backend Anda.

### Langkah 4: Pasang URL di Backend

Buka file `backend/.env` dan tempel URL yang sudah disalin:
```env
GAS_EMAIL_URL=https://script.google.com/macros/s/AKfycbx.../exec
```

### Langkah 5: Tes Pengiriman Email

Anda bisa menguji apakah webhook sudah berfungsi tanpa menjalankan aplikasi SEEKEM, cukup gunakan `curl`:
```bash
curl -L -X POST "URL_GAS_ANDA" \
  -H "Content-Type: application/json" \
  -d '{"to": "email_tujuan@gmail.com", "subject": "Tes SEEKEM", "htmlBody": "<h1>Halo!</h1><p>Email dari SEEKEM berhasil terkirim.</p>"}'
```
Jika berhasil, Anda akan melihat respons `{"status":"success",...}` dan email masuk ke kotak masuk tujuan.

### ⚠️ Catatan Penting
- **Batas harian**: Akun Gmail gratis memiliki kuota **100 email/hari**. Untuk akun Google Workspace (kampus/organisasi), kuotanya bisa lebih tinggi.
- **Update Script**: Jika Anda mengubah kode GAS, Anda harus membuat **Deployment baru** (versi baru) agar perubahan berlaku. URL deployment lama tidak akan berubah.
- **Keamanan**: URL webhook ini bersifat *public*. Jangan pernah mempublikasikannya di repository publik (pastikan `.env` masuk ke `.gitignore`).

---

## 🌐 Catatan Deployment
- **Frontend (mis. Vercel)**: Pastikan Anda menambahkan variabel `VITE_API_BASE_URL` (contoh: `https://<URL-BACKEND>/api`) ke dashboard Vercel. Pengaturan *routing SPA* sudah di-*handle* secara *default* oleh Vercel Vite Preset.
- **Backend (mis. Railway/Render)**: Masukkan semua kunci rahasia (Database URL, Secret Key, Cloudinary API, GAS_EMAIL_URL) ke dalam bagian Environment Variables pada platform hosting Anda. Jangan lupa untuk menambahkan `FRONTEND_URL` (diisi URL production frontend, misal `https://seekem.vercel.app`) agar link verifikasi email ter-generate dengan benar.

