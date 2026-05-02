from pydantic import BaseModel
from datetime import datetime
from app.schemas.item import ItemResponse


class InventoryBase(BaseModel):
    quantity: int


class InventoryCreate(InventoryBase):
    item_id: str


class InventoryResponse(InventoryBase):
    id: str
    item_id: str
    updated_at: datetime
    item: ItemResponse

    model_config = {"from_attributes": True}
