from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import extract
from app.models import Inventory, Report, ReportTypeEnum, User, RoleEnum, ActivityLog


class DashboardService:
    @staticmethod
    def get_petugas_stats(db: Session) -> dict:
        total_inventory = db.query(Inventory).count()

        today = date.today()
        reports_today = db.query(Report).filter(
            Report.created_at >= datetime.combine(today, datetime.min.time())
        ).count()

        total_lost = db.query(Report).filter(Report.type == ReportTypeEnum.KEHILANGAN).count()
        total_found = db.query(Report).filter(Report.type == ReportTypeEnum.PENEMUAN).count()

        return {
            "total_inventory": total_inventory,
            "reports_today": reports_today,
            "total_lost": total_lost,
            "total_found": total_found
        }

    @staticmethod
    def get_admin_stats(db: Session) -> dict:
        total_users = db.query(User).count()
        total_petugas = db.query(User).filter(User.role == RoleEnum.PETUGAS).count()
        total_logs = db.query(ActivityLog).count()
        
        # Detailed stats for Dashboard
        total_login = db.query(ActivityLog).filter(ActivityLog.action == "LOGIN").count()
        total_login_success = db.query(ActivityLog).filter(ActivityLog.action == "LOGIN", ActivityLog.status == "Berhasil").count()
        total_login_failed = db.query(ActivityLog).filter(ActivityLog.action == "LOGIN", ActivityLog.status == "Peringatan").count()
        total_logout = db.query(ActivityLog).filter(ActivityLog.action == "LOGOUT").count()

        # Monthly activity for the current year
        current_year = datetime.now().year
        monthly_activity = []
        for month in range(1, 13):
            count = db.query(ActivityLog).filter(
                extract('year', ActivityLog.timestamp) == current_year,
                extract('month', ActivityLog.timestamp) == month
            ).count()
            monthly_activity.append(count)

        return {
            "total_users": total_users,
            "total_petugas": total_petugas,
            "total_logs": total_logs,
            "total_login": total_login,
            "total_login_success": total_login_success,
            "total_login_failed": total_login_failed,
            "total_logout": total_logout,
            "monthly_activity": monthly_activity
        }
