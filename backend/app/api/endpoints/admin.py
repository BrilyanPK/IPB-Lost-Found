from fastapi import APIRouter, Depends
from typing import List
from app.api.deps import SessionDep, CurrentUser, require_role
from app.models import RoleEnum
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.schemas.log import ActivityLogResponse
from app.services.user_service import UserService
from app.services.dashboard_service import DashboardService
from app.services.activity_log_service import ActivityLogService

router = APIRouter()


@router.post(
    "/users",
    response_model=UserResponse,
    dependencies=[Depends(require_role([RoleEnum.ADMIN]))]
)
def create_user(
    user_in: UserCreate,
    session: SessionDep,
    current_user: CurrentUser
):
    return UserService.create_by_admin(session, user_in, current_user)


@router.get(
    "/users",
    response_model=List[UserResponse],
    dependencies=[Depends(require_role([RoleEnum.ADMIN]))]
)
def get_users(session: SessionDep):
    return UserService.get_all(session)


@router.get(
    "/users/{user_id}",
    response_model=UserResponse,
    dependencies=[Depends(require_role([RoleEnum.ADMIN]))]
)
def get_user(user_id: str, session: SessionDep):
    return UserService.get_by_id(session, user_id)


@router.put(
    "/users/{user_id}",
    response_model=UserResponse,
    dependencies=[Depends(require_role([RoleEnum.ADMIN]))]
)
def update_user(
    user_id: str,
    user_in: UserUpdate,
    session: SessionDep,
    current_user: CurrentUser
):
    return UserService.update_by_admin(session, user_id, user_in, current_user)


@router.delete(
    "/users/{user_id}",
    dependencies=[Depends(require_role([RoleEnum.ADMIN]))]
)
def delete_user(
    user_id: str,
    session: SessionDep,
    current_user: CurrentUser
):
    return UserService.delete_by_admin(session, user_id, current_user)


@router.get(
    "/logs",
    response_model=List[ActivityLogResponse],
    dependencies=[Depends(require_role([RoleEnum.ADMIN]))]
)
def get_logs(session: SessionDep, skip: int = 0, limit: int = 100):
    return ActivityLogService.get_all(session, skip=skip, limit=limit)


@router.get(
    "/stats",
    dependencies=[Depends(require_role([RoleEnum.ADMIN]))]
)
def get_stats(session: SessionDep):
    return DashboardService.get_admin_stats(session)
