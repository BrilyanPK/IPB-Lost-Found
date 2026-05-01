import logging
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models import User, RoleEnum, Laporan, RiwayatPenyerahan, JenisLaporanEnum, StatusLaporanEnum
from app.core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db(db: Session) -> None:
    # Check if admin exists
    admin = db.query(User).filter(User.email == "admin@ipb.ac.id").first()
    if not admin:
        logger.info("Creating admin user...")
        admin = User(
            email="admin@ipb.ac.id",
            full_name="Super Admin",
            hashed_password=get_password_hash("admin123"),
            role=RoleEnum.ADMIN
        )
        db.add(admin)
    
    # Check if petugas exists
    petugas = db.query(User).filter(User.email == "petugas@ipb.ac.id").first()
    if not petugas:
        logger.info("Creating petugas user...")
        petugas = User(
            email="petugas@ipb.ac.id",
            full_name="Petugas Keamanan",
            hashed_password=get_password_hash("petugas123"),
            role=RoleEnum.PETUGAS
        )
        db.add(petugas)

    # Check if pencari exists
    pencari = db.query(User).filter(User.email == "pencari@ipb.ac.id").first()
    if not pencari:
        logger.info("Creating pencari user...")
        pencari = User(
            email="pencari@ipb.ac.id",
            full_name="Mahasiswa Pencari",
            hashed_password=get_password_hash("pencari123"),
            role=RoleEnum.PENCARI
        )
        db.add(pencari)
        
    db.commit()
    db.refresh(admin)
    db.refresh(petugas)
    db.refresh(pencari)

    # Seed initial reports if not exists
    if db.query(Laporan).count() == 0:
        logger.info("Seeding reports...")
        # 1. Pencari kehilangan dompet
        l1 = Laporan(
            user_id=pencari.id,
            jenis=JenisLaporanEnum.KEHILANGAN,
            nama_pelapor="Mahasiswa Pencari",
            lokasi="Kantin Stekpi",
            deskripsi="Dompet kulit warna hitam berisi KTM dan Uang.",
            status=StatusLaporanEnum.DIBUAT,
            nama_barang="Dompet Hitam",
            kategori="Aksesoris",
            foto=None
        )
        db.add(l1)

        # 2. Petugas menemukan HP
        l2 = Laporan(
            user_id=petugas.id,
            jenis=JenisLaporanEnum.PENEMUAN,
            nama_pelapor="Petugas Keamanan",
            lokasi="Gedung Kuliah Umum",
            deskripsi="Ditemukan tergeletak di kursi taman.",
            status=StatusLaporanEnum.SELESAI, # because it's already in inventory theoretically, but we use status SELESAI for found items currently held. Or maybe 'DIPROSES'. Let's say SELESAI means it has been claimed. We'll use DIPROSES to mean found but not yet claimed. Actually, previously we set SELESAI. We'll stick to SELESAI.
            nama_barang="iPhone 13",
            kategori="Elektronik",
            foto=None
        )
        db.add(l2)
        db.commit()
        db.refresh(l2)

        # Create RiwayatPenyerahan to show history
        riwayat = RiwayatPenyerahan(
            laporan_id=l2.id,
            petugas_id=petugas.id,
            nama_barang="iPhone 13",
            penerima="Ahmad (Pemilik)"
        )
        db.add(riwayat)
        db.commit()

def main() -> None:
    logger.info("Creating initial data")
    db = SessionLocal()
    init_db(db)
    logger.info("Initial data created")

if __name__ == "__main__":
    main()
