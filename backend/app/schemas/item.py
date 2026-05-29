from pydantic import BaseModel
from typing import Optional

class ItemResponse(BaseModel):
    """
    Schema response item yang 100% sesuai dengan kontrak Frontend.
    FE mengakses: item.id, item.name, item.status, item.image, 
    item.location, item.time, item.category, item.description
    """
    id: int
    name: str
    status: str          # "lost" / "found" (bukan status internal pending/published)
    image: Optional[str] = None
    location: str
    time: str            # Formatted datetime string
    category: str
    description: Optional[str] = None
    reporterName: Optional[str] = None

class ItemReportCreate(BaseModel):
    """
    Schema untuk FE reportItem.
    FE mengirim JSON: { name, category, location, time, description, image, reporterId }
    """
    name: str
    category: str
    location: str
    time: str
    description: Optional[str] = None
    image: Optional[str] = None
    reporterId: Optional[int] = None
