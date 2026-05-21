from sqlalchemy.orm import Session
from app.models.notifikasi import Notifikasi, TipeNotifikasi

class NotifikasiService:
    @staticmethod
    def create_notifikasi(db: Session, user_id: int, pesan: str, tipe: TipeNotifikasi) -> Notifikasi:
        """
        Menginjeksikan notifikasi baru ke database session.
        Metode ini secara khusus TIDAK melakukan db.commit().
        Tanggung jawab commit diserahkan ke caller (fungsi pemanggil utama)
        agar tetap berada dalam satu kesatuan transaksi database (Data Atomicity).
        """
        new_notif = Notifikasi(
            user_id=user_id,
            pesan=pesan,
            tipe=tipe
        )
        db.add(new_notif)
        return new_notif
