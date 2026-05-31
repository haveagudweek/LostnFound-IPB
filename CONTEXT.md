# Project Blueprint & System Architecture: SEEKEM (IPB Lost & Found Web App)

Dokumen ini berfungsi sebagai cetak biru (blueprint) utama proyek SEEKEM. Sangat disarankan menggunakan dokumen ini sebagai referensi untuk merancang System Architecture Diagram, Entity Relationship Diagram (ERD), Use Case Diagram, maupun Sequence Diagram.

---

## 1. System Overview
**SEEKEM (Sistem Elektronik Etalase Kehilangan & Penemuan)** adalah platform berbasis web untuk memfasilitasi pelaporan dan pencarian barang hilang/ditemukan di lingkungan kampus IPB University. 

Sistem ini mengadopsi arsitektur **Hybrid P2P (Peer-to-Peer dengan Admin Verifikator)**. Artinya, interaksi serah terima fisik dilakukan secara mandiri oleh pengguna (civitas), namun sistem bertindak sebagai verifikator kepemilikan sebelum kontak privasi (nomor WhatsApp) dibuka kepada pihak lain.

## 2. System Architecture & Tech Stack
Sistem menggunakan arsitektur Decoupled (Client-Server) terpisah:

- **Frontend (Client Layer)**: SPA (Single Page Application) dibangun dengan React.js dan Vite. Menggunakan Zustand untuk *State Management* (terutama untuk status autentikasi dan notifikasi). UI dibangun menggunakan Vanilla CSS dan Lucide Icons.
- **Backend (API Layer)**: RESTful API dibangun dengan Python dan FastAPI. Menggunakan Uvicorn sebagai ASGI server.
- **Database (Data Layer)**: Relational Database PostgreSQL yang di-mapping menggunakan ORM SQLAlchemy.
- **Cloud Storage**: Layanan pihak ketiga (Cloudinary) digunakan untuk menyimpan gambar bukti laporan dan klaim (Image Hosting).
- **Notification & Mailing**: Menggunakan `fastapi-mail` untuk menembakkan notifikasi via SMTP (Email), serta sistem notifikasi In-App persisten di Database.

## 3. Core Actors (User Roles)
Sistem memiliki kontrol akses berbasis peran (RBAC) yang ketat:

1. **Civitas Akademika (User Umum)**
   - Login menggunakan simulasi SSO (Domain `@apps.ipb.ac.id`).
   - Dapat melaporkan barang hilang / temuan.
   - Dapat mengajukan klaim atas suatu barang.
   - Dapat saling berkomunikasi (P2P) jika laporan disetujui.
2. **Admin**
   - Tidak dibuat via registrasi publik (dibuat manual via Database/Seeding).
   - Memiliki *Dashboard* khusus untuk memverifikasi laporan masuk dan bukti klaim.
   - **Limitasi Logika**: Admin secara sistemik diblokir dan tidak diizinkan untuk membuat laporan publik atau mengajukan klaim barang.

## 4. Database Schema & Entity Mapping
Struktur relasi database dapat dipetakan sebagai berikut (cocok untuk pembuatan ERD):

### A. Enumerasi (Constrain Data)
Semua field dengan pilihan terbatas dijaga menggunakan `Enum` di PostgreSQL:
- `RoleEnum`: 'admin', 'civitas'
- `JenisLaporanEnum`: 'hilang', 'ditemukan'
- `StatusLaporanEnum`: 'pending', 'published', 'claimed', 'resolved', 'rejected'
- `StatusKlaimEnum`: 'pending', 'approved', 'rejected'

### B. Tabel-Tabel Utama
1. **Tabel `users`**
   - Atribut: `id` (PK), `name`, `email` (Unique), `nim`, `phone`, `password_hash`, `role`.
2. **Tabel `laporan`**
   - Atribut: `id` (PK), `pelapor_id` (FK -> users), `jenis_laporan`, `tanggal_kejadian`, `lokasi`, `deskripsi`, `nama_barang`, `kategori`, `foto_url`, `status`, `created_at`.
