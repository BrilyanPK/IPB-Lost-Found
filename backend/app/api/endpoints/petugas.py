from fastapi import APIRouter, Depends
from typing import List
from app.api.deps import SessionDep, CurrentUser, require_role
from app.models import RoleEnum, ReportStatusEnum
from app.schemas.report import ReportCreate, ReportResponse, ReportUpdate
from app.schemas.inventory import InventoryCreate, InventoryResponse
from app.services.report_service import ReportService
from app.services.inventory_service import InventoryService
from app.services.dashboard_service import DashboardService
from app.schemas.user import UserResponse
from app.models import User

router = APIRouter()

@router.post(
    "/laporan",
    response_model=ReportResponse,
    dependencies=[Depends(require_role([RoleEnum.PETUGAS]))]
)
def create_laporan(
    report_in: ReportCreate,
    session: SessionDep,
    current_user: CurrentUser
):
    return ReportService.create(session, report_in, current_user)

@router.post(
    "/inventory",
    response_model=InventoryResponse,
    dependencies=[Depends(require_role([RoleEnum.PETUGAS]))]
)
def input_inventory(
    inventory_in: InventoryCreate,
    session: SessionDep,
    current_user: CurrentUser
):
    return InventoryService.add_item(session, inventory_in, current_user)


@router.get(
    "/laporan",
    response_model=List[ReportResponse],
    dependencies=[Depends(require_role([RoleEnum.PETUGAS]))]
)
def get_laporan(session: SessionDep, skip: int = 0, limit: int = 100):
    return ReportService.get_all(session, skip=skip, limit=limit)


@router.patch(
    "/laporan/{report_id}/status",
    response_model=ReportResponse,
    dependencies=[Depends(require_role([RoleEnum.PETUGAS]))]
)
def update_status(
    report_id: str,
    status_update: ReportUpdate,
    session: SessionDep,
    current_user: CurrentUser
):
    return ReportService.update_status(session, report_id, status_update, current_user)


@router.delete(
    "/laporan/{report_id}",
    dependencies=[Depends(require_role([RoleEnum.PETUGAS]))]
)
def delete_laporan(
    report_id: str,
    session: SessionDep,
    current_user: CurrentUser
):
    return ReportService.delete(session, report_id, current_user)


@router.get(
    "/riwayat",
    response_model=List[ReportResponse],
    dependencies=[Depends(require_role([RoleEnum.PETUGAS]))]
)
def get_riwayat(session: SessionDep):
    all_reports = ReportService.get_all(session, limit=1000)
    return [r for r in all_reports if r.status == ReportStatusEnum.DIKEMBALIKAN]


@router.get(
    "/stats",
    dependencies=[Depends(require_role([RoleEnum.PETUGAS]))]
)
def get_stats(session: SessionDep):
    return DashboardService.get_petugas_stats(session)


@router.get(
    "/inventory",
    response_model=List[InventoryResponse],
    dependencies=[Depends(require_role([RoleEnum.PETUGAS]))]
)
def get_inventory(session: SessionDep, skip: int = 0, limit: int = 100):
    return InventoryService.get_all(session, skip=skip, limit=limit)


@router.get(
    "/users",
    response_model=List[UserResponse],
    dependencies=[Depends(require_role([RoleEnum.PETUGAS, RoleEnum.ADMIN]))]
)
def get_users(session: SessionDep):
    from sqlalchemy import select
    users = session.execute(select(User)).scalars().all()
    return users
