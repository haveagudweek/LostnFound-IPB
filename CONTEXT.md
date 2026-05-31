# Project Blueprint & Context: SEEKEM (IPB Lost & Found Web App)

## 1. System Overview

SEEKEM adalah platform berbasis web untuk memfasilitasi pelaporan dan pencarian barang hilang/ditemukan di lingkungan kampus IPB University. Sistem ini menggunakan arsitektur **Hybrid P2P (Peer-to-Peer dengan Admin Verifikator)**. Interaksi serah terima fisik dilakukan mandiri oleh pengguna, namun sistem bertindak sebagai verifikator kepemilikan sebelum kontak privasi dibuka.

> **STATUS PROYEK (31 Mei 2026):**
> 1. Sinkronisasi Frontend & Backend telah mencapai **~95%**. Semua rute utama (`/items`, `/history`, `/admin`, `/contact`) terhubung ke PostgreSQL (Railway). Mock API telah dihapus. **Namun audit menemukan beberapa gap data-mapping dan bug integrasi** (lihat Bagian 7).
> 2. Cloudinary terintegrasi untuk penyimpanan gambar via `UploadService`.
> 3. Otentikasi dan Proteksi JWT (RBAC) telah diterapkan dengan ketat. Fitur CORS dibuka untuk `localhost:5173`. **⚠️ CORS production (Vercel domain) belum dikonfigurasi.**
> 4. **Integrasi SMTP (Email):** Fitur pengiriman pesan langsung (P2P) berfungsi via `EmailService`. **⚠️ Bug: `contact.py` tidak melakukan `db.commit()` setelah `create_notifikasi()`, sehingga notifikasi in-app dari fitur hubungi pelapor tidak tersimpan ke database.**
> 5. **Integrasi Notifikasi Frontend:** `Navbar.jsx` sudah fetch dari `api.getNotifications()` dan menyimpan ke Zustand. **⚠️ Namun `Notifications.jsx` sendiri tidak melakukan fetch ulang saat mount** — hanya membaca state Zustand yang di-set oleh Navbar.
> 6. **⚠️ `addNotification()` di Frontend (Zustand lokal)** digunakan di banyak halaman (ClaimItem, ContactReporter, ItemDetail, AdminReportDetail, AdminClaimDetail, ReportForm) tetapi **hanya menyimpan ke memory browser, hilang saat refresh**. Backend sudah menulis notifikasi persisten via `NotifikasiService` — sehingga `addNotification` sebaiknya hanya digunakan sebagai feedback sesaat (ephemeral), bukan sumber notifikasi utama.

## 2. Tech Stack & Infrastructure

Sistem menggunakan arsitektur Decoupled (Client-Server):

- **Frontend:** React.js, Vite, Tailwind CSS. (Deployment: Vercel).
- **Backend:** Python, FastAPI, Uvicorn (REST API). (Deployment: Railway).
- **Database:** PostgreSQL. (Deployment: Railway).
- **ORM:** SQLAlchemy.
- **Storage (Images):** Backend Proxy Upload. Frontend mengirimkan file gambar mentah bersama data teks menggunakan protokol `multipart/form-data`. Backend bertanggung jawab menerima file tersebut, meneruskannya ke layanan pihak ketiga (Cloudinary), dan menyimpan URL string yang dihasilkan ke PostgreSQL.
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
- `KategoriEnum`: _(Tidak diimplementasikan sebagai Enum — Backend menggunakan `String(100)` free-text)_. Frontend menggunakan 13 kategori Bahasa Indonesia yang didefinisikan di `catalog.js` (Elektronik, Dompet, Kunci, Kartu Identitas, Buku & Dokumen, Tas, Botol Minum, Alat Tulis, Pakaian/Jaket, Aksesori, Perlengkapan Ibadah, Olahraga, Lainnya).

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

- `UserLoginSchema`, `UserResponseSchema`, `EmailSchema`, dll.

**D. Business Logic (Service Classes):**
Logika pemrosesan data dienkapsulasi dalam Service Class (`LaporanService`, `KlaimService`, `DashboardService`, `EmailService`, `UploadService`, `NotifikasiService`). _Catatan: `AuthService` yang disebutkan sebelumnya tidak ada sebagai class terpisah — logic autentikasi langsung di `auth.py` dan `security.py`._

## 5. Critical Business Logic, App Flow & Required Endpoints

### A. Modul Katalog & Eksplorasi (GET `/laporan`)

