from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import SessionDep, CurrentUser
from app.models import User, RoleEnum, Laporan, RiwayatPenyerahan, JenisLaporanEnum, StatusLaporanEnum
from app.schemas.laporan import Laporan as LaporanSchema, LaporanCreate
from app.schemas.riwayat import RiwayatPenyerahan as RiwayatSchema, RiwayatPenyerahanCreate

router = APIRouter()

def check_petugas_or_admin(current_user: User):
    if current_user.role not in [RoleEnum.PETUGAS, RoleEnum.ADMIN]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

@router.get("/dashboard", response_model=dict)
def get_dashboard_stats(session: SessionDep, current_user: CurrentUser) -> Any:
    check_petugas_or_admin(current_user)
    total_inventory = session.query(Laporan).filter(Laporan.jenis == JenisLaporanEnum.PENEMUAN).count()
    laporan_baru = session.query(Laporan).filter(Laporan.status == StatusLaporanEnum.DIBUAT).count()
    
    # Aktivitas terbaru (5 laporan penemuan terbaru)
    aktivitas_terbaru = session.query(Laporan).order_by(Laporan.waktu_pelaporan.desc()).limit(5).all()
    
    return {
        "total_barang_inventory": total_inventory,
        "laporan_baru_hari_ini": laporan_baru,
        "aktivitas_terbaru": aktivitas_terbaru
    }

@router.get("/laporan/{laporan_id}", response_model=LaporanSchema)
def baca_laporan_detail(
    laporan_id: str,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    check_petugas_or_admin(current_user)
    laporan = session.query(Laporan).filter(Laporan.id == laporan_id).first()
    if not laporan:
        raise HTTPException(status_code=404, detail="Laporan not found")
    return laporan

@router.post("/temuan", response_model=LaporanSchema)
def input_temuan(session: SessionDep, current_user: CurrentUser, laporan_in: LaporanCreate) -> Any:
    check_petugas_or_admin(current_user)
    
    db_laporan = Laporan(
        user_id=current_user.id,
        jenis=JenisLaporanEnum.PENEMUAN,
        nama_pelapor=laporan_in.nama_pelapor,
        lokasi=laporan_in.lokasi,
        deskripsi=laporan_in.deskripsi,
        status=StatusLaporanEnum.SELESAI, # Auto finish if officer puts it in inventory
        nama_barang=laporan_in.nama_barang,
        kategori=laporan_in.kategori,
        foto=laporan_in.foto
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

@router.post("/riwayat-penyerahan", response_model=RiwayatSchema)
def buat_riwayat_penyerahan(session: SessionDep, current_user: CurrentUser, riwayat_in: RiwayatPenyerahanCreate) -> Any:
    check_petugas_or_admin(current_user)
    laporan = session.query(Laporan).filter(Laporan.id == riwayat_in.laporan_id).first()
    if not laporan:
        raise HTTPException(status_code=404, detail="Laporan not found")
        
    db_riwayat = RiwayatPenyerahan(
        laporan_id=riwayat_in.laporan_id,
        petugas_id=current_user.id,
        nama_barang=riwayat_in.nama_barang,
        penerima=riwayat_in.penerima
    )
    session.add(db_riwayat)
    
    # Update status laporan
    laporan.status = StatusLaporanEnum.SELESAI
    
    session.commit()
    session.refresh(db_riwayat)
    return db_riwayat

@router.get("/riwayat-penyerahan", response_model=List[RiwayatSchema])
def get_riwayat_penyerahan(session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100) -> Any:
    check_petugas_or_admin(current_user)
    riwayat = session.query(RiwayatPenyerahan).offset(skip).limit(limit).all()
    return riwayat
