from pydantic import BaseModel
from datetime import datetime
from app.models import ReportTypeEnum, ReportStatusEnum
from app.schemas.item import ItemCreate, ItemResponse
from app.schemas.user import UserResponse


class ReportBase(BaseModel):
    type: ReportTypeEnum
    location: str
    description: str
    report_time: datetime | None = None
    receiver_name: str | None = None


class ReportCreate(ReportBase):
    item: ItemCreate


class ReportResponse(ReportBase):
    id: str
    user_id: str
    item_id: str
    report_time: datetime
    status: ReportStatusEnum
    created_at: datetime
    item: ItemResponse
    user: UserResponse

    model_config = {"from_attributes": True}


class ReportUpdate(BaseModel):
    status: ReportStatusEnum | None = None
    receiver_name: str | None = None
    description: str | None = None
    photo_url: str | None = None
