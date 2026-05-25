from sqlalchemy.orm import Session

from app.models import Claim
from app.repositories.base_repository import BaseRepository


class ClaimRepository(BaseRepository[Claim]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, Claim)

    def list_ordered(self) -> list[Claim]:
        return list(self.db.query(Claim).order_by(Claim.created_at.desc()).all())
