from fastapi import APIRouter, Depends
from typing import List
from app.api.deps import SessionDep, CurrentUser, require_role
from app.models import RoleEnum
from app.schemas.report import ReportCreate, ReportResponse
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
