from sqlalchemy.orm import Session

from app.models import Claim, ContactMessage, Item, User, VerificationReport
from app.services.password_service import PasswordService


def image_url(text: str) -> str:
    return f"https://placehold.co/600x450/E8F5E9/1B5E20?text={text.replace(' ', '+')}"


DEFAULT_USERS = [
    {"name": "Admin", "email": "admin@apps.ipb.ac.id", "nim": "ADM001", "password": "admin123", "role": "admin"},
    {"name": "Rizky", "email": "rizky@apps.ipb.ac.id", "nim": "G64210014", "password": "user123", "role": "user"},
]


DEFAULT_ITEMS = [
    {
        "id": "F001",
        "name": "Apple Watch SE",
        "image": image_url("Apple Watch SE"),
        "location": "Dekat Perpustakaan IPB",
        "time": "14 Apr 2026, 09:00 WIB",
        "category": "Elektronik",
        "status": "found",
        "description": "Smartwatch Apple Watch SE warna silver ditemukan di bangku taman dekat Perpustakaan IPB.",
    },
    {
        "id": "F002",
        "name": "Tumbler Hydroflask",
        "image": image_url("Tumbler Hydroflask"),
        "location": "Golden Corner",
        "time": "13 Apr 2026, 14:30 WIB",
        "category": "Botol Minum",
        "status": "found",
        "description": "Tumbler Hydroflask warna hijau ditemukan di meja area makan Golden Corner.",
    },
    {
        "id": "F003",
        "name": "Kunci Kosan + Loker",
        "image": image_url("Kunci Kosan"),
        "location": "Kantin Sapta",
        "time": "11 Apr 2026, 13:15 WIB",
        "category": "Kunci",
        "status": "found",
        "description": "Dua anak kunci dengan gantungan akrilik bening. Ditemukan di meja kantin.",
    },
    {
        "id": "F004",
        "name": "Kartu Mahasiswa IPB",
        "image": image_url("Kartu Mahasiswa"),
        "location": "Halte Bus Kampus",
        "time": "10 Apr 2026, 11:00 WIB",
        "category": "Kartu Identitas",
        "status": "found",
        "description": "Kartu mahasiswa IPB atas nama tidak diketahui. Ditemukan di lantai halte bus kampus.",
    },
    {
        "id": "F005",
        "name": "Smart Key Mobil Toyota",
        "image": image_url("Smart Key Toyota"),
        "location": "Gedung Rektorat Andi Hakim",
        "time": "10 Apr 2026, 16:45 WIB",
        "category": "Kunci",
        "status": "found",
        "description": "Kunci mobil Toyota warna hitam polos tanpa gantungan. Diserahkan oleh satpam.",
    },
    {
        "id": "L001",
        "name": "Kunci Motor Honda",
        "image": image_url("Kunci Motor Honda"),
        "location": "Parkiran Faperta",
        "time": "12 Apr 2026, 08:30 WIB",
        "category": "Kunci",
        "status": "lost",
        "description": "Gantungan kunci karet warna hitam tulisan 'Vario'. Hilang sekitar parkiran Fakultas.",
    },
    {
        "id": "L002",
        "name": "Tas Laptop Hitam",
        "image": image_url("Tas Laptop Hitam"),
        "location": "Dramaga Campus Bus",
        "time": "11 Apr 2026, 17:00 WIB",
        "category": "Tas",
        "status": "lost",
        "description": "Tas laptop warna hitam merk Targus. Tertinggal di bus kampus Dramaga.",
    },
    {
        "id": "L003",
        "name": "Boneka Kulit Coklat",
        "image": image_url("Boneka Coklat"),
        "location": "Masjid Al-Hurriyah",
        "time": "09 Apr 2026, 12:00 WIB",
        "category": "Aksesori",
        "status": "lost",
        "description": "Boneka teddy bear kecil warna coklat. Hilang di sekitar area Masjid Al-Hurriyah.",
    },
    {
        "id": "L004",
        "name": "iPhone 13 Pro Max",
        "image": image_url("iPhone 13 Pro Max"),
        "location": "Graha Widya Wisuda",
        "time": "08 Apr 2026, 19:30 WIB",
        "category": "Elektronik",
        "status": "lost",
        "description": "iPhone 13 Pro Max warna Sierra Blue dengan case transparan. Hilang saat acara wisuda.",
    },
    {
        "id": "F009",
        "name": "Buku Catatan Kalkulus",
        "image": image_url("Buku Catatan Kalkulus"),
        "location": "Auditorium FMIPA",
        "time": "15 Apr 2026, 13:20 WIB",
        "category": "Buku & Dokumen",
        "status": "found",
        "description": "Buku catatan bersampul biru ditemukan setelah kelas umum.",
    },
    {
        "id": "L005",
        "name": "Jaket Almamater",
        "image": image_url("Jaket Almamater"),
        "location": "Student Center",
        "time": "15 Apr 2026, 18:10 WIB",
        "category": "Pakaian / Jaket",
        "status": "lost",
        "description": "Jaket almamater tertinggal di area duduk Student Center.",
    },
    {
        "id": "F010",
        "name": "Kotak Pensil Hitam",
        "image": image_url("Kotak Pensil Hitam"),
        "location": "Perpustakaan IPB",
        "time": "16 Apr 2026, 10:45 WIB",
        "category": "Alat Tulis",
        "status": "found",
        "description": "Kotak pensil hitam berisi pulpen dan stabilo.",
    },
    {
        "id": "L006",
        "name": "Sajadah Lipat",
        "image": image_url("Sajadah Lipat"),
        "location": "Masjid Al-Hurriyah",
        "time": "16 Apr 2026, 12:40 WIB",
        "category": "Perlengkapan Ibadah",
        "status": "lost",
        "description": "Sajadah lipat warna abu-abu tertinggal setelah salat zuhur.",
    },
]


