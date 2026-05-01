from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api.deps import SessionDep, CurrentUser
from app.models import Laporan, JenisLaporanEnum, Barang
from app.schemas.laporan import Laporan as LaporanSchema, LaporanCreate
from app.schemas.barang import BarangCreate

router = APIRouter()

@router.post("/laporan-kehilangan", response_model=LaporanSchema)
def buat_laporan_kehilangan(session: SessionDep, current_user: CurrentUser, barang_in: BarangCreate, laporan_in: LaporanCreate) -> Any:
    # Pencari creates a report. They define the item they lost.
    db_barang = Barang(
        nama_barang=barang_in.nama_barang,
        kategori=barang_in.kategori,
        foto=barang_in.foto
    )
    session.add(db_barang)
    session.flush()

    db_laporan = Laporan(
        user_id=current_user.id,
        barang_id=db_barang.id,
        jenis=JenisLaporanEnum.KEHILANGAN,
        nama_pelapor=laporan_in.nama_pelapor,
        lokasi=laporan_in.lokasi,
        deskripsi=laporan_in.deskripsi
    )
    session.add(db_laporan)
    session.commit()
    session.refresh(db_laporan)
    return db_laporan

@router.get("/laporan-kehilangan", response_model=List[LaporanSchema])
def daftar_laporan_kehilangan(
    session: SessionDep, 
    current_user: CurrentUser, 
    skip: int = 0, 
    limit: int = 100,
    kategori: Optional[str] = Query(None)
) -> Any:
    query = session.query(Laporan).filter(Laporan.jenis == JenisLaporanEnum.KEHILANGAN)
    
    if kategori:
        query = query.join(Barang).filter(Barang.kategori == kategori)
        
    laporan = query.offset(skip).limit(limit).all()
    return laporan

@router.get("/laporanku", response_model=List[LaporanSchema])
def daftar_laporanku(session: SessionDep, current_user: CurrentUser) -> Any:
    laporan = session.query(Laporan).filter(Laporan.user_id == current_user.id).all()
    return laporan
