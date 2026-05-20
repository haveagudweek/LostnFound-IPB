# Project Blueprint & Context: SEEKEM (IPB Lost & Found Web App)

## 1. System Overview
SEEKEM adalah platform berbasis web untuk memfasilitasi pelaporan dan pencarian barang hilang/ditemukan di lingkungan kampus IPB University. Sistem ini menggunakan arsitektur **Hybrid P2P (Peer-to-Peer dengan Admin Verifikator)**. Interaksi serah terima dilakukan mandiri oleh pengguna, namun sistem bertindak sebagai verifikator kepemilikan sebelum kontak privasi dibuka.

## 2. Tech Stack & Infrastructure
Sistem menggunakan arsitektur Decoupled (Client-Server):
* **Frontend:** React.js, Vite, Tailwind CSS.
* **Backend:** Python, FastAPI, Uvicorn (REST API).
* **Database:** PostgreSQL.
* **ORM:** SQLAlchemy atau SQLModel.
* **Storage (Images):** Supabase Storage (hanya menyimpan URL di database).
* **Authentication:** JWT (JSON Web Tokens) stateless authentication di headers.

## 3. Core Actors & Authentication
1.  **Civitas Akademika (User):** Melakukan registrasi/login menggunakan simulasi SSO IPB (Validasi dummy: email wajib berakhiran `@apps.ipb.ac.id`).
2.  **Admin:** Memiliki akses ke Dashboard khusus untuk memverifikasi laporan masuk dan bukti klaim.

## 4. Database Schema (High-Level Design)
Sistem menggunakan relasi tabel berikut (sesuaikan tipe data di SQLAlchemy):

* **Tabel `users`**
  * `id` (UUID, PK)
  * `nama_lengkap` (VARCHAR)
  * `nim_nip` (VARCHAR, Unique)
  * `email` (VARCHAR, Unique)
  * `password_hash` (VARCHAR)
  * `no_whatsapp` (VARCHAR) - Disembunyikan, hanya dibuka via logic klaim.
  * `role` (ENUM: 'user', 'admin')

* **Tabel `laporan`**
  * `id` (UUID, PK)
  * `pelapor_id` (UUID, FK -> users.id)
  * `jenis_laporan` (ENUM: 'Barang Hilang', 'Barang Ditemukan')
  * `nama_barang` (VARCHAR)
  * `kategori` (VARCHAR)
  * `deskripsi` (TEXT)
  * `lokasi_terakhir` (VARCHAR) - Misal: GKU, FMIPA, Dramaga sekitarnya.
  * `waktu_kejadian` (TIMESTAMP)
  * `foto_url` (VARCHAR) - URL dari Supabase.
  * `status` (ENUM: 'Pending', 'Published', 'Claimed', 'Resolved', 'Rejected')

* **Tabel `klaim`**
  * `id` (UUID, PK)
  * `laporan_id` (UUID, FK -> laporan.id)
  * `pengklaim_id` (UUID, FK -> users.id)
  * `bukti_foto_url` (VARCHAR) - URL dari Supabase.
  * `deskripsi_bukti` (TEXT) - Penjelasan ciri rahasia barang.
  * `status_klaim` (ENUM: 'Pending', 'Approved', 'Rejected')

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
* **Backend:** Terapkan modular routing di FastAPI (pisahkan router auth, laporan, dan klaim). Gunakan Pydantic schemas untuk validasi request/response. Jangan simpan file statis di server backend, selalu integrasikan upload multipart form-data langsung/via backend ke Supabase.
* **Frontend:** Buat reusable components untuk UI (Cards, Buttons, Modals) menggunakan Tailwind. Terapkan Protected Routes di React untuk membatasi akses halaman Admin dan User yang belum login. Handle state management untuk membedakan tampilan katalog berdasarkan `jenis_laporan`.