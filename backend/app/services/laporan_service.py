from sqlalchemy.orm import Session
from app.models.laporan import Laporan, StatusLaporan, JenisLaporan, KategoriBarang
from sqlalchemy import or_

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
    def search_laporans(
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        status: StatusLaporan = None,
        jenis: JenisLaporan = None,
        kategori: KategoriBarang = None,
        search_query: str = None
    ) -> list[Laporan]:
        query = db.query(Laporan)
        
        if status:
            query = query.filter(Laporan.status == status)
        if jenis:
            query = query.filter(Laporan.jenis_laporan == jenis)
        if kategori:
            query = query.filter(Laporan.kategori == kategori)
        if search_query:
            # Gunakan ilike untuk pencarian case-insensitive pada nama_barang atau deskripsi
            search_term = f"%{search_query}%"
            query = query.filter(
                or_(
                    Laporan.nama_barang.ilike(search_term),
                    Laporan.deskripsi.ilike(search_term)
                )
            )
            
        return query.order_by(Laporan.created_at.desc()).offset(skip).limit(limit).all()

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
