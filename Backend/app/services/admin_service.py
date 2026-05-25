from fastapi import HTTPException, status

from datetime import datetime

from app.models import Claim, Item
from app.repositories.claim_repository import ClaimRepository
from app.repositories.item_repository import ItemRepository
from app.repositories.verification_repository import VerificationReportRepository
from app.schemas import ClaimCreateRequest, ClaimResponse, VerificationReportResponse
from app.services.mappers import ResponseMapper


class AdminService:
    def __init__(
        self,
        verification_repository: VerificationReportRepository,
        claim_repository: ClaimRepository,
        item_repository: ItemRepository,
    ) -> None:
        self.verification_repository = verification_repository
        self.claim_repository = claim_repository
        self.item_repository = item_repository

    def list_verification_reports(self) -> list[VerificationReportResponse]:
        return [ResponseMapper.verification_report(report) for report in self.verification_repository.list_ordered()]

    def get_verification_report(self, report_id: str) -> VerificationReportResponse:
        report = self.verification_repository.get_by_id(report_id)
        if not report:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Laporan tidak ditemukan.")
        return ResponseMapper.verification_report(report)

    def verify_report(self, report_id: str, action: str) -> VerificationReportResponse:
        report = self.verification_repository.get_by_id(report_id)
        if not report:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Laporan tidak ditemukan.")

        report.status = "verified" if action == "approve" else "rejected"
        updated_report = self.verification_repository.update(report)

        if action == "approve" and not self.item_repository.exists(report.item_id):
            self.item_repository.add(
                Item(
                    id=report.item_id,
                    name=report.name,
                    image=report.image,
                    location=report.location,
                    time=report.time,
                    category=report.category,
                    status=report.report_type,
                    description=report.description,
                    reporter_id=report.reporter_id,
                )
            )

        return ResponseMapper.verification_report(updated_report)

    def list_claims(self) -> list[ClaimResponse]:
        return [ResponseMapper.claim(claim) for claim in self.claim_repository.list_ordered()]

    def create_claim(self, payload: ClaimCreateRequest) -> ClaimResponse:
        item = self.item_repository.get_by_id(payload.itemId)
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Barang tidak ditemukan.")

        if item.status != "found":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Hanya barang ditemukan yang dapat diklaim.")

        if not payload.description.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Deskripsi klaim wajib diisi.")

        report = self.verification_repository.get_by_item_id(item.id)
        now = datetime.utcnow()
        claim = Claim(
            id=f"CLM-{int(now.timestamp() * 1000) % 10000:04d}",
            item_id=item.id,
            report_id=report.id if report else item.id,
            item_name=item.name,
            image=payload.evidenceImage or item.image,
            owner_name=payload.ownerName,
            nim=payload.nim,
            faculty=payload.faculty or "-",
            contact=payload.contact or "-",
            location=item.location,
            found_date=item.time,
            found_time="-",
            claim_date=now.strftime("%d %b %Y - %H:%M WIB"),
            status="pending",
            evidence_attached=bool(payload.evidenceImage),
            description=payload.description,
            admin_note="Periksa deskripsi dan bukti kepemilikan sebelum menyetujui klaim.",
            history="Klaim dibuat oleh pengguna dan menunggu verifikasi admin.",
        )
        return ResponseMapper.claim(self.claim_repository.add(claim))

    def get_claim(self, claim_id: str) -> ClaimResponse:
        claim = self.claim_repository.get_by_id(claim_id)
        if not claim:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Klaim tidak ditemukan.")
        return ResponseMapper.claim(claim)

    def verify_claim(self, claim_id: str, action: str) -> ClaimResponse:
        claim = self.claim_repository.get_by_id(claim_id)
        if not claim:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Klaim tidak ditemukan.")

        claim.status = "approved" if action == "approve" else "rejected"
        return ResponseMapper.claim(self.claim_repository.update(claim))