- Endpoint wajib mendukung _Query Parameters_ untuk pencarian: `?status=`, `?jenis=`, `?search=`, dan `?kategori=`.
- Frontend hanya merender data laporan dengan status `Published`.

### B. Modul Interaksi Barang & Klaim (Hybrid P2P)

1. **Laporan Baru (`POST /api/items/report/{type}`):** Menerima file gambar via `UploadFile` dan field teks via `Form`. Backend mengunggah gambar ke cloud storage, mengambil URL-nya, lalu membuat entitas laporan baru dengan status awal `Pending`.
2. **Klaim Baru (`POST /api/items/{item_id}/claims`):** Menerima file bukti kepemilikan dan alasan klaim via `multipart/form-data`. Status laporan otomatis berubah menjadi `Claimed`.
3. **Verifikasi Admin:**
   - Reject: Status klaim di-reject, status laporan kembali `Published`.
   - Approve: Status klaim di-approve. Sistem otomatis melakukan insert data ke tabel Notifikasi untuk memberitahu pengklaim.
4. **Kontak Pelapor via SMTP (`POST /api/laporan/{id}/hubungi`):** Jika pelapor bukan entitas instansi (seseorang), pencari/pengklaim dapat langsung mengirimkan pesan (P2P). Sistem menggunakan `EmailService` untuk mengirimkan email otomatis ke alamat pelapor. Format dan *subject* email disesuaikan secara dinamis bergantung apakah itu "Barang Hilang" atau "Temuan".
5. **Post-Approval:** Pada endpoint detail klaim (`GET /klaim/{id}`), jika status disetujui, sistem membuka field `nomor_telepon` pelapor kepada pengklaim untuk serah terima fisik secara aman.
6. **Penyelesaian:** Admin/User memicu endpoint untuk mengubah status laporan menjadi `Resolved`.

### C. Modul Dasbor & Riwayat

- **Dasbor Admin (`GET /admin/stats`):** Mengembalikan data agregasi secara efisien menggunakan `func.count()` SQLAlchemy. Frontend WAJIB menggunakan endpoint ini secara langsung alih-alih mengunduh seluruh data (getVerificationReports, getClaims) untuk dihitung manual.
- **Riwayat User (`GET /users/me/riwayat`):** Menampilkan daftar laporan dan klaim milik user yang sedang login menggunakan identifikasi token JWT.

## 6. AI Development Guidelines

- **Standar Pengunggahan File (Krusial):** **SEMBARANG fitur yang melibatkan pengunggahan file/gambar WAJIB menggunakan pendekatan `multipart/form-data` (bukan base64 string di dalam JSON).**
  - **Frontend:** Formulir pembuatan laporan, klaim, atau fitur baru apapun yang mengandung file **harus** dikonstruksi menggunakan objek `FormData` JavaScript murni.
  - **Backend:** Tangkap data tersebut menggunakan `fastapi.UploadFile = File(...)` dan field teks lainnya menggunakan `Form(...)`. Jangan gunakan Pydantic *Schema* (`BaseModel`) jika *endpoint* menerima file.
- **Integrasi Cloudinary:** Gunakan `UploadService` untuk mengunggah file gambar asli ke Cloudinary secara *asynchronous* dan tangkap URL-nya untuk disimpan ke Database PostgreSQL. Sediakan penanganan *error* jika proses unggah eksternal gagal agar database tidak menyimpan data cacat.
- **Aturan RBAC Ketat (Role-Based Access Control):** 
  - **Admin Bukan Pengguna:** Admin secara eksplisit **dilarang** membuat laporan (`POST /api/items/report`) maupun mengklaim barang (`POST /api/items/{id}/claims`). Sistem harus memblokir Admin di lapisan Frontend (menyembunyikan tombol) dan Backend (melemparkan `HTTP 403 Forbidden`).
  - **Isolasi Rute Admin:** Segala *endpoint* di bawah berkas `admin.py` atau berawalan rute `/api/admin/` WAJIB dijaga menggunakan dependensi `get_current_active_admin`. Jangan mencampuradukkan fitur civitas awam di dalam rute admin.
- **Analitik & Dasbor:** Semua proses agregasi data (penghitungan jumlah, statistik, *group by* kategori) **wajib** dilakukan di tingkat *Database* (Backend) melalui `DashboardService`. Frontend dilarang keras melakukan manipulasi *array* secara massal hanya untuk membuat laporan statistik.

## 7. Temuan Audit & Bug Tracker (31 Mei 2026)

