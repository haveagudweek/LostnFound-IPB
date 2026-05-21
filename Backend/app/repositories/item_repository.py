from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models import Item
from app.repositories.base_repository import BaseRepository


class ItemRepository(BaseRepository[Item]):
    def __init__(self, db: Session) -> None:
        super().__init__(db, Item)

    def search(
        self,
        item_type: str = "all",
        query: str = "",
        category: str = "",
        location: str = "",
    ) -> list[Item]:
        statement = self.db.query(Item)

        if item_type in {"found", "lost"}:
            statement = statement.filter(Item.status == item_type)

        if query:
            search_term = f"%{query.lower()}%"
            statement = statement.filter(
                or_(
                    Item.name.ilike(search_term),
                    Item.location.ilike(search_term),
                    Item.category.ilike(search_term),
                )
            )

        if category:
            statement = statement.filter(Item.category.ilike(category))

        if location:
            statement = statement.filter(Item.location.ilike(f"%{location}%"))

        return list(statement.order_by(Item.created_at.desc()).all())

    def exists(self, item_id: str) -> bool:
        return self.db.query(Item.id).filter(Item.id == item_id).first() is not None
