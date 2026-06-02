import json

from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File, Query, Request
from sqlalchemy.orm import Session
from typing import List

from app.cores.database import get_db
from app.models.user import User
from app.models.laporan import Laporan, StatusLaporan, JenisLaporan
from app.models.klaim import Klaim, StatusKlaim
from app.schemas.admin import (
    AdminReportResponse, AdminVerifyAction,
    AdminClaimResponse, AdminClaimCreate, AdminClaimAction,
    AdminItemAction
)
from app.schemas.audit import ActivityLogResponse, AuditLogResponse
from app.schemas.item import ItemResponse
from app.api.deps import get_current_user, get_current_active_admin
from app.services.klaim_service import KlaimService
from app.services.upload_service import UploadService
from app.services.notifikasi_service import NotifikasiService
from app.services.audit_service import AuditLogService
from app.models.notifikasi import TipeNotifikasi
from app.models.audit_log import AuditLog

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
    request: Request,
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
            old_status = lap.status.value
            lap.status = StatusLaporan.published
            NotifikasiService.create_notifikasi(
                db=db,
                user_id=lap.pelapor_id,
                pesan=f"Laporan Anda untuk '{lap.nama_barang}' telah disetujui admin dan dipublikasikan.",
                tipe=TipeNotifikasi.SUCCESS,
            )
        elif body.action == "reject":
            old_status = lap.status.value
            lap.status = StatusLaporan.rejected
            NotifikasiService.create_notifikasi(
                db=db,
                user_id=lap.pelapor_id,
                pesan=f"Laporan Anda untuk '{lap.nama_barang}' ditolak oleh admin.",
                tipe=TipeNotifikasi.WARNING,
            )
        else:
            raise HTTPException(status_code=400, detail="Action harus 'approve' atau 'reject'")

        AuditLogService.create(
            db=db,
            action=f"admin.report.{body.action}",
            actor=current_admin,
            resource_type="laporan",
            resource_id=lap.id,
            detail={
                "old_status": old_status,
                "new_status": lap.status.value,
                "item_name": lap.nama_barang,
                "reporter_id": lap.pelapor_id,
            },
            request=request,
        )
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





@router.patch("/claims/{claim_id}", response_model=AdminClaimResponse)
def verify_claim(
    request: Request,
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
        old_claim_status = klm.status_klaim.value
        old_report_status = lap.status.value if lap else None
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

        AuditLogService.create(
            db=db,
            action=f"admin.claim.{body.action}",
            actor=current_admin,
            resource_type="klaim",
            resource_id=klm.id,
            detail={
                "old_claim_status": old_claim_status,
                "new_claim_status": klm.status_klaim.value,
                "old_report_status": old_report_status,
                "new_report_status": lap.status.value if lap else None,
                "laporan_id": klm.laporan_id,
                "claimant_id": klm.pengklaim_id,
            },
            request=request,
        )
        db.commit()
        db.refresh(klm)
        return _klaim_to_admin_claim(klm)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Gagal memverifikasi klaim: {str(e)}")

# ════════════════════════════════════════════════
# MANAGE POSTED ITEMS (Dashboard Admin)
# ════════════════════════════════════════════════

@router.get("/items", response_model=List[ItemResponse])
def get_posted_items(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin),
):
    """
    FE memanggil: GET /api/admin/items
    """
    from app.api.items import _laporan_to_item
    # Admin melihat semua laporan yang published, claimed, atau resolved
    laporans = db.query(Laporan).filter(
        Laporan.status.in_([StatusLaporan.published, StatusLaporan.claimed, StatusLaporan.resolved])
    ).order_by(Laporan.created_at.desc()).all()
    
    results = []
    for lap in laporans:
        item = _laporan_to_item(lap)
        # FE admin item list expects reportId
        item["reportId"] = lap.id
        
        # Determine claimStatus for frontend admin table
        if lap.status == StatusLaporan.claimed:
            # Find the approved or pending claim
            claim = db.query(Klaim).filter(
                Klaim.laporan_id == lap.id,
                Klaim.status_klaim.in_([StatusKlaim.pending, StatusKlaim.approved])
            ).first()
            if claim:
                item["claimStatus"] = "claimed"
                item["claimantName"] = claim.owner_name or claim.pengklaim.name if claim.pengklaim else None
                item["claimId"] = str(claim.id)
                item["claimedAt"] = claim.tanggal_klaim.strftime("%d %b %Y") if claim.tanggal_klaim else None
        
        # Map removed or held status for frontend filtering if needed
        # In DB we don't have "held" status natively for items, we just use status
        # but FE expects postingStatus.
        item["postingStatus"] = "posted"

        results.append(item)
    return results

