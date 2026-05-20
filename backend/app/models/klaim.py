from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.models.base import Base

class StatusKlaim(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class Klaim(Base):
    __tablename__ = "klaim"

    id = Column(Integer, primary_key=True, index=True)
    laporan_id = Column(Integer, ForeignKey("laporan.id"), nullable=False)
    pengklaim_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    tanggal_klaim = Column(DateTime, default=datetime.utcnow, nullable=False)
    alasan_klaim = Column(Text, nullable=False)
    bukti_foto_url = Column(String(500), nullable=True) # URL string dari Supabase/pihak ketiga
    
    status_klaim = Column(Enum(StatusKlaim), default=StatusKlaim.pending, nullable=False)
    
    # Relationships
    laporan = relationship("Laporan", back_populates="klaims")
    pengklaim = relationship("User", back_populates="klaims")
