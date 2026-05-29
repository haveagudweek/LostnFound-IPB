from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.cores.database import get_db
from app.models.user import User
from app.models.laporan import Laporan, StatusLaporan, JenisLaporan
from app.models.klaim import Klaim, StatusKlaim
from app.schemas.admin import (
    AdminReportResponse, AdminVerifyAction,
    AdminClaimResponse, AdminClaimCreate, AdminClaimAction,
)
from app.api.deps import get_current_user, get_current_active_admin
from app.services.klaim_service import KlaimService
from app.services.notifikasi_service import NotifikasiService
from app.models.notifikasi import TipeNotifikasi

router = APIRouter()


# ════════════════════════════════════════════════
# Helpers: mapping DB → FE format
# ════════════════════════════════════════════════

def _laporan_to_admin_report(lap: Laporan) -> dict:
    """Map Laporan model ke AdminReportResponse (format FE)."""
    # Status mapping: pending→pending_verification, published→verified
    status_map = {
        StatusLaporan.pending: "pending_verification",
        StatusLaporan.published: "verified",
        StatusLaporan.rejected: "rejected",
        StatusLaporan.claimed: "verified",
        StatusLaporan.resolved: "verified",
    }
    fe_status = status_map.get(lap.status, "pending_verification")

    tag = "Temuan" if lap.jenis_laporan == JenisLaporan.ditemukan else "Hilang"

    time_str = ""
    report_time = ""
    if lap.tanggal_kejadian:
        time_str = lap.tanggal_kejadian.strftime("%d %b %Y, %H:%M")
    if lap.created_at:
        report_time = lap.created_at.strftime("%d %b %Y, %H:%M")

    reporter_name = lap.pelapor.name if lap.pelapor else None

    return {
        "id": lap.id,
        "name": lap.nama_barang,
        "status": fe_status,
        "image": lap.foto_url,
        "location": lap.lokasi,
        "time": time_str,
        "category": lap.kategori,
        "tag": tag,
        "description": lap.deskripsi,
        "reporterName": reporter_name,
        "reportTime": report_time,
        "detailLocation": lap.lokasi,
    }


def _klaim_to_admin_claim(klm: Klaim) -> dict:
    """Map Klaim model ke AdminClaimResponse (format FE)."""
    lap = klm.laporan
    item_name = lap.nama_barang if lap else "Unknown"
    image = klm.bukti_foto_url or (lap.foto_url if lap else None)
    location = lap.lokasi if lap else ""

    found_date = ""
    found_time = ""
    if lap and lap.tanggal_kejadian:
        found_date = lap.tanggal_kejadian.strftime("%d %b %Y")
        found_time = lap.tanggal_kejadian.strftime("%H:%M")

    claim_date = ""
    if klm.tanggal_klaim:
        claim_date = klm.tanggal_klaim.strftime("%d %b %Y, %H:%M WIB")

    # History placeholder
    history = "User has no previous claim history. This is their first interaction with the L&F system."

    return {
        "id": klm.id,
        "itemName": item_name,
        "image": image,
        "ownerName": klm.owner_name or (klm.pengklaim.name if klm.pengklaim else ""),
        "nim": klm.nim or (klm.pengklaim.nim if klm.pengklaim else ""),
        "faculty": klm.faculty or "",
        "contact": klm.contact or (klm.pengklaim.email if klm.pengklaim else ""),
        "description": klm.alasan_klaim,
        "evidenceImage": klm.bukti_foto_url,
        "location": location,
        "foundDate": found_date,
        "foundTime": found_time,
        "claimDate": claim_date,
        "history": history,
        "adminNote": "",
        "status": klm.status_klaim.value,
        "reportId": klm.laporan_id,
    }


# ════════════════════════════════════════════════
# VERIFICATION (Laporan Masuk)
# ════════════════════════════════════════════════

@router.get("/verification", response_model=List[AdminReportResponse])
def get_verification_reports(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin),
):
    """
    FE memanggil: GET /api/admin/verification
    Return semua laporan untuk tabel manajemen admin.
    """
    laporans = db.query(Laporan).order_by(Laporan.created_at.desc()).all()
    return [_laporan_to_admin_report(lap) for lap in laporans]


@router.get("/verification/{report_id}", response_model=AdminReportResponse)
def get_verification_report_by_id(
    report_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin),
):
    """
    FE memanggil: GET /api/admin/verification/{id}
    """
    lap = db.query(Laporan).filter(Laporan.id == report_id).first()
    if not lap:
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")
    return _laporan_to_admin_report(lap)


