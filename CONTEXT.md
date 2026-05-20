# Project Blueprint & Context: SEEKEM (IPB Lost & Found Web App)

## 1. System Overview
SEEKEM adalah platform berbasis web untuk memfasilitasi pelaporan dan pencarian barang hilang/ditemukan di lingkungan kampus IPB University. Sistem ini menggunakan arsitektur **Hybrid P2P (Peer-to-Peer dengan Admin Verifikator)**. Interaksi serah terima dilakukan mandiri oleh pengguna, namun sistem bertindak sebagai verifikator kepemilikan sebelum kontak privasi dibuka.

## 2. Tech Stack & Infrastructure
Sistem menggunakan arsitektur Decoupled (Client-Server):
* **Frontend:** React.js, Vite, Tailwind CSS (Akan di-deploy ke Vercel).
* **Backend:** Python, FastAPI, Uvicorn (REST API) (Akan di-deploy ke Railway).
* **Database:** PostgreSQL (Akan di-deploy ke Railway).
* **ORM:** SQLAlchemy.
* **Storage (Images):** Supabase dibatalkan. Frontend akan mengunggah gambar ke layanan pihak ketiga (misal: Cloudinary/ImgBB) dan hanya mengirimkan `foto_url` (string) ke Backend.
* **Authentication:** JWT (JSON Web Tokens) stateless authentication di headers.

## 3. Core Actors & Authentication
1.  **Civitas Akademika (User):** Melakukan registrasi/login menggunakan simulasi SSO IPB (Validasi dummy: email wajib berakhiran `@apps.ipb.ac.id`).
2.  **Admin:** Memiliki akses ke Dashboard khusus untuk memverifikasi laporan masuk dan bukti klaim.

## 4. OOP Implementation Mapping & Database Schema
Implementasi OOP pada backend dipisahkan antara Database Models (SQLAlchemy) dan Data Transfer Objects (Pydantic). 

**A. Database Models (SQLAlchemy Classes):**
Menerapkan skema relasional dengan pendekatan pragmatis (menggabungkan konsep Laporan dan Barang menjadi satu entitas fisik untuk performa query).

* **Class `User` (Tabel: `users`)**
    * Menggunakan Single Table Inheritance (hanya 1 tabel).
    * Kolom: `id`, `nama`, `email_ipb`, `nomor_telepon`, `password_hash`, `role` (Enum: 'admin', 'civitas').
* **Class `Laporan` (Tabel: `laporan`)**
    * Menggabungkan entitas "Laporan" dan "Barang" dari diagram konseptual.
    * Kolom: `id`, `pelapor_id` (FK User), `jenis_laporan`, `tanggal_kejadian`, `lokasi`, `deskripsi`, `nama_barang`, `kategori`, `ciri_ciri`, `foto_url`, `status` (Pending/Published/Claimed/Resolved/Rejected).
* **Class `Klaim` (Tabel: `klaim`)**
    * Kolom: `id`, `laporan_id` (FK Laporan), `pengklaim_id` (FK User), `tanggal_klaim`, `alasan_klaim`, `bukti_foto_url`, `status_klaim` (Pending/Approved/Rejected).
* **Class `Notifikasi` (Tabel: `notifikasi`)**
    * Kolom: `id`, `user_id` (FK User), `pesan`, `tipe`, `tanggal_kirim`, `is_read`.

**B. Data Transfer Objects / DTOs (Pydantic Classes):**
Digunakan untuk enkapsulasi dan validasi payload dari/ke Frontend.
* `FormLaporanRincian`: Diimplementasikan sebagai Pydantic Schema (`LaporanCreateSchema`) untuk memvalidasi input saat Civitas mensubmit laporan baru.
* `UserLoginSchema`, `KlaimCreateSchema`, dll.

**C. Business Logic (Service Classes):**
Logika pemrosesan data dienkapsulasi dalam Service Class (misal: `AuthService`, `LaporanService`, `KlaimService`) yang akan dipanggil oleh FastAPI Routers.

## 5. Critical Business Logic & App Flow

### A. Alur Laporan & Katalog
* Laporan baru yang di-submit user masuk dengan status `Pending`.
* **Admin Dashboard:** Menampilkan list laporan `Pending`. Admin dapat menekan "Approve" (status menjadi `Published`) atau "Reject" (status menjadi `Rejected`).
* **Frontend Catalog:** Hanya merender data laporan dengan status `Published`.

### B. Resolusi Logika Interaksi Barang
* **Jika post adalah "Barang Ditemukan":** User lain menekan tombol **"Klaim"** -> Membuka form bukti kepemilikan.
* **Jika post adalah "Barang Hilang":** User lain menekan tombol **"Saya Menemukan Ini"** -> Membuka form pelaporan penemuan untuk dicocokkan.

### C. Alur Hybrid P2P (Klaim)
1. User mensubmit form klaim. Status laporan berubah menjadi `Claimed` (disembunyikan sementara dari public feed).
2. **Admin Verification:** Halaman khusus di dashboard Admin untuk menampilkan detail asli barang (kiri) vs bukti dari pengklaim (kanan).
3. Jika Admin "Reject": Status klaim di-reject, status laporan kembali menjadi `Published`.
4. Jika Admin "Approve": Status klaim di-approve.
5. **Post-Approval State (Frontend):** Pada halaman riwayat/detail klaim User, sistem secara otomatis membuka dan menampilkan teks *"Klaim Disetujui! Silakan hubungi penemu untuk serah terima di nomor WhatsApp: [no_whatsapp_pelapor]"*.
6. Setelah serah terima fisik selesai, Admin/User dapat mengubah status akhir laporan menjadi `Resolved`.

## 6. AI Development Guidelines
* **Backend:** Terapkan modular routing di FastAPI (pisahkan router auth, laporan, dan klaim). Gunakan Pydantic schemas untuk validasi request/response. Jangan simpan file statis di server backend. Karena Supabase dibatalkan, desain API cukup menerima field `foto_url` bertipe string dari frontend (frontend yang menangani upload). Deploy akan dilakukan ke Railway.
* **Frontend:** Buat reusable components untuk UI (Cards, Buttons, Modals) menggunakan Tailwind. Terapkan Protected Routes di React untuk membatasi akses halaman Admin dan User yang belum login. Handle state management untuk membedakan tampilan katalog berdasarkan `jenis_laporan`. Deploy ke Vercel.