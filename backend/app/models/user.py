from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
from app.models.base import Base
import enum

class UserRole(str, enum.Enum):
    admin = "admin"
    civitas = "civitas"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String(255), nullable=False)
    email_ipb = Column(String(255), unique=True, index=True, nullable=False)
    nomor_telepon = Column(String(20), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.civitas, nullable=False)

    laporans = relationship("Laporan", back_populates="pelapor", cascade="all, delete-orphan")
    klaims = relationship("Klaim", back_populates="pengklaim", cascade="all, delete-orphan")
    notifikasis = relationship("Notifikasi", back_populates="user", cascade="all, delete-orphan")
