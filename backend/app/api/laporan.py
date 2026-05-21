from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.cores.database import get_db
from app.models.user import User
from app.schemas.laporan import LaporanCreate, LaporanResponse, LaporanUpdateStatus
from app.services.laporan_service import LaporanService
from app.services.upload_service import UploadService
from app.api.deps import get_current_user, get_current_active_admin

from app.models.laporan import StatusLaporan, JenisLaporan, KategoriBarang, PublicStatusFilter

router = APIRouter()

@router.post("/", response_model=LaporanResponse, status_code=status.HTTP_201_CREATED)
async def create_laporan(
    jenis_laporan: JenisLaporan = Form(...),
    tanggal_kejadian: datetime = Form(...),
    lokasi: str = Form(...),
    deskripsi: str = Form(...),
    nama_barang: str = Form(...),
    kategori: KategoriBarang = Form(...),
    ciri_ciri: str = Form(...),
    foto: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    User (civitas) membuat laporan baru. 
    Menerima file gambar via `multipart/form-data`, diunggah ke cloud, 
    dan status laporan otomatis 'pending'.
    """
    # 1. Unggah gambar ke layanan cloud
    foto_url = await UploadService.upload_image(foto)
    
    # 2. Susun payload untuk model LaporanCreate
    laporan_in = LaporanCreate(
        jenis_laporan=jenis_laporan,
        tanggal_kejadian=tanggal_kejadian,
        lokasi=lokasi,
        deskripsi=deskripsi,
        nama_barang=nama_barang,
        kategori=kategori,
        ciri_ciri=ciri_ciri,
        foto_url=foto_url
    )
    
    # 3. Simpan ke database
    return LaporanService.create_laporan(db=db, laporan_in=laporan_in, pelapor_id=current_user.id)

@router.get("/", response_model=List[LaporanResponse])
def get_katalog(
    skip: int = 0, 
    limit: int = 100, 
    status: PublicStatusFilter = PublicStatusFilter.published, 
    jenis: JenisLaporan = None,
    kategori: KategoriBarang = None,
    search: str = None,
    db: Session = Depends(get_db)
):
    """
    Endpoint publik untuk katalog web. 
    Mendukung filter: `status` (hanya published/resolved), `jenis`, `kategori`, dan pencarian teks (`search`).
    """
    actual_status = StatusLaporan(status.value) if status else None
    return LaporanService.search_laporans(
        db, skip=skip, limit=limit, status=actual_status, jenis=jenis, kategori=kategori, search_query=search
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

@router.get("/{laporan_id}", response_model=LaporanResponse)
def get_detail_laporan(
    laporan_id: int,
    db: Session = Depends(get_db)
):
    """
    Mendapatkan detail spesifik dari satu laporan berdasarkan ID.
    Dapat diakses oleh publik untuk melihat detail halaman katalog.
    """
    return LaporanService.get_laporan_by_id(db, laporan_id)

@router.patch("/{laporan_id}/resolve", response_model=LaporanResponse)
def resolve_laporan_milik_sendiri(
    laporan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Pelapor (pemilik laporan) dapat secara mandiri menutup/menyelesaikan 
    laporannya (misalnya jika barang sudah ditemukan di luar sistem).
    """
    return LaporanService.resolve_laporan_by_owner(db, laporan_id, current_user.id)
