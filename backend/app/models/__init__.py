import uuid
from sqlalchemy import Column, String, Enum, DateTime, ForeignKey, Text, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
import enum


class RoleEnum(str, enum.Enum):
    PENCARI = "Pencari"
    PETUGAS = "Petugas"
    ADMIN = "Admin"


class ReportTypeEnum(str, enum.Enum):
    KEHILANGAN = "Kehilangan"
    PENEMUAN = "Penemuan"


class ReportStatusEnum(str, enum.Enum):
    HILANG = "Hilang"
    DITEMUKAN = "Ditemukan"
    DIPROSES = "Diproses"
    DIKEMBALIKAN = "Dikembalikan"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(RoleEnum), default=RoleEnum.PENCARI)
    created_at = Column(DateTime, default=datetime.utcnow)

    reports = relationship("Report", back_populates="user")
    activity_logs = relationship("ActivityLog", back_populates="user")


class Item(Base):
    __tablename__ = "items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, index=True)
    category = Column(String, index=True)
    photo_url = Column(String, nullable=True)

    reports = relationship("Report", back_populates="item")
    inventory = relationship("Inventory", back_populates="item", uselist=False)


class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    type = Column(Enum(ReportTypeEnum))
    user_id = Column(String(36), ForeignKey("users.id"))
    item_id = Column(String(36), ForeignKey("items.id"))
    report_time = Column(DateTime, default=datetime.utcnow)
    location = Column(String)
    description = Column(Text)
    receiver_name = Column(String, nullable=True)
    status = Column(Enum(ReportStatusEnum), default=ReportStatusEnum.HILANG)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reports")
    item = relationship("Item", back_populates="reports")


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    item_id = Column(String(36), ForeignKey("items.id"), unique=True)
    quantity = Column(Integer, default=1)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    item = relationship("Item", back_populates="inventory")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    action = Column(String)
    target_detail = Column(String)
    ip_address = Column(String, nullable=True)
    status = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="activity_logs")
