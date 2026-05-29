from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.cores.database import get_db
from app.models.user import User
from app.models.laporan import Laporan
from app.api.deps import get_current_user
from app.services.notifikasi_service import NotifikasiService
from app.models.notifikasi import TipeNotifikasi

router = APIRouter()

class ContactMessage(BaseModel):
    message: str

@router.post("/{item_id}")
def send_message(
    item_id: int,
    body: ContactMessage,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lap = db.query(Laporan).filter(Laporan.id == item_id).first()
    if not lap:
        raise HTTPException(status_code=404, detail="Barang tidak ditemukan")
    
    if lap.pelapor_id == current_user.id:
        raise HTTPException(status_code=400, detail="Anda tidak dapat mengirim pesan ke diri sendiri")

    # Di dunia nyata ini bisa mengirim email.
    # Untuk sekarang kita buat notifikasi ke pelapor.
    pesan_notif = f"Pesan dari {current_user.name}: {body.message}"
    
    NotifikasiService.create_notifikasi(
        db=db,
        user_id=lap.pelapor_id,
        pesan=pesan_notif[:255],  # Potong jika terlalu panjang untuk tabel notif
        tipe=TipeNotifikasi.INFO
    )

    return {"ok": True, "message": "Pesan terkirim"}
