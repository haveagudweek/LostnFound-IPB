from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    nim: str | None = None
    role: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    nim: str
    password: str = Field(min_length=8)


class ItemResponse(BaseModel):
    id: str
    name: str
    image: str | None = None
    location: str
    time: str
    category: str
    status: Literal["found", "lost"]
    description: str | None = None
    reporterId: int | None = None


class ReportItemRequest(BaseModel):
    name: str
    image: str | None = None
    location: str
    time: str
    category: str
    description: str | None = None
    reporterId: int | None = None


class VerificationReportResponse(BaseModel):
    id: str
    itemId: str
    name: str
    reporterName: str
    image: str | None = None
    location: str
    detailLocation: str | None = None
    time: str
    reportTime: str
    category: str
    tag: str
    reportType: Literal["found", "lost"]
    status: str
    description: str | None = None
    reporterId: int | None = None


class ClaimResponse(BaseModel):
    id: str
    itemId: str
    reportId: str
    itemName: str
    image: str | None = None
    ownerName: str
    nim: str
    faculty: str
    contact: str
    location: str
    foundDate: str
    foundTime: str
    claimDate: str
    status: str
    evidenceAttached: bool
    description: str | None = None
    adminNote: str | None = None
    history: str | None = None


class ClaimCreateRequest(BaseModel):
    itemId: str
    ownerName: str
    nim: str
    faculty: str | None = None
    contact: str | None = None
    description: str
    evidenceImage: str | None = None


class VerifyActionRequest(BaseModel):
    action: Literal["approve", "reject"]


class ContactMessageRequest(BaseModel):
    message: str


class ContactMessageResponse(BaseModel):
    id: int
    itemId: str
    message: str
    status: str
