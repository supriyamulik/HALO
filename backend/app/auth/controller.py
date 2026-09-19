from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.auth.model import User
from app.auth.repository import get_session
from app.auth.schema import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.auth.service import authenticate_user, create_access_token, register_user
from app.core.security import get_current_user, require_role

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, session: Session = Depends(get_session)) -> User:
    return register_user(session, req)


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, session: Session = Depends(get_session)) -> TokenResponse:
    user = authenticate_user(session, req.email, req.password)
    access_token = create_access_token(data={"sub": user.email, "role": user.role.value})
    return TokenResponse(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.get("/admin-only")
def admin_only(current_user: User = Depends(require_role("ADMIN"))):
    return {"message": "admin access granted"}