@router.patch("/items/{item_id}", response_model=ItemResponse)
def manage_posted_item(
    request: Request,
    item_id: int,
    body: AdminItemAction,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin),
):
    """
    FE memanggil: PATCH /api/admin/items/{id}
    Body: { action: "delete" / "hold" / "post" / "cancel_claim" }
    """
    from app.api.items import _laporan_to_item
    lap = db.query(Laporan).filter(Laporan.id == item_id).first()
    if not lap:
        raise HTTPException(status_code=404, detail="Barang tidak ditemukan")

    old_status = lap.status.value
    affected_claim_ids = []
    if body.action == "delete":
        lap.status = StatusLaporan.rejected # as a form of deletion
    elif body.action == "hold":
        lap.status = StatusLaporan.pending
    elif body.action == "post":
        lap.status = StatusLaporan.published
    elif body.action == "cancel_claim":
        lap.status = StatusLaporan.published
        # Tolak semua klaim terkait yang pending/approved
        claims = db.query(Klaim).filter(
            Klaim.laporan_id == lap.id,
            Klaim.status_klaim.in_([StatusKlaim.pending, StatusKlaim.approved])
        ).all()
        for claim in claims:
            claim.status_klaim = StatusKlaim.rejected
            affected_claim_ids.append(claim.id)
    else:
        raise HTTPException(status_code=400, detail="Action tidak dikenal")

    AuditLogService.create(
        db=db,
        action=f"admin.item.{body.action}",
        actor=current_admin,
        resource_type="laporan",
        resource_id=lap.id,
        detail={
            "old_status": old_status,
            "new_status": lap.status.value,
            "item_name": lap.nama_barang,
            "affected_claim_ids": affected_claim_ids,
        },
        request=request,
    )
    db.commit()
    db.refresh(lap)
    
    item_res = _laporan_to_item(lap)
    item_res["postingStatus"] = "held" if body.action == "hold" else "posted"
    return item_res


@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    limit: int = Query(100, ge=1, le=500),
    action: str | None = Query(None),
    actor_email: str | None = Query(None),
    resource_type: str | None = Query(None),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin),
):
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action)
    if actor_email:
        query = query.filter(AuditLog.actor_email == actor_email)
    if resource_type:
        query = query.filter(AuditLog.resource_type == resource_type)

    return query.order_by(AuditLog.created_at.desc()).limit(limit).all()


