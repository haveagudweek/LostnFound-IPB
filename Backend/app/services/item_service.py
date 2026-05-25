from datetime import datetime

from fastapi import HTTPException, status

from app.models import Item, VerificationReport
from app.repositories.item_repository import ItemRepository
from app.repositories.user_repository import UserRepository
from app.repositories.verification_repository import VerificationReportRepository
from app.schemas import ItemResponse, ReportItemRequest
from app.services.mappers import ResponseMapper


class ItemService:
    def __init__(
        self,
        item_repository: ItemRepository,
        verification_repository: VerificationReportRepository,
        user_repository: UserRepository,
    ) -> None:
        self.item_repository = item_repository
        self.verification_repository = verification_repository
        self.user_repository = user_repository

    def list_items(
        self,
        item_type: str = "all",
        query: str = "",
        category: str = "",
        location: str = "",
    ) -> list[ItemResponse]:
        return [
            ResponseMapper.item(item)
            for item in self.item_repository.search(item_type, query, category, location)
        ]

    def get_item(self, item_id: str) -> ItemResponse:
        item = self.item_repository.get_by_id(item_id)
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Barang tidak ditemukan.")
        return ResponseMapper.item(item)

    def report_item(self, report_type: str, payload: ReportItemRequest) -> ItemResponse:
        if report_type not in {"found", "lost"}:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tipe laporan tidak valid.")

        if not payload.name or not payload.location or not payload.time or not payload.category:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Kolom bertanda * wajib diisi.")

        now = datetime.utcnow()
        item_id = f"{'F' if report_type == 'found' else 'L'}{int(now.timestamp() * 1000) % 10000:04d}"
        reporter = self.user_repository.get_by_id(payload.reporterId) if payload.reporterId else None

        pending_item = Item(
            id=item_id,
            name=payload.name,
            image=payload.image,
            location=payload.location,
            time=payload.time,
            category=payload.category,
            status=report_type,
            description=payload.description,
            reporter_id=payload.reporterId,
        )

        report = VerificationReport(
            id=f"LF-{int(now.timestamp() * 1000) % 10000:04d}",
            item_id=pending_item.id,
            name=pending_item.name,
            reporter_name=reporter.name if reporter else "Rizky",
            image=pending_item.image,
            location=pending_item.location,
            detail_location=pending_item.location,
            time=pending_item.time,
            report_time=now.strftime("%d %b %Y, %H:%M WIB"),
            category=pending_item.category,
            tag="Temuan" if report_type == "found" else "Hilang",
            report_type=report_type,
            status="pending_verification",
            description=pending_item.description,
            reporter_id=pending_item.reporter_id,
        )
        self.verification_repository.add(report)
        return ResponseMapper.item(pending_item)
