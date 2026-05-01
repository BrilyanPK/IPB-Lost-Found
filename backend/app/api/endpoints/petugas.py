from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import SessionDep, CurrentUser
from app.models import User, RoleEnum, Laporan, Barang, Inventaris, JenisLaporanEnum, StatusLaporanEnum
from app.schemas.laporan import Laporan as LaporanSchema, LaporanCreate
from app.schemas.barang import BarangCreate

router = APIRouter()

def check_petugas_or_admin(current_user: User):
    if current_user.role not in [RoleEnum.PETUGAS, RoleEnum.ADMIN]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

@router.get("/dashboard", response_model=dict)
def get_dashboard_stats(session: SessionDep, current_user: CurrentUser) -> Any:
    check_petugas_or_admin(current_user)
    total_inventory = session.query(Inventaris).count()
    # Simple count for now, real implementation would filter by today's date
    laporan_baru = session.query(Laporan).filter(Laporan.status == StatusLaporanEnum.DIBUAT).count()
    return {
        "total_barang_inventory": total_inventory,
        "laporan_baru_hari_ini": laporan_baru
    }

@router.post("/temuan", response_model=LaporanSchema)
def input_temuan(session: SessionDep, current_user: CurrentUser, barang_in: BarangCreate, laporan_in: LaporanCreate) -> Any:
    check_petugas_or_admin(current_user)
    
    # Create Barang
    db_barang = Barang(
        nama_barang=barang_in.nama_barang,
        kategori=barang_in.kategori,
        foto=barang_in.foto
    )
    session.add(db_barang)
    session.flush() # get db_barang.id
    
    # Add to Inventory
    db_inventaris = Inventaris(barang_id=db_barang.id, jumlah_barang=1)
    session.add(db_inventaris)

    # Create Laporan Penemuan
    db_laporan = Laporan(
        user_id=current_user.id,
        barang_id=db_barang.id,
        jenis=JenisLaporanEnum.PENEMUAN,
        nama_pelapor=laporan_in.nama_pelapor,
        lokasi=laporan_in.lokasi,
        deskripsi=laporan_in.deskripsi,
        status=StatusLaporanEnum.SELESAI # Auto finish if officer puts it in inventory
    )
    session.add(db_laporan)
    session.commit()
    session.refresh(db_laporan)
    return db_laporan

@router.get("/laporan", response_model=List[LaporanSchema])
def get_semua_laporan(session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100) -> Any:
    check_petugas_or_admin(current_user)
    laporan = session.query(Laporan).offset(skip).limit(limit).all()
    return laporan

@router.put("/laporan/{laporan_id}/status", response_model=LaporanSchema)
def update_status_laporan(session: SessionDep, current_user: CurrentUser, laporan_id: str, status: StatusLaporanEnum) -> Any:
    check_petugas_or_admin(current_user)
    laporan = session.query(Laporan).filter(Laporan.id == laporan_id).first()
    if not laporan:
        raise HTTPException(status_code=404, detail="Laporan not found")
    laporan.status = status
    session.commit()
    session.refresh(laporan)
    return laporan
