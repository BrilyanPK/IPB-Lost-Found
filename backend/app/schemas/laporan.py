from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models import JenisLaporanEnum, StatusLaporanEnum
from .user import User
from .barang import Barang

class LaporanBase(BaseModel):
    jenis: JenisLaporanEnum
    nama_pelapor: str
    lokasi: str
    deskripsi: str
    status: StatusLaporanEnum = StatusLaporanEnum.DIBUAT

class LaporanCreate(LaporanBase):
    barang_id: Optional[str] = None # When creating report, barang might already exist, or created alongside. We simplify by passing barang_id if known.

class Laporan(LaporanBase):
    id: str
    user_id: str
    barang_id: Optional[str] = None
    waktu_pelaporan: datetime
    
    user: Optional[User] = None
    barang: Optional[Barang] = None

    model_config = {"from_attributes": True}
