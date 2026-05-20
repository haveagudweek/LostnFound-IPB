from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.laporan import JenisLaporan, StatusLaporan, KategoriBarang

class LaporanBase(BaseModel):
    jenis_laporan: JenisLaporan
    tanggal_kejadian: datetime
    lokasi: str
    deskripsi: str
    nama_barang: str
    kategori: KategoriBarang
    ciri_ciri: str
    foto_url: Optional[str] = None

class LaporanCreate(LaporanBase):
    pass

class LaporanUpdateStatus(BaseModel):
    status: StatusLaporan

# Nested schema untuk return user di laporan (opsional)
class PelaporBase(BaseModel):
    id: int
    nama: str
    nomor_telepon: str
    
    class Config:
        from_attributes = True

class LaporanResponse(LaporanBase):
    id: int
    pelapor_id: int
    status: StatusLaporan
    created_at: datetime
    pelapor: Optional[PelaporBase] = None

    class Config:
        from_attributes = True
