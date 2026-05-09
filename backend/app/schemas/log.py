from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.schemas.user import UserResponse


class ActivityLogBase(BaseModel):
    action: str
    target_detail: str
    ip_address: Optional[str] = None
    status: Optional[str] = "Berhasil"


class ActivityLogCreate(ActivityLogBase):
    user_id: Optional[str] = None


class ActivityLogResponse(ActivityLogBase):
    id: str
    user_id: Optional[str] = None
    timestamp: datetime
    user: Optional[UserResponse] = None

    model_config = {"from_attributes": True}
