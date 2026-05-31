from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Any
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr
import secrets
import os

from app.cores.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserLogin, UserLoginResponse
from app.utils.security import get_password_hash, verify_password, create_access_token
from app.api.deps import get_current_user
from app.services.email_service import EmailService

router = APIRouter()

# Durasi kedaluwarsa token verifikasi (24 jam)
VERIFICATION_TOKEN_EXPIRE_HOURS = 24


class ResendVerificationRequest(BaseModel):
    email: EmailStr


def _generate_and_send_verification(user: User, background_tasks: BackgroundTasks, db: Session):
    """Helper: generate token baru, simpan ke DB, kirim email verifikasi."""
    new_token = secrets.token_urlsafe(32)
    user.verification_token = new_token
    user.verification_token_created_at = datetime.utcnow()
    db.commit()

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    verification_link = f"{frontend_url}/verify-email?token={new_token}"

    background_tasks.add_task(
        EmailService.send_verification_email,
        target_email=user.email,
        user_name=user.name,
        verification_link=verification_link,
    )


@router.post("/register", response_model=UserResponse)
def register_user(user_in: UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)) -> Any:
    """
    Register user baru.
    FE mengirim JSON: { name, email, nim, phone, password }
    FE mengharapkan response: { id, name, email, nim, phone, role }
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="User dengan email ini sudah terdaftar.",
        )

    # Generate token verifikasi
    verification_token = secrets.token_urlsafe(32)

    user = User(
        name=user_in.name,
        email=user_in.email,
        nim=user_in.nim,
        phone=user_in.phone,
        password_hash=get_password_hash(user_in.password),
        is_verified=False,
        verification_token=verification_token,
        verification_token_created_at=datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Kirim email verifikasi di background
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    verification_link = f"{frontend_url}/verify-email?token={verification_token}"

    background_tasks.add_task(
        EmailService.send_verification_email,
        target_email=user.email,
        user_name=user.name,
        verification_link=verification_link,
    )

    return user


@router.post("/login", response_model=UserLoginResponse)
def login_user(login_data: UserLogin, db: Session = Depends(get_db)) -> Any:
    """
    Login user.
    FE mengirim JSON: { email, password }
    FE mengharapkan response: { id, name, email, nim, phone, role, token }
    (FE menyimpan seluruh objek ini ke authStore via login(user))
    """
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Email atau password salah")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Email Anda belum diverifikasi. Silakan cek kotak masuk email Anda.")

    access_token = create_access_token(data={"sub": user.email})

    return UserLoginResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        nim=user.nim,
        phone=user.phone,
        role=user.role,
        is_verified=user.is_verified,
        token=access_token,
    )


@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    """
    Endpoint untuk verifikasi email berdasarkan token.
    Dipanggil dari frontend /verify-email?token=xyz
    """
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Token verifikasi tidak valid atau sudah kedaluwarsa.")

    # Cek apakah token sudah melewati batas waktu 24 jam
    if user.verification_token_created_at:
        token_age = datetime.utcnow() - user.verification_token_created_at
        if token_age > timedelta(hours=VERIFICATION_TOKEN_EXPIRE_HOURS):
            raise HTTPException(
                status_code=400,
                detail="Token verifikasi sudah kedaluwarsa. Silakan minta kirim ulang email verifikasi.",
            )

    user.is_verified = True
    user.verification_token = None
    user.verification_token_created_at = None

    db.commit()
    return {"status": "success", "message": "Email berhasil diverifikasi. Anda sekarang dapat login."}


@router.post("/resend-verification")
def resend_verification(
    body: ResendVerificationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Kirim ulang email verifikasi.
    FE mengirim JSON: { email }
    Cooldown 60 detik ditangani di sisi Frontend.
    """
    user = db.query(User).filter(User.email == body.email).first()

    # Untuk keamanan, selalu kembalikan pesan sukses agar attacker
    # tidak bisa menggunakan endpoint ini untuk enumerasi email.
    success_msg = "Jika email terdaftar dan belum diverifikasi, kami telah mengirim ulang email verifikasi."

    if not user:
        return {"status": "success", "message": success_msg}

    if user.is_verified:
        return {"status": "success", "message": success_msg}

    # Rate limit sederhana: minimal 60 detik antar pengiriman
    if user.verification_token_created_at:
        elapsed = datetime.utcnow() - user.verification_token_created_at
        if elapsed < timedelta(seconds=60):
            raise HTTPException(
                status_code=429,
                detail="Harap tunggu 60 detik sebelum meminta kirim ulang.",
            )

    _generate_and_send_verification(user, background_tasks, db)

    return {"status": "success", "message": success_msg}
