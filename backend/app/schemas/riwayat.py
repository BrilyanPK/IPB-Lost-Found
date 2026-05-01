from pydantic import BaseModel
from datetime import datetime

class RiwayatPenyerahanBase(BaseModel):
    nama_barang: str
    penerima: str

class RiwayatPenyerahanCreate(RiwayatPenyerahanBase):
    laporan_id: str

class RiwayatPenyerahan(RiwayatPenyerahanBase):
    id: str
    laporan_id: str
    petugas_id: str
    tanggal_selesai: datetime

    model_config = {"from_attributes": True}
