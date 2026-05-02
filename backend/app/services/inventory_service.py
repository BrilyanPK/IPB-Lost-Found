from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models import Inventory, Item, User
from app.schemas.inventory import InventoryCreate
from app.services.activity_log_service import ActivityLogService


class InventoryService:
    @staticmethod
    def add_item(db: Session, inventory_data: InventoryCreate, user: User) -> Inventory:
        db_item = db.query(Item).filter(Item.id == inventory_data.item_id).first()
        if not db_item:
            raise HTTPException(status_code=404, detail="Item not found")

        db_inv = db.query(Inventory).filter(Inventory.item_id == inventory_data.item_id).first()
        if db_inv:
            db_inv.quantity += inventory_data.quantity
        else:
            db_inv = Inventory(
                item_id=inventory_data.item_id,
                quantity=inventory_data.quantity
            )
            db.add(db_inv)

        db.commit()
        db.refresh(db_inv)

        ActivityLogService.log(db, user.id, "UPDATE_INVENTORY", f"Added {inventory_data.quantity} of item #{db_item.id} to inventory")
        return db_inv

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> list:
        return db.query(Inventory).offset(skip).limit(limit).all()
