from fastapi import APIRouter, Depends, Query

from app.dependencies import get_item_service
from app.schemas import ItemResponse, ReportItemRequest
from app.services.item_service import ItemService


router = APIRouter(prefix="/items", tags=["items"])


@router.get("", response_model=list[ItemResponse])
def list_items(
    type: str = Query("all"),
    query: str = Query(""),
    category: str = Query(""),
    location: str = Query(""),
    service: ItemService = Depends(get_item_service),
) -> list[ItemResponse]:
    return service.list_items(type, query, category, location)


@router.get("/{item_id}", response_model=ItemResponse)
def get_item(item_id: str, service: ItemService = Depends(get_item_service)) -> ItemResponse:
    return service.get_item(item_id)


@router.post("/report/{report_type}", response_model=ItemResponse)
def report_item(
    report_type: str,
    payload: ReportItemRequest,
    service: ItemService = Depends(get_item_service),
) -> ItemResponse:
    return service.report_item(report_type, payload)