Hasil audit menyeluruh terhadap seluruh codebase. Temuan dikelompokkan berdasarkan prioritas.

### A. Bug Kritis (Harus Diperbaiki)

| # | Temuan | File | Status |
|---|--------|------|--------|
| 1 | **`contact.py` tidak `db.commit()` setelah `create_notifikasi()`** — notifikasi in-app dari fitur "Hubungi Pelapor" tidak tersimpan ke database. | `backend/app/api/contact.py` | ✅ Selesai |
| 2 | **`confirmLostItemClaimed` response mismatch** — FE membaca `result.item` tetapi BE mengembalikan objek langsung tanpa wrapper. Menyebabkan `undefined` di UI setelah konfirmasi. | `Frontend/src/pages/ItemDetail.jsx` L99 vs `backend/app/api/items.py` L166-198 | ✅ Selesai |
| 3 | **`Notifications.jsx` tidak fetch dari backend saat mount** — hanya membaca Zustand state yang di-set oleh Navbar. Jika Navbar belum mount atau data stale, halaman notifikasi kosong. | `Frontend/src/pages/Notifications.jsx` | ✅ Selesai |

### B. Bug Sedang (Perlu Perbaikan)

| # | Temuan | File | Status |
|---|--------|------|--------|
| 4 | **History: field `tag` tidak disediakan oleh backend** — `_laporan_to_item()` tidak menghasilkan field `tag`. FE `normalizeEntries()` membaca `report.tag` untuk label "Hilang"/"Temuan" → selalu `undefined` → label default "Laporan Temuan" untuk semua entry. | `backend/app/api/history.py` + `items.py` `_laporan_to_item()` | ✅ Selesai |
| 5 | **History: field `reportTime` tidak disediakan** — Kolom "Dikirim" di panel detail History selalu menampilkan `-`. | `backend/app/api/history.py` | ✅ Selesai |
| 6 | **CORS hanya `localhost:5173`** — Deployment production (Vercel + Railway) akan gagal karena domain Vercel belum masuk `allow_origins`. | `backend/app/main.py` L32 | ✅ Selesai |
| 7 | **ItemDetail: view count hardcoded `24 Views`** — Tidak ada tracking views di backend. Angka statis menyesatkan. | `Frontend/src/pages/ItemDetail.jsx` L169 | ✅ Selesai |
| 8 | **ItemDetail: image gallery duplikat** — `const images = [item.image, item.image]` menampilkan gambar yang sama dua kali. | `Frontend/src/pages/ItemDetail.jsx` L77 | ✅ Selesai |
| 9 | **`addNotification()` FE duplikasi dengan backend** — Notifikasi dari `addNotification()` Zustand hilang saat refresh. Backend sudah menulis notifikasi persisten. Rekomendasi: gunakan `addToast()` saja untuk feedback sesaat di FE. | `Frontend/src/store/uiStore.js` + semua consumer | ✅ Selesai |

### C. Perbaikan Ringan & Dokumentasi

| # | Temuan | File | Status |
|---|--------|------|--------|
| 10 | **Tidak ada notifikasi ke pelapor saat admin approve/reject laporan** — Hanya verifikasi klaim yang mengirim notifikasi. Pelapor tidak tahu apakah laporannya sudah published atau rejected. | `backend/app/api/admin.py` `verify_report()` | ✅ Selesai |
| 11 | **KategoriEnum di CONTEXT.md** (`Electronics`, `Documents`, dst) **tidak sinkron** dengan implementasi aktual — Backend menggunakan free-text `String(100)`, Frontend punya 13 kategori berbahasa Indonesia di `catalog.js`. | CONTEXT.md Bagian 4A | ✅ Dikoreksi |
| 12 | **`AuthService` class tidak ada** — Disebutkan di CONTEXT.md Bagian 4D namun implementasi auth langsung di `auth.py` + `security.py` tanpa class service terpisah. | CONTEXT.md Bagian 4D | ✅ Dikoreksi |
| 13 | **`repositories/` directory kosong** — Repository pattern disebutkan dalam struktur folder backend tetapi tidak diimplementasikan. Query dilakukan langsung di API routes dan Service classes. | `backend/app/repositories/` | ℹ️ By Design |
| 14 | **`NotifikasiService.create_notifikasi()` tidak melakukan `db.commit()`** — Bergantung pada caller untuk commit. Beberapa caller (seperti `contact.py`) lupa memanggil commit. | `backend/app/services/notifikasi_service.py` | Terkait #1 |
