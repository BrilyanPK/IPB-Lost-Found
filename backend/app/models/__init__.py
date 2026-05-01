import uuid
from sqlalchemy import Column, String, Enum, DateTime, ForeignKey, Text, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
import enum

class RoleEnum(str, enum.Enum):
    ADMIN = "admin"
    PETUGAS = "petugas"
    PENCARI = "pencari"

class StatusLaporanEnum(str, enum.Enum):
    DIBUAT = "dibuat"
    DIPROSES = "diproses"
    SELESAI = "selesai"

class JenisLaporanEnum(str, enum.Enum):
    KEHILANGAN = "kehilangan"
    PENEMUAN = "penemuan"

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(RoleEnum), default=RoleEnum.PENCARI)

    # Relationships
    laporan = relationship("Laporan", back_populates="user")
    log_aktivitas = relationship("LogAktivitas", back_populates="user")

class Barang(Base):
    __tablename__ = "barang"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nama_barang = Column(String, index=True)
    kategori = Column(String)
    foto = Column(String, nullable=True) # URL to photo

    # Relationships
    laporan = relationship("Laporan", back_populates="barang")
    inventaris = relationship("Inventaris", back_populates="barang", uselist=False)

class Laporan(Base):
    __tablename__ = "laporan"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    barang_id = Column(String(36), ForeignKey("barang.id"))
    
    jenis = Column(Enum(JenisLaporanEnum))
    nama_pelapor = Column(String)
    waktu_pelaporan = Column(DateTime, default=datetime.utcnow)
    lokasi = Column(String)
    deskripsi = Column(Text)
    status = Column(Enum(StatusLaporanEnum), default=StatusLaporanEnum.DIBUAT)

    # Relationships
    user = relationship("User", back_populates="laporan")
    barang = relationship("Barang", back_populates="laporan")

class Inventaris(Base):
    __tablename__ = "inventaris"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    barang_id = Column(String(36), ForeignKey("barang.id"), unique=True)
    jumlah_barang = Column(Integer, default=1)

    # Relationships
    barang = relationship("Barang", back_populates="inventaris")

class LogAktivitas(Base):
    __tablename__ = "log_aktivitas"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    waktu = Column(DateTime, default=datetime.utcnow)
    aksi = Column(String)
    ip_address = Column(String)
    status = Column(String)

    # Relationships
    user = relationship("User", back_populates="log_aktivitas")
