from sqlalchemy.orm import Session

from app.models import ContactMessage
from app.repositories.base_repository import BaseRepository


class MessageRepository(BaseRepository[ContactMessage]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, ContactMessage)