@router.patch("/verification/{report_id}", response_model=AdminReportResponse)
def verify_report(
    report_id: int,
    body: AdminVerifyAction,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin),
):
    """
    FE memanggil: PATCH /api/admin/verification/{id}
    Body: { action: "approve" / "reject" }
    """
    lap = db.query(Laporan).filter(Laporan.id == report_id).first()
    if not lap:
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")

    try:
        if body.action == "approve":
            lap.status = StatusLaporan.published
        elif body.action == "reject":
            lap.status = StatusLaporan.rejected
        else:
            raise HTTPException(status_code=400, detail="Action harus 'approve' atau 'reject'")

        db.commit()
        db.refresh(lap)
        return _laporan_to_admin_report(lap)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Gagal memverifikasi: {str(e)}")


# ════════════════════════════════════════════════
# CLAIMS (Antrean Klaim)
# ════════════════════════════════════════════════

@router.get("/claims", response_model=List[AdminClaimResponse])
def get_claims(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin),
):
    """
    FE memanggil: GET /api/admin/claims
    """
    klaims = db.query(Klaim).order_by(Klaim.tanggal_klaim.desc()).all()
    return [_klaim_to_admin_claim(klm) for klm in klaims]


@router.get("/claims/{claim_id}", response_model=AdminClaimResponse)
def get_claim_by_id(
    claim_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin),
):
    """
    FE memanggil: GET /api/admin/claims/{id}
    """
    klm = db.query(Klaim).filter(Klaim.id == claim_id).first()
    if not klm:
        raise HTTPException(status_code=404, detail="Klaim tidak ditemukan")
    return _klaim_to_admin_claim(klm)


@router.post("/claims", response_model=AdminClaimResponse, status_code=201)
def create_claim(
    body: AdminClaimCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    FE memanggil: POST /api/admin/claims
    Body: { itemId, ownerName, nim, faculty, contact, description, evidenceImage }
    """
    # Cek apakah laporan ada
    lap = db.query(Laporan).filter(Laporan.id == body.itemId).first()
    if not lap:
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")

    if lap.status not in (StatusLaporan.published, StatusLaporan.resolved):
        raise HTTPException(status_code=400, detail="Laporan ini tidak dapat diklaim saat ini")

    if lap.pelapor_id == current_user.id:
        raise HTTPException(status_code=400, detail="Anda tidak dapat mengklaim laporan Anda sendiri")

    try:
        new_klaim = Klaim(
            laporan_id=body.itemId,
            pengklaim_id=current_user.id,
            alasan_klaim=body.description,
            bukti_foto_url=body.evidenceImage,
            owner_name=body.ownerName,
            nim=body.nim,
            faculty=body.faculty,
            contact=body.contact,
            status_klaim=StatusKlaim.pending,
        )
        db.add(new_klaim)

        # Update status laporan menjadi claimed
        lap.status = StatusLaporan.claimed

        # Notifikasi ke pemilik laporan
        NotifikasiService.create_notifikasi(
            db=db,
            user_id=lap.pelapor_id,
            pesan="Seseorang mengklaim barang Anda. Menunggu verifikasi Admin.",
            tipe=TipeNotifikasi.INFO,
        )

        db.commit()
        db.refresh(new_klaim)
        return _klaim_to_admin_claim(new_klaim)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Gagal membuat klaim: {str(e)}")


@router.patch("/claims/{claim_id}", response_model=AdminClaimResponse)
def verify_claim(
    claim_id: int,
    body: AdminClaimAction,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin),
):
    """
    FE memanggil: PATCH /api/admin/claims/{id}
    Body: { action: "approve" / "reject" }
    """
    klm = db.query(Klaim).filter(Klaim.id == claim_id).first()
    if not klm:
        raise HTTPException(status_code=404, detail="Klaim tidak ditemukan")

    lap = db.query(Laporan).filter(Laporan.id == klm.laporan_id).first()

    try:
        if body.action == "approve":
            klm.status_klaim = StatusKlaim.approved
            NotifikasiService.create_notifikasi(
                db=db,
                user_id=klm.pengklaim_id,
                pesan="Klaim disetujui! Cek detail laporan untuk melihat kontak penemu.",
                tipe=TipeNotifikasi.SUCCESS,
            )
        elif body.action == "reject":
            klm.status_klaim = StatusKlaim.rejected
            if lap:
                lap.status = StatusLaporan.published
            NotifikasiService.create_notifikasi(
                db=db,
                user_id=klm.pengklaim_id,
                pesan="Klaim ditolak. Silakan ajukan ulang dengan bukti yang valid.",
                tipe=TipeNotifikasi.WARNING,
            )
        else:
            raise HTTPException(status_code=400, detail="Action harus 'approve' atau 'reject'")

        db.commit()
        db.refresh(klm)
        return _klaim_to_admin_claim(klm)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Gagal memverifikasi klaim: {str(e)}")
