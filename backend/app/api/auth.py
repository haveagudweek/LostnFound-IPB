from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any
from fastapi.security import OAuth2PasswordRequestForm

from app.cores.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token
from app.utils.security import get_password_hash, verify_password, create_access_token
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)) -> Any:
    user = db.query(User).filter(User.email_ipb == user_in.email_ipb).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="User dengan email ini sudah terdaftar.",
        )
    
    user = User(
        nama=user_in.nama,
        email_ipb=user_in.email_ipb,
        nomor_telepon=user_in.nomor_telepon,
        password_hash=get_password_hash(user_in.password),
        role=user_in.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    # OAuth2PasswordRequestForm menggunakan 'username' sebagai field untuk email_ipb
    user = db.query(User).filter(User.email_ipb == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Email atau password salah")
    
    access_token = create_access_token(data={"sub": user.email_ipb})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