@router.get("/activity-logs", response_model=List[ActivityLogResponse])
def get_activity_logs(
    limit: int = Query(100, ge=1, le=500),
    event_type: str | None = Query(None),
    resource_type: str | None = Query(None),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin),
):
    activities = []

    def add_activity(
        id: str,
        event_type: str,
        resource_type: str,
        resource_id: int,
        title: str,
        created_at,
        description: str | None = None,
        actor_name: str | None = None,
        actor_email: str | None = None,
        status: str = "info",
    ):
        if not created_at:
            return
        activities.append({
            "id": id,
            "event_type": event_type,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "title": title,
            "description": description,
            "actor_name": actor_name,
            "actor_email": actor_email,
            "status": status,
            "created_at": created_at,
        })

    if resource_type in (None, "laporan"):
        laporans = db.query(Laporan).order_by(Laporan.created_at.desc()).limit(limit).all()
        for lap in laporans:
            add_activity(
                id=f"laporan-created-{lap.id}",
                event_type="laporan.created",
                resource_type="laporan",
                resource_id=lap.id,
                title=f"Laporan baru: {lap.nama_barang}",
                description=f"{lap.jenis_laporan.value} di {lap.lokasi}",
                actor_name=lap.pelapor.name if lap.pelapor else None,
                actor_email=lap.pelapor.email if lap.pelapor else None,
                status=lap.status.value,
                created_at=lap.created_at,
            )

    if resource_type in (None, "klaim"):
        klaims = db.query(Klaim).order_by(Klaim.tanggal_klaim.desc()).limit(limit).all()
        for klm in klaims:
            item_name = klm.laporan.nama_barang if klm.laporan else f"Laporan #{klm.laporan_id}"
            add_activity(
                id=f"klaim-created-{klm.id}",
                event_type="klaim.created",
                resource_type="klaim",
                resource_id=klm.id,
                title=f"Klaim masuk: {item_name}",
                description=klm.alasan_klaim,
                actor_name=klm.pengklaim.name if klm.pengklaim else klm.owner_name,
                actor_email=klm.pengklaim.email if klm.pengklaim else None,
                status=klm.status_klaim.value,
                created_at=klm.tanggal_klaim,
            )
            add_activity(
                id=f"item-claimed-{klm.id}",
                event_type="item.claimed",
                resource_type="laporan",
                resource_id=klm.laporan_id,
                title=f"Item diklaim: {item_name}",
                description=f"Klaim #{klm.id} dibuat dan laporan masuk status claimed.",
                actor_name=klm.pengklaim.name if klm.pengklaim else klm.owner_name,
                actor_email=klm.pengklaim.email if klm.pengklaim else None,
                status="claimed",
                created_at=klm.tanggal_klaim,
            )

    audit_event_map = {
        "admin.report.approve": ("laporan.approved", "Laporan disetujui"),
        "admin.report.reject": ("laporan.rejected", "Laporan ditolak"),
        "admin.item.hold": ("laporan.held", "Laporan di-hold"),
        "admin.item.post": ("laporan.published", "Laporan dipublikasikan"),
        "admin.item.delete": ("laporan.deleted", "Laporan dihapus"),
        "admin.item.cancel_claim": ("klaim.cancelled", "Klaim dibatalkan"),
        "admin.claim.approve": ("klaim.approved", "Klaim disetujui"),
        "admin.claim.reject": ("klaim.rejected", "Klaim ditolak"),
        "item.resolved": ("item.resolved", "Item selesai"),
    }

    audit_logs = db.query(AuditLog).filter(
        AuditLog.action.in_(audit_event_map.keys())
    ).order_by(AuditLog.created_at.desc()).limit(limit).all()

    for log in audit_logs:
        mapped_event, title_prefix = audit_event_map[log.action]
        detail = {}
        if log.detail:
            try:
                detail = json.loads(log.detail)
            except json.JSONDecodeError:
                detail = {"detail": log.detail}

        target_resource_type = log.resource_type or (
            "klaim" if mapped_event.startswith("klaim.") else "laporan"
        )
        target_resource_id = int(log.resource_id) if log.resource_id and str(log.resource_id).isdigit() else 0
        item_name = detail.get("item_name")
        title = f"{title_prefix}: {item_name}" if item_name else title_prefix
        description_parts = []
        if detail.get("old_status") and detail.get("new_status"):
            description_parts.append(f"{detail['old_status']} -> {detail['new_status']}")
        if detail.get("old_claim_status") and detail.get("new_claim_status"):
            description_parts.append(f"{detail['old_claim_status']} -> {detail['new_claim_status']}")
        if detail.get("affected_claim_ids"):
            description_parts.append(f"affected claims: {', '.join(map(str, detail['affected_claim_ids']))}")
        if detail.get("detail"):
            description_parts.append(str(detail["detail"]))

        add_activity(
            id=f"audit-{log.id}",
            event_type=mapped_event,
            resource_type=target_resource_type,
            resource_id=target_resource_id,
            title=title,
            description=" | ".join(description_parts) or log.detail,
            actor_email=log.actor_email,
            status=detail.get("new_status")
                or detail.get("new_claim_status")
                or ("success" if log.success else "failed"),
            created_at=log.created_at,
        )

    if event_type:
        activities = [activity for activity in activities if activity["event_type"] == event_type]

    activities.sort(key=lambda activity: activity["created_at"], reverse=True)
    return activities[:limit]

