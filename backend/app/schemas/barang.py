from pydantic import BaseModel
from typing import Optional

class BarangBase(BaseModel):
    nama_barang: str
    kategori: str
    foto: Optional[str] = None

class BarangCreate(BarangBase):
    pass

class Barang(BarangBase):
    id: str

    model_config = {"from_attributes": True}

class InventarisBase(BaseModel):
    jumlah_barang: int = 1

class InventarisCreate(InventarisBase):
    barang_id: str

class Inventaris(InventarisBase):
    id: str
    barang_id: str
    barang: Barang

    model_config = {"from_attributes": True}
