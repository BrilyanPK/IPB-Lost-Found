from pydantic import BaseModel
from datetime import datetime
from app.schemas.user import UserResponse


class ActivityLogBase(BaseModel):
    action: str
    target_detail: str


class ActivityLogCreate(ActivityLogBase):
    user_id: str


class ActivityLogResponse(ActivityLogBase):
    id: str
    user_id: str
    timestamp: datetime
    user: UserResponse

    model_config = {"from_attributes": True}