DEFAULT_REPORTS = [
    {
        "id": "LF-0892",
        "item_id": "F006",
        "name": "MacBook Pro M1 Silver",
        "reporter_name": "Budi Santoso",
        "image": image_url("MacBook Pro M1"),
        "location": "Perpustakaan Lt. 2",
        "detail_location": "FMIPA",
        "time": "24 Apr 2026, 14:30",
        "report_time": "25 Apr 2026, 14:30 WIB",
        "category": "Elektronik",
        "tag": "Hilang",
        "report_type": "lost",
        "status": "pending_verification",
        "description": "Telah ditemukan laptop dengan ciri ciri bla bla bla",
    },
    {
        "id": "LF-0891",
        "item_id": "F007",
        "name": "Dompet Kulit Coklat",
        "reporter_name": "Siti Aminah",
        "image": image_url("Dompet Kulit Coklat"),
        "location": "Kantin Sapta",
        "detail_location": "Kantin Sapta",
        "time": "24 Apr 2026, 10:15",
        "report_time": "24 Apr 2026, 10:20 WIB",
        "category": "Dompet",
        "tag": "Hilang",
        "report_type": "lost",
        "status": "verified",
        "description": "Dompet kulit coklat ditemukan di meja dekat kasir.",
    },
    {
        "id": "LF-0890",
        "item_id": "F008",
        "name": "KTM a/n Budi Santoso",
        "reporter_name": "Dian Putri",
        "image": image_url("KTM Budi Santoso"),
        "location": "CCR",
        "detail_location": "CCR",
        "time": "23 Apr 2026, 16:45",
        "report_time": "23 Apr 2026, 16:50 WIB",
        "category": "Buku & Dokumen",
        "tag": "Temuan",
        "report_type": "found",
        "status": "pending_verification",
        "description": "Kartu tanda mahasiswa ditemukan di area CCR.",
    },
]


DEFAULT_CLAIMS = [
    {
        "id": "CLM-882",
        "item_id": "F006",
        "report_id": "LF-0892",
        "item_name": 'MacBook Pro 16"',
        "image": image_url("MacBook Pro 16"),
        "owner_name": "Budi Santoso",
        "nim": "G64180012",
        "faculty": "FMIPA",
        "contact": "0812-3456-7890",
        "location": "Library Lt. 3",
        "found_date": "Oct 24, 2023",
        "found_time": "14:30",
        "claim_date": "Oct 25, 2023 - 14:30 WIB",
        "status": "pending",
        "evidence_attached": True,
        "description": "Laptop saya tertinggal di meja dekat jendela perpustakaan lantai 3 kemarin sore sekitar jam 15.00.",
        "admin_note": "Ciri-ciri fisik yang disebutkan cocok dengan barang yang ditemukan.",
        "history": "User has no previous claim history. This is their first interaction with the L&F system.",
    },
    {
        "id": "CLM-883",
        "item_id": "F007",
        "report_id": "LF-0891",
        "item_name": "Dompet Kulit Hitam",
        "image": image_url("Dompet Kulit Hitam"),
        "owner_name": "Rizky Pratama",
        "nim": "G64210014",
        "faculty": "FEM",
        "contact": "0812-2211-3400",
        "location": "Golden Corner",
        "found_date": "Oct 24, 2023",
        "found_time": "15:10",
        "claim_date": "Oct 25, 2023 - 15:40 WIB",
        "status": "pending",
        "evidence_attached": True,
        "description": "Dompet berisi KTM dan kartu ATM, ada noda kecil di bagian dalam.",
        "admin_note": "Cocokkan KTM saat pemilik datang mengambil barang.",
        "history": "No claim issues found.",
    },
    {
        "id": "CLM-884",
        "item_id": "F008",
        "report_id": "LF-0890",
        "item_name": "Kunci Motor Honda",
        "image": image_url("Kunci Motor Honda"),
        "owner_name": "Andi Wijaya",
        "nim": "G64200098",
        "faculty": "Faperta",
        "contact": "0813-9021-4421",
        "location": "Parkiran Faperta",
        "found_date": "Oct 24, 2023",
        "found_time": "16:20",
        "claim_date": "Oct 25, 2023 - 16:00 WIB",
        "status": "pending",
        "evidence_attached": False,
        "description": "Gantungan kunci warna hitam bertuliskan Vario.",
        "admin_note": "Minta bukti STNK atau foto kendaraan.",
        "history": "No previous claim history.",
    },
]


def clear_database(db: Session) -> None:
    for model in (ContactMessage, Claim, VerificationReport, Item, User):
        db.query(model).delete()
    db.commit()


def seed_database(db: Session, reset: bool = False) -> None:
    if reset:
        clear_database(db)

    password_service = PasswordService()

    if db.query(User).count() == 0:
        for default_user in DEFAULT_USERS:
            user_data = default_user.copy()
            password = user_data.pop("password")
            db.add(User(**user_data, password_hash=password_service.hash_password(password)))

    if db.query(Item).count() == 0:
        for item_data in DEFAULT_ITEMS:
            db.add(Item(**item_data))

    if db.query(VerificationReport).count() == 0:
        for report_data in DEFAULT_REPORTS:
            db.add(VerificationReport(**report_data))

    if db.query(Claim).count() == 0:
        for claim_data in DEFAULT_CLAIMS:
            db.add(Claim(**claim_data))

    db.commit()
