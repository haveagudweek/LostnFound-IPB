from sqlalchemy.orm import Session

from app.models import VerificationReport
from app.repositories.base_repository import BaseRepository


class VerificationReportRepository(BaseRepository[VerificationReport]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, VerificationReport)

    def list_ordered(self) -> list[VerificationReport]:
        return list(self.db.query(VerificationReport).order_by(VerificationReport.created_at.desc()).all())

    def get_by_item_id(self, item_id: str) -> VerificationReport | None:
        return (
            self.db.query(VerificationReport)
            .filter(VerificationReport.item_id == item_id)
            .order_by(VerificationReport.created_at.desc())
            .first()
        )
