from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Any
import secrets
import os

from app.cores.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserLogin, UserLoginResponse
from app.utils.security import get_password_hash, verify_password, create_access_token
from app.api.deps import get_current_user
from app.services.email_service import EmailService

router = APIRouter()

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
        verification_token=verification_token
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
        verification_link=verification_link
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
    
    user.is_verified = True
    user.verification_token = None
    
    db.commit()
    return {"status": "success", "message": "Email berhasil diverifikasi. Anda sekarang dapat login."}
