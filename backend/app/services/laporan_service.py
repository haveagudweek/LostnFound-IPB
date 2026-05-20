from sqlalchemy.orm import Session
from app.models.laporan import Laporan, StatusLaporan
from app.schemas.laporan import LaporanCreate

class LaporanService:
    
    @staticmethod
    def create_laporan(db: Session, laporan_in: LaporanCreate, pelapor_id: int) -> Laporan:
        # Default status adalah pending saat dibuat oleh civitas
        new_laporan = Laporan(
            **laporan_in.dict(),
            pelapor_id=pelapor_id,
            status=StatusLaporan.pending
        )
        db.add(new_laporan)
        db.commit()
        db.refresh(new_laporan)
        return new_laporan

    @staticmethod
    def get_published_laporans(db: Session, skip: int = 0, limit: int = 100) -> list[Laporan]:
        # Untuk katalog publik, hanya tampilkan yang published
        return db.query(Laporan).filter(Laporan.status == StatusLaporan.published)\
            .order_by(Laporan.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_pending_laporans(db: Session, skip: int = 0, limit: int = 100) -> list[Laporan]:
        # Untuk admin dashboard, ambil yang berstatus pending
        return db.query(Laporan).filter(Laporan.status == StatusLaporan.pending)\
            .order_by(Laporan.created_at.asc()).offset(skip).limit(limit).all()

    @staticmethod
    def update_laporan_status(db: Session, laporan_id: int, new_status: StatusLaporan) -> Laporan:
        laporan = db.query(Laporan).filter(Laporan.id == laporan_id).first()
        if laporan:
            laporan.status = new_status
            db.commit()
            db.refresh(laporan)
        return laporan
        
    @staticmethod
    def get_laporan_by_id(db: Session, laporan_id: int) -> Laporan:
        return db.query(Laporan).filter(Laporan.id == laporan_id).first()
