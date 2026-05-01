from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from app.api.deps import SessionDep, CurrentUser
from app.schemas.user import User, UserCreate, Token
from app.services.user_service import UserService
from app.core.security import create_access_token

router = APIRouter()

from app.models import LogAktivitas
from fastapi import Request

@router.post("/login", response_model=Token)
def login_access_token(
    request: Request,
    session: SessionDep, 
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    user = UserService.authenticate(
        db=session, email=form_data.username, password=form_data.password
    )
    
    # Record Log
    log = LogAktivitas(
        user_id=user.id if user else None,
        aksi="LOGIN",
        ip_address=request.client.host,
        status="SUCCESS" if user else "FAILED"
    )
    session.add(log)
    session.commit()

    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    return {
        "access_token": create_access_token(user.id),
        "token_type": "bearer",
    }

@router.post("/register", response_model=User)
def register_user(
    *, request: Request, session: SessionDep, user_in: UserCreate
) -> Any:
    user = UserService.get_user_by_email(db=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = UserService.create_user(db=session, user_in=user_in)
    
    # Record Log
    log = LogAktivitas(
        user_id=user.id,
        aksi="REGISTER",
        ip_address=request.client.host,
        status="SUCCESS"
    )
    session.add(log)
    session.commit()
    
    return user

@router.post("/test-token", response_model=User)
def test_token(current_user: CurrentUser) -> Any:
    """
    Test access token
    """
    return current_user
