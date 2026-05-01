from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api.deps import SessionDep, CurrentUser
from app.models import Laporan, JenisLaporanEnum
from app.schemas.laporan import Laporan as LaporanSchema, LaporanCreate

router = APIRouter()

@router.post("/laporan-kehilangan", response_model=LaporanSchema)
def buat_laporan_kehilangan(session: SessionDep, current_user: CurrentUser, laporan_in: LaporanCreate) -> Any:
    db_laporan = Laporan(
        user_id=current_user.id,
        jenis=JenisLaporanEnum.KEHILANGAN,
        nama_pelapor=laporan_in.nama_pelapor,
        lokasi=laporan_in.lokasi,
        deskripsi=laporan_in.deskripsi,
        nama_barang=laporan_in.nama_barang,
        kategori=laporan_in.kategori,
        foto=laporan_in.foto
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
        query = query.filter(Laporan.kategori == kategori)
        
    laporan = query.offset(skip).limit(limit).all()
    return laporan

@router.get("/laporanku", response_model=List[LaporanSchema])
def daftar_laporanku(session: SessionDep, current_user: CurrentUser) -> Any:
    laporan = session.query(Laporan).filter(Laporan.user_id == current_user.id).all()
    return laporan
