from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.cores.database import get_db
from app.models.user import User
from app.schemas.laporan import LaporanCreate, LaporanResponse, LaporanUpdateStatus
from app.services.laporan_service import LaporanService
from app.api.deps import get_current_user, get_current_active_admin

from app.models.laporan import StatusLaporan, JenisLaporan, KategoriBarang

router = APIRouter()

@router.post("/", response_model=LaporanResponse, status_code=status.HTTP_201_CREATED)
def create_laporan(
    laporan_in: LaporanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    User (civitas) membuat laporan baru. Status otomatis 'pending'.
    """
    return LaporanService.create_laporan(db=db, laporan_in=laporan_in, pelapor_id=current_user.id)

@router.get("/", response_model=List[LaporanResponse])
def get_katalog(
    skip: int = 0, 
    limit: int = 100, 
    status: StatusLaporan = StatusLaporan.published, # Default hanya untuk published
    jenis: JenisLaporan = None,
    kategori: KategoriBarang = None,
    search: str = None,
    db: Session = Depends(get_db)
):
    """
    Endpoint publik untuk katalog web. 
    Mendukung filter: `status`, `jenis`, `kategori`, dan pencarian teks (`search`).
    """
    return LaporanService.search_laporans(
        db, skip=skip, limit=limit, status=status, jenis=jenis, kategori=kategori, search_query=search
    )

@router.get("/admin/pending", response_model=List[LaporanResponse])
def get_pending_laporans(
    skip: int = 0, limit: int = 100, 
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin)
):
    """
    Hanya bisa diakses oleh Admin. Melihat semua laporan 'pending'.
    """
    return LaporanService.search_laporans(db, skip=skip, limit=limit, status=StatusLaporan.pending)

@router.patch("/{laporan_id}/status", response_model=LaporanResponse)
def update_status(
    laporan_id: int,
    status_update: LaporanUpdateStatus,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin)
):
    """
    Hanya bisa diakses oleh Admin. Mengubah status laporan (Approve/Reject).
    """
    laporan = LaporanService.update_laporan_status(db, laporan_id, status_update.status)
    if not laporan:
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")
    return laporan
