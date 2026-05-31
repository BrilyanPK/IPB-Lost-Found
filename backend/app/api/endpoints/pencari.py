from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.api.deps import SessionDep, CurrentUser, require_role
from app.models import RoleEnum, ReportStatusEnum
from app.schemas.report import ReportCreate, ReportResponse, ReportUpdate, ReportEditByPencari
from app.services.report_service import ReportService

router = APIRouter()

@router.post(
    "/laporan",
    response_model=ReportResponse,
    dependencies=[Depends(require_role([RoleEnum.PENCARI]))]
)
def create_laporan(
    report_in: ReportCreate,
    session: SessionDep,
    current_user: CurrentUser
):
    return ReportService.create(session, report_in, current_user)


@router.get(
    "/laporan",
    response_model=List[ReportResponse],
)
def get_laporan(session: SessionDep, skip: int = 0, limit: int = 100):
    return ReportService.get_all(session, skip=skip, limit=limit)


@router.get(
    "/laporan/me",
    response_model=List[ReportResponse],
    dependencies=[Depends(require_role([RoleEnum.PENCARI]))]
)
def get_my_laporan(session: SessionDep, current_user: CurrentUser):
    return ReportService.get_by_user(session, user_id=current_user.id)


@router.patch(
    "/laporan/{report_id}/found",
    response_model=ReportResponse,
    dependencies=[Depends(require_role([RoleEnum.PENCARI]))]
)
def claim_found_item(report_id: str, session: SessionDep, current_user: CurrentUser):
    # Fetch report to check its current status
    from app.models import Report
    report = session.query(Report).filter(Report.id == report_id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")
        
    if report.status not in [ReportStatusEnum.HILANG, ReportStatusEnum.DIPROSES]:
        raise HTTPException(status_code=400, detail="Hanya laporan kehilangan atau yang sedang diproses yang bisa diklaim")
        
    if report.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Anda tidak bisa mengklaim barang Anda sendiri")

    # Update status to DIPROSES and set finder_id
    update_data = ReportUpdate(
        status=ReportStatusEnum.DIPROSES,
        finder_id=current_user.id
    )
    return ReportService.update_status(session, report_id, update_data, current_user)

@router.delete(
    "/laporan/{report_id}",
    dependencies=[Depends(require_role([RoleEnum.PENCARI]))]
)
def delete_laporan(report_id: str, session: SessionDep, current_user: CurrentUser):
    return ReportService.delete(session, report_id, current_user)

@router.patch(
    "/laporan/{report_id}",
    response_model=ReportResponse,
    dependencies=[Depends(require_role([RoleEnum.PENCARI]))]
)
def edit_my_laporan(report_id: str, update_data: ReportEditByPencari, session: SessionDep, current_user: CurrentUser):
    return ReportService.update_my_report(session, report_id, update_data, current_user)
