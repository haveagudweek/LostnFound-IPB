# Project Blueprint & Context: SEEKEM (IPB Lost & Found Web App)

## 1. System Overview

SEEKEM adalah platform berbasis web untuk memfasilitasi pelaporan dan pencarian barang hilang/ditemukan di lingkungan kampus IPB University. Sistem ini menggunakan arsitektur **Hybrid P2P (Peer-to-Peer dengan Admin Verifikator)**. Interaksi serah terima fisik dilakukan mandiri oleh pengguna, namun sistem bertindak sebagai verifikator kepemilikan sebelum kontak privasi dibuka.

## 2. Tech Stack & Infrastructure

Sistem menggunakan arsitektur Decoupled (Client-Server):

- **Frontend:** React.js, Vite, Tailwind CSS. (Deployment: Vercel).
- **Backend:** Python, FastAPI, Uvicorn (REST API). (Deployment: Railway).
- **Database:** PostgreSQL. (Deployment: Railway).
- **ORM:** SQLAlchemy.
- **Storage (Images):** Backend Proxy Upload. Frontend mengirimkan file gambar mentah bersama data teks menggunakan protokol `multipart/form-data`. Backend bertanggung jawab menerima file tersebut, meneruskannya ke layanan pihak ketiga (Cloudinary/ImgBB/dll), dan menyimpan URL string yang dihasilkan ke PostgreSQL.
- **Authentication:** JWT (JSON Web Tokens) stateless authentication di headers.

## 3. Core Actors & Authentication

1.  **Civitas Akademika (User):** Melakukan registrasi/login menggunakan simulasi SSO IPB (Validasi dummy: email wajib berakhiran `@apps.ipb.ac.id`).
2.  **Admin:** Dibuat secara manual via Database Seeding (tidak melalui form registrasi publik). Memiliki akses ke Dasbor khusus untuk memverifikasi laporan masuk dan bukti klaim.

## 4. OOP Implementation Mapping & Database Schema

Implementasi OOP pada backend dipisahkan antara Database Models (SQLAlchemy) dan Data Transfer Objects (Pydantic).

**A. Penerapan Enumerasi (Enum)**
Semua field yang memiliki pilihan terbatas wajib diimplementasikan menggunakan class `str, Enum` di Python untuk menjaga integritas data:

- `RoleEnum`: 'admin', 'civitas'
- `JenisLaporanEnum`: 'Barang Hilang', 'Barang Ditemukan'
- `StatusLaporanEnum`: 'Pending', 'Published', 'Claimed', 'Resolved', 'Rejected'
- `StatusKlaimEnum`: 'Pending', 'Approved', 'Rejected'
- `KategoriEnum`: 'Electronics', 'Documents', 'Accessories', 'Clothing', 'Bags', 'Others'

**B. Database Models (SQLAlchemy Classes):**

- **Class `User` (Tabel: `users`)**
  - Kolom: `id`, `name`, `email`, `nim`, `phone`, `password_hash`, `role` (RoleEnum).
- **Class `Laporan` (Tabel: `laporan`)**
  - Kolom: `id`, `pelapor_id` (FK User), `jenis_laporan` (JenisLaporanEnum), `tanggal_kejadian`, `lokasi`, `deskripsi`, `nama_barang`, `kategori` (String, bukan Enum agar FE bebas), `foto_url` (String), `status` (StatusLaporanEnum).
- **Class `Klaim` (Tabel: `klaim`)**
  - Kolom: `id`, `laporan_id` (FK Laporan), `pengklaim_id` (FK User), `tanggal_klaim`, `alasan_klaim`, `bukti_foto_url` (String), `owner_name`, `nim`, `faculty`, `contact`, `status_klaim` (StatusKlaimEnum).
- **Class `Notifikasi` (Tabel: `notifikasi`)**
  - Kolom: `id`, `user_id` (FK User), `pesan`, `tipe`, `tanggal_kirim`, `is_read` (Boolean).

**C. Data Transfer Objects / DTOs (Pydantic Classes):**
Digunakan untuk enkapsulasi dan validasi payload dari/ke Frontend (khusus untuk endpoint non-multipart seperti Auth).

- `UserLoginSchema`, `UserResponseSchema`, dll.

**D. Business Logic (Service Classes):**
Logika pemrosesan data dienkapsulasi dalam Service Class (`AuthService`, `LaporanService`, `KlaimService`, `DashboardService`).

## 5. Critical Business Logic, App Flow & Required Endpoints

### A. Modul Katalog & Eksplorasi (GET `/laporan`)

- Endpoint wajib mendukung _Query Parameters_ untuk pencarian: `?status=`, `?jenis=`, `?search=`, dan `?kategori=`.
- Frontend hanya merender data laporan dengan status `Published`.

### B. Modul Interaksi Barang & Klaim (Hybrid P2P)

1. **Laporan Baru (POST `/laporan`):** Menerima file gambar via `UploadFile` dan field teks via `Form`. Backend mengunggah gambar ke cloud storage, mengambil URL-nya, lalu membuat entitas laporan baru dengan status awal `Pending`.
2. **Klaim Baru (POST `/klaim`):** Menerima file bukti kepemilikan dan alasan klaim via `multipart/form-data`. Status laporan otomatis berubah menjadi `Claimed`.
3. **Verifikasi Admin:**
   - Reject: Status klaim di-reject, status laporan kembali `Published`.
   - Approve: Status klaim di-approve. Sistem otomatis melakukan insert data ke tabel Notifikasi untuk memberitahu pengklaim.
4. **Post-Approval:** Pada endpoint detail klaim (`GET /klaim/{id}`), jika status disetujui, sistem membuka field `nomor_telepon` pelapor kepada pengklaim untuk serah terima P2P.
5. **Penyelesaian:** Admin/User memicu endpoint untuk mengubah status laporan menjadi `Resolved`.

### C. Modul Dasbor & Riwayat

- **Dasbor Admin (`GET /admin/stats`):** Mengembalikan data agregasi secara efisien menggunakan `func.count()` SQLAlchemy.
- **Riwayat User (`GET /users/me/riwayat`):** Menampilkan daftar laporan dan klaim milik user yang sedang login menggunakan identifikasi token JWT.

## 6. AI Development Guidelines

- **Backend:** Implementasikan penanganan berkas masuk menggunakan `fastapi.UploadFile`. Integrasikan library HTTP client (seperti `httpx` atau `requests`) di dalam Service Class untuk meneruskan file gambar ke API pihak ketiga secara asynchronous. Sediakan penanganan error jika proses unggah eksternal gagal agar database tidak menyimpan data corrupt.
- **Frontend:** Formulir pembuatan laporan dan klaim harus dikirim menggunakan objek `FormData` JavaScript untuk mendukung tipe konten `multipart/form-data`.
