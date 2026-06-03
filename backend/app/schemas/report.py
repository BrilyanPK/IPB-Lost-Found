from pydantic import BaseModel
from datetime import datetime
from app.models import ReportStatusEnum
from app.schemas.item import ItemCreate, ItemResponse
from app.schemas.user import UserResponse


class ReportBase(BaseModel):
    contact_info: str | None = None
    location: str
    description: str
    report_time: datetime | None = None
    finder_id: str | None = None


class ReportCreate(ReportBase):
    item: ItemCreate


class ReportResponse(ReportBase):
    id: str
    user_id: str
    item_id: str
    report_time: datetime
    status: ReportStatusEnum
    created_at: datetime
    finder_id: str | None = None
    receiver_id: str | None = None
    item: ItemResponse
    user: UserResponse
    finder: UserResponse | None = None
    receiver: UserResponse | None = None

    model_config = {"from_attributes": True}


class ReportUpdate(BaseModel):
    status: ReportStatusEnum | None = None
    receiver_id: str | None = None
    finder_id: str | None = None
    description: str | None = None
    photo_url: str | None = None


class ReportEditByPencari(BaseModel):
    location: str | None = None
    description: str | None = None
    report_time: datetime | None = None
    contact_info: str | None = None
    item_name: str | None = None
    item_category: str | None = None
