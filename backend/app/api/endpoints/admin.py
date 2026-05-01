from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import SessionDep, CurrentUser
from app.models import User, RoleEnum, LogAktivitas
from app.schemas.user import User as UserSchema, UserCreate
from app.schemas.log import LogAktivitas as LogAktivitasSchema
from app.services.user_service import UserService

router = APIRouter()

def check_admin(current_user: User):
    if current_user.role != RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")

@router.get("/users", response_model=List[UserSchema])
def read_users(session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100) -> Any:
    check_admin(current_user)
    users = session.query(User).offset(skip).limit(limit).all()
    return users

@router.post("/users", response_model=UserSchema)
def create_user(session: SessionDep, current_user: CurrentUser, user_in: UserCreate) -> Any:
    check_admin(current_user)
    user = UserService.get_user_by_email(db=session, email=user_in.email)
    if user:
        raise HTTPException(status_code=400, detail="The user with this username already exists.")
    user = UserService.create_user(db=session, user_in=user_in)
    return user

@router.delete("/users/{user_id}", response_model=UserSchema)
def delete_user(session: SessionDep, current_user: CurrentUser, user_id: str) -> Any:
    check_admin(current_user)
    user = session.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    session.delete(user)
    session.commit()
    return user

@router.get("/logs", response_model=List[LogAktivitasSchema])
def read_logs(session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100) -> Any:
    check_admin(current_user)
    logs = session.query(LogAktivitas).order_by(LogAktivitas.waktu.desc()).offset(skip).limit(limit).all()
    return logs
