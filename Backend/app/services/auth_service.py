from fastapi import HTTPException, status

from app.models import User
from app.repositories.user_repository import UserRepository
from app.schemas import LoginRequest, RegisterRequest, UserResponse
from app.services.mappers import ResponseMapper
from app.services.password_service import PasswordService


class AuthService:
    def __init__(self, user_repository: UserRepository, password_service: PasswordService) -> None:
        self.user_repository = user_repository
        self.password_service = password_service

    def login(self, payload: LoginRequest) -> UserResponse:
        user = self.user_repository.get_by_email(payload.email)
        if not user or not self.password_service.verify_password(payload.password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email atau password salah.")

        return ResponseMapper.user(user)

    def register(self, payload: RegisterRequest) -> UserResponse:
        if not payload.email.endswith("@apps.ipb.ac.id"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Gunakan email institusi IPB (@apps.ipb.ac.id).",
            )

        if self.user_repository.get_by_email(payload.email):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email sudah terdaftar.")

        user = User(
            name=payload.name,
            email=payload.email,
            nim=payload.nim,
            password_hash=self.password_service.hash_password(payload.password),
            role="user",
        )
        return ResponseMapper.user(self.user_repository.add(user))
