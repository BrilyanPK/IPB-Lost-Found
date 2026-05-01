from pydantic import BaseModel
from datetime import datetime

class LogAktivitasBase(BaseModel):
    aksi: str
    ip_address: str
    status: str

class LogAktivitasCreate(LogAktivitasBase):
    user_id: str

class LogAktivitas(LogAktivitasBase):
    id: str
    user_id: str
    waktu: datetime

    model_config = {"from_attributes": True}
