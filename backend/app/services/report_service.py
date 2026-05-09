from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models import Report, Item, User, ReportStatusEnum, ReportTypeEnum
from app.schemas.report import ReportCreate, ReportUpdate
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
        if report_update.receiver_name:
            db_report.receiver_name = report_update.receiver_name
        if report_update.description:
            db_report.description = report_update.description
        if report_update.photo_url:
            db_report.item.photo_url = report_update.photo_url
            
        db.commit()
        db.refresh(db_report)

        ActivityLogService.log(db, user.id, "UPDATE_REPORT", f"Updated report #{db_report.id}")
        return db_report
