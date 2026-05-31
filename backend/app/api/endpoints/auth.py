from fastapi import APIRouter, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from app.api.deps import SessionDep, CurrentUser
from app.schemas.user import UserCreate, UserResponse, Token, UserUpdate
from app.services.user_service import UserService

router = APIRouter()


@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, session: SessionDep):
    return UserService.register(session, user_data)


@router.post("/login", response_model=Token)
def login(
    request: Request,
    session: SessionDep,
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    return UserService.login(
        session, form_data.username, form_data.password, request.client.host
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: CurrentUser):
    return current_user

@router.patch("/me", response_model=UserResponse)
def update_me(
    user_data: UserUpdate, 
    session: SessionDep, 
    current_user: CurrentUser
):
    return UserService.update_me(session, user_data, current_user)
