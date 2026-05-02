from pydantic import BaseModel


class ItemBase(BaseModel):
    name: str
    category: str
    photo_url: str | None = None


class ItemCreate(ItemBase):
    pass


class ItemResponse(ItemBase):
    id: str

    model_config = {"from_attributes": True}
