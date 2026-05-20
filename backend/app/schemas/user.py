from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional
from app.models.user import UserRole
import re

class UserBase(BaseModel):
    nama: str
    email_ipb: EmailStr
    nomor_telepon: str

class UserCreate(UserBase):
    password: str = Field(..., max_length=72)
    role: Optional[UserRole] = UserRole.civitas

    @validator("email_ipb")
    def validate_ipb_email(cls, v):
        if not v.endswith("@apps.ipb.ac.id"):
            raise ValueError("Email harus menggunakan domain @apps.ipb.ac.id")
        return v

class UserLogin(BaseModel):
    email_ipb: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    role: UserRole

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email_ipb: Optional[str] = None
