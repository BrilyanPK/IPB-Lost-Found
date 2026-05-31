from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models import Report, Item, User, ReportStatusEnum, ReportTypeEnum
from app.schemas.report import ReportCreate, ReportUpdate, ReportEditByPencari
from app.services.activity_log_service import ActivityLogService


class ReportService:
    @staticmethod
    def create(db: Session, report_data: ReportCreate, user: User) -> Report:
        db_item = Item(
            name=report_data.item.name,
            category=report_data.item.category,
            photo_url=report_data.item.photo_url
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)

        initial_status = ReportStatusEnum.DITEMUKAN if report_data.type == ReportTypeEnum.PENEMUAN else ReportStatusEnum.HILANG
        db_report = Report(
            type=report_data.type,
            user_id=user.id,
            item_id=db_item.id,
            location=report_data.location,
            description=report_data.description,
            report_time=report_data.report_time or datetime.utcnow(),
            finder_id=report_data.finder_id,
            status=initial_status
        )
        db.add(db_report)
        db.commit()
        db.refresh(db_report)

        ActivityLogService.log(db, user.id, "CREATE_REPORT", f"Created report #{db_report.id} ({db_report.type}) for {db_item.name}")
        return db_report

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> list:
        return db.query(Report).offset(skip).limit(limit).all()

    @staticmethod
    def get_by_user(db: Session, user_id: str) -> list:
        return db.query(Report).filter(Report.user_id == user_id).all()

    @staticmethod
    def update_status(db: Session, report_id: str, report_update: ReportUpdate, user: User) -> Report:
        db_report = db.query(Report).filter(Report.id == report_id).first()
        if not db_report:
            raise HTTPException(status_code=404, detail="Report not found")

        if report_update.status:
            db_report.status = report_update.status
        if report_update.receiver_id:
            db_report.receiver_id = report_update.receiver_id
        if report_update.finder_id:
            db_report.finder_id = report_update.finder_id
        if report_update.description:
            db_report.description = report_update.description
        if report_update.photo_url:
            db_report.item.photo_url = report_update.photo_url
            
        db.commit()
        db.refresh(db_report)

        ActivityLogService.log(db, user.id, "UPDATE_REPORT", f"Updated report #{db_report.id}")
        return db_report

    @staticmethod
    def update_my_report(db: Session, report_id: str, edit_data: ReportEditByPencari, user: User) -> Report:
        db_report = db.query(Report).filter(Report.id == report_id).first()
        if not db_report:
            raise HTTPException(status_code=404, detail="Report not found")
            
        if db_report.user_id != user.id:
            raise HTTPException(status_code=403, detail="Not authorized to edit this report")
            
        if db_report.status != ReportStatusEnum.HILANG:
            raise HTTPException(status_code=400, detail="Only reports with 'Hilang' status can be edited")

        if edit_data.location is not None:
            db_report.location = edit_data.location
        if edit_data.description is not None:
            db_report.description = edit_data.description
        if edit_data.report_time is not None:
            db_report.report_time = edit_data.report_time
            
        if edit_data.item_name is not None or edit_data.item_category is not None:
            db_item = db.query(Item).filter(Item.id == db_report.item_id).first()
            if db_item:
                if edit_data.item_name is not None:
                    db_item.name = edit_data.item_name
                if edit_data.item_category is not None:
                    db_item.category = edit_data.item_category

        db.commit()
        db.refresh(db_report)

        ActivityLogService.log(db, user.id, "EDIT_REPORT", f"Edited report #{db_report.id}")
        return db_report

    @staticmethod
    def delete(db: Session, report_id: str, user: User) -> dict:
        db_report = db.query(Report).filter(Report.id == report_id).first()
        if not db_report:
            raise HTTPException(status_code=404, detail="Report not found")
            
        if db_report.user_id != user.id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this report")

        # Capture item_id before deleting report
        item_id = db_report.item_id
        
        # Delete report first (due to foreign key constraints if any)
        db.delete(db_report)
        
        # Delete the associated item
        if item_id:
            db_item = db.query(Item).filter(Item.id == item_id).first()
            if db_item:
                db.delete(db_item)
                
        db.commit()
        ActivityLogService.log(db, user.id, "DELETE_REPORT", f"Deleted report #{report_id}")
        return {"detail": "Report and associated item deleted successfully"}
