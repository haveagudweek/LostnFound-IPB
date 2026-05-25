from fastapi import HTTPException, status

from app.models import ContactMessage
from app.repositories.item_repository import ItemRepository
from app.repositories.message_repository import MessageRepository
from app.schemas import ContactMessageRequest, ContactMessageResponse
from app.services.mappers import ResponseMapper


class ContactService:
    def __init__(self, message_repository: MessageRepository, item_repository: ItemRepository) -> None:
        self.message_repository = message_repository
        self.item_repository = item_repository

    def send_message(self, item_id: str, payload: ContactMessageRequest) -> ContactMessageResponse:
        if not payload.message.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Pesan tidak boleh kosong.")

        if not self.item_repository.get_by_id(item_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Barang tidak ditemukan.")

        message = ContactMessage(item_id=item_id, message=payload.message.strip())
        return ResponseMapper.message(self.message_repository.add(message))
