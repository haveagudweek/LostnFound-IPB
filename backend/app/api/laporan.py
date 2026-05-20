from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.cores.database import get_db
from app.models.user import User
from app.schemas.laporan import LaporanCreate, LaporanResponse, LaporanUpdateStatus
from app.services.laporan_service import LaporanService
from app.api.deps import get_current_user, get_current_active_admin

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
def get_katalog(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Endpoint publik untuk katalog web. Hanya menampilkan laporan 'published'.
    """
    return LaporanService.get_published_laporans(db, skip=skip, limit=limit)

@router.get("/admin/pending", response_model=List[LaporanResponse])
def get_pending_laporans(
    skip: int = 0, limit: int = 100, 
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin)
):
    """
    Hanya bisa diakses oleh Admin. Melihat semua laporan 'pending'.
    """
    return LaporanService.get_pending_laporans(db, skip=skip, limit=limit)

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
