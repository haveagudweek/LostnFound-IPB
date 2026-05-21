from fastapi import APIRouter, Depends

from app.dependencies import get_contact_service
from app.schemas import ContactMessageRequest, ContactMessageResponse
from app.services.contact_service import ContactService


router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("/{item_id}", response_model=ContactMessageResponse)
def send_message(
    item_id: str,
    payload: ContactMessageRequest,
    service: ContactService = Depends(get_contact_service),
) -> ContactMessageResponse:
    return service.send_message(item_id, payload)
