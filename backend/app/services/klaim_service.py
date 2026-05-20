from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.klaim import Klaim, StatusKlaim
from app.models.laporan import Laporan, StatusLaporan
from app.schemas.klaim import KlaimCreate

class KlaimService:
    
    @staticmethod
    def create_klaim(db: Session, klaim_in: KlaimCreate, pengklaim_id: int) -> Klaim:
        # Cek apakah laporan ada dan berstatus published
        laporan = db.query(Laporan).filter(Laporan.id == klaim_in.laporan_id).first()
        if not laporan:
            raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")
        if laporan.status != StatusLaporan.published:
            raise HTTPException(status_code=400, detail="Laporan ini tidak dapat diklaim saat ini (mungkin sudah diklaim atau belum di-publish)")
        if laporan.pelapor_id == pengklaim_id:
            raise HTTPException(status_code=400, detail="Anda tidak dapat mengklaim laporan Anda sendiri")

        # Buat Klaim
        new_klaim = Klaim(
            **klaim_in.dict(),
            pengklaim_id=pengklaim_id,
            status_klaim=StatusKlaim.pending
        )
        db.add(new_klaim)
        
        # Otomatis ubah status laporan menjadi claimed agar hilang dari publik
        laporan.status = StatusLaporan.claimed
        
        db.commit()
        db.refresh(new_klaim)
        return new_klaim

    @staticmethod
    def get_pending_klaims(db: Session, skip: int = 0, limit: int = 100) -> list[Klaim]:
        return db.query(Klaim).filter(Klaim.status_klaim == StatusKlaim.pending)\
            .order_by(Klaim.tanggal_klaim.asc()).offset(skip).limit(limit).all()

    @staticmethod
    def verify_klaim(db: Session, klaim_id: int, is_approved: bool) -> Klaim:
        klaim = db.query(Klaim).filter(Klaim.id == klaim_id).first()
        if not klaim:
            raise HTTPException(status_code=404, detail="Klaim tidak ditemukan")
            
        laporan = db.query(Laporan).filter(Laporan.id == klaim.laporan_id).first()
        
        if is_approved:
            klaim.status_klaim = StatusKlaim.approved
            # Status laporan tetap claimed atau bisa diubah jadi resolved tergantung rule bisnis
            # Untuk sekarang, kita biarkan di claimed/resolved
        else:
            klaim.status_klaim = StatusKlaim.rejected
            # Kembalikan laporan ke published agar orang lain bisa mengklaim
            if laporan:
                laporan.status = StatusLaporan.published
                
        db.commit()
        db.refresh(klaim)
        return klaim
