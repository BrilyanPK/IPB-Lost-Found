from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models import JenisLaporanEnum, StatusLaporanEnum
from .user import User

class LaporanBase(BaseModel):
    jenis: JenisLaporanEnum
    nama_pelapor: str
    lokasi: str
    deskripsi: str
    status: StatusLaporanEnum = StatusLaporanEnum.DIBUAT
    nama_barang: str
    kategori: str
    foto: Optional[str] = None

class LaporanCreate(LaporanBase):
    pass

class Laporan(LaporanBase):
    id: str
    user_id: str
    waktu_pelaporan: datetime
    
    user: Optional[User] = None

    model_config = {"from_attributes": True}
