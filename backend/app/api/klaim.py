from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.cores.database import get_db
from app.models.user import User
from app.schemas.klaim import KlaimCreate, KlaimResponse, KlaimVerify
from app.services.klaim_service import KlaimService
from app.api.deps import get_current_user, get_current_active_admin

router = APIRouter()

@router.post("/", response_model=KlaimResponse, status_code=status.HTTP_201_CREATED)
def create_klaim(
    klaim_in: KlaimCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    User (civitas) membuat klaim atas suatu laporan. 
    Laporan otomatis berubah statusnya menjadi 'claimed' dan hilang dari katalog publik.
    """
    return KlaimService.create_klaim(db=db, klaim_in=klaim_in, pengklaim_id=current_user.id)

@router.get("/admin/pending", response_model=List[KlaimResponse])
def get_pending_klaims(
    skip: int = 0, limit: int = 100, 
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin)
):
    """
    Admin mengecek daftar klaim yang masuk dan butuh verifikasi.
    """
    return KlaimService.get_pending_klaims(db, skip=skip, limit=limit)

@router.patch("/{klaim_id}/verify", response_model=KlaimResponse)
def verify_klaim(
    klaim_id: int,
    klaim_verify: KlaimVerify,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin)
):
    """
    Admin menyetujui (Approve) atau menolak (Reject) klaim.
    Jika di-reject, Laporan akan kembali berstatus 'published'.
    """
    return KlaimService.verify_klaim(db=db, klaim_id=klaim_id, is_approved=klaim_verify.is_approved)