3. **Tabel `klaim`**
   - Atribut: `id` (PK), `laporan_id` (FK -> laporan), `pengklaim_id` (FK -> users), `tanggal_klaim`, `alasan_klaim`, `bukti_foto_url`, `owner_name`, `nim`, `faculty`, `contact`, `status_klaim`.
4. **Tabel `notifikasi`**
   - Atribut: `id` (PK), `user_id` (FK -> users), `pesan`, `tipe`, `tanggal_kirim`, `is_read`.

## 5. System Workflows (Business Logic)
Berikut adalah alur logika yang bisa digambar menjadi *Sequence Diagram* atau *Activity Diagram*:

### Flow 1: Pelaporan Barang Baru
1. User mengisi formulir beserta foto bukti. Frontend mengirim `multipart/form-data` (bukan JSON JSON string) ke Backend.
2. Backend menerima foto, mengunggah ke Cloudinary (`UploadService`), lalu mendapatkan string URL gambar.
3. Backend menyimpan data laporan beserta URL gambar ke tabel `laporan` dengan status awal `Pending`.

### Flow 2: Verifikasi Laporan & Katalog Publik
1. Laporan baru tidak langsung muncul di beranda publik. Laporan masuk ke antrean Dasbor Admin.
2. Admin mengecek kelayakan foto dan deskripsi.
3. Jika disetujui, Admin menekan "Approve". Status `laporan` menjadi `Published` dan otomatis tayang di halaman pencarian Publik.
4. Sistem backend otomatis men-generate entitas `notifikasi` baru kepada pelapor bahwa laporannya telah dipublikasi.

### Flow 3: Proses Klaim Barang
1. User mencari barang di Katalog Publik. Jika merasa miliknya, ia menekan "Klaim".
2. User mengirim form bukti kepemilikan dan data kontak.
3. Status `laporan` berubah menjadi `Claimed` (hilang sementara dari katalog publik agar tidak diklaim ganda).
4. Data klaim berstatus `Pending` masuk ke meja Admin. Backend menembak `Notifikasi` ke pelapor asli bahwa barangnya sedang diklaim seseorang.
5. Admin memverifikasi bukti. Jika "Approve":
   - Status `klaim` menjadi `Approved`.
   - Informasi privasi dibuka.
   - Backend menembak `Notifikasi` ke si pengklaim.

### Flow 4: P2P Communication & Email Notification
1. Pada detail barang (setelah laporan *published* atau klaim *approved*), User bisa menekan tombol "Hubungi".
2. Frontend menembak API `/api/laporan/{id}/hubungi` beserta data WhatsApp pengirim dan pesan teks.
3. Backend memanggil `EmailService` melalui `BackgroundTasks` (agar *non-blocking* / cepat).
4. `EmailService` memformat *template* HTML profesional (berbeda antara template *Lost* dan *Found*) dan mengirimkan email ke kotak masuk pelapor asli menggunakan protokol SMTP.

### Flow 5: Analytics & Dasbor
1. Semua proses agregasi data statistik harian/mingguan (seperti total barang hilang, diklaim, diselesaikan, *group-by* kategori) **wajib** dikalkulasi langsung di PostgreSQL menggunakan agregasi ORM (`DashboardService`).
2. Frontend sama sekali dilarang me-load ratusan data mentah hanya untuk menghitung panjang *array*. Frontend murni sebagai penampil UI.

## 6. Security & Development Guidelines
1. **Proteksi Endpoint**: Setiap URL API yang membutuhkan autentikasi dikunci menggunakan skema JWT Bearer Token (`get_current_user`). Jika endpoint tersebut khusus admin, ia dikunci dengan pengecekan ganda (`get_current_active_admin`).
2. **CORS Policy**: Backend mengizinkan komunikasi *cross-origin* (CORS) sehingga API aman dipanggil oleh aplikasi React.
3. **Data Isolation**: User biasa sama sekali tidak dapat memanipulasi *request* untuk mengubah peran (`role`) mereka menjadi `admin` saat registrasi, karena arsitektur Pydantic secara *default* membuang dan mengabaikan parameter tak diundang (*Mass Assignment Protection*).
