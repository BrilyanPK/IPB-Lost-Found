from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models import Report, Item, User, ReportStatusEnum
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
    def update_status(db: Session, report_id: str, new_status: ReportUpdate, user: User) -> Report:
        db_report = db.query(Report).filter(Report.id == report_id).first()
        if not db_report:
            raise HTTPException(status_code=404, detail="Report not found")

        db_report.status = new_status.status
        db.commit()
        db.refresh(db_report)

        ActivityLogService.log(db, user.id, "UPDATE_STATUS", f"Updated report #{db_report.id} status to {db_report.status}")
        return db_report
