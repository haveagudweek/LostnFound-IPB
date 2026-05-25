from fastapi import APIRouter, Depends

from app.dependencies import get_auth_service
from app.schemas import LoginRequest, RegisterRequest, UserResponse
from app.services.auth_service import AuthService


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=UserResponse)
def login(payload: LoginRequest, service: AuthService = Depends(get_auth_service)) -> UserResponse:
    return service.login(payload)


@router.post("/register", response_model=UserResponse)
def register(payload: RegisterRequest, service: AuthService = Depends(get_auth_service)) -> UserResponse:
    return service.register(payload)
