<div align="center">
  <img src="frontend/public/assets/logo-balikin.png" alt="Balikin Logo" width="400"/>
</div>

# Balikin 🔍

**Balikin** adalah sebuah platform digital terpusat yang dirancang khusus untuk mengatasi permasalahan pelaporan dan pencarian barang hilang di lingkungan kampus Institut Pertanian Bogor (IPB). Sistem ini menggantikan metode pelaporan informal (seperti grup WhatsApp atau platform X) menjadi sistem yang lebih terstruktur, terdokumentasi, dan mudah diakses oleh seluruh civitas akademik.


## 👥 Aktor Sistem
Sistem ini dirancang dengan arsitektur peran (Role-based):
1. **Pencari (Mahasiswa/Civitas)**: Dapat membuat laporan barang hilang, melihat daftar barang hilang, dan melacak status laporannya.
2. **Petugas Keamanan (Security)**: Bertugas menginput barang yang ditemukan, memverifikasi laporan, dan memproses pengembalian barang ke pemiliknya.
3. **Admin**: Memantau seluruh sistem, mengelola pengguna (User Management), dan melihat log aktivitas sistem.

## 💻 Tech Stack
Sistem ini dibangun menggunakan arsitektur modern Client-Server:
- **Frontend**: React.js, TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python), SQLAlchemy, Pydantic, Alembic
- **Database**: PostgreSQL
- **Security**: JWT Authentication, Bcrypt Password Hashing

## 🛠️ Prasyarat (Prerequisites)
Pastikan Anda sudah menginstal aplikasi berikut sebelum menjalankan proyek:
- **Node.js** (v16 atau ke atas)
- **Python** (v3.10 atau ke atas)
- **PostgreSQL** (pastikan server berjalan di lokal Anda)

## 🚀 Cara Menjalankan Secara Lokal (Local Setup)

### 1. Setup Database
Buat database kosong di PostgreSQL Anda dengan nama `lostfound_db`.

### 2. Setup Backend
Buka terminal baru dan masuk ke folder backend:
```bash
cd backend
```
Buat Virtual Environment (opsional) dan install dependensi:
```bash
pip install -r requirements.txt
```
Sesuaikan konfigurasi database pada file `.env`:
```env
DATABASE_URL=postgresql+psycopg://username:password@localhost/lostfound_db
SECRET_KEY=secretkey_anda_disini
```
Jalankan skrip *Seed* untuk membuat tabel dan data awal (Admin, Petugas, Pencari):
```bash
python seed.py
```
Jalankan Server Backend:
```bash
uvicorn app.main:app --reload
```
*Backend akan berjalan di: `http://localhost:8000`*

### 3. Setup Frontend
Buka terminal baru dan masuk ke folder frontend:
```bash
cd frontend
```
Install package NPM:
```bash
npm install
```
Jalankan Server Frontend:
```bash
npm run dev
```
*Frontend akan berjalan di: `http://localhost:5173`*

## 📂 Struktur Direktori Utama
```
IPB-Lost-Found/
├── backend/                  # RESTful API (FastAPI)
│   ├── app/
│   │   ├── api/              # Endpoint Routes
│   │   ├── core/             # Konfigurasi & Keamanan
│   │   ├── models/           # Skema Database (SQLAlchemy)
│   │   ├── schemas/          # Validasi Request/Response (Pydantic)
│   │   └── services/         # Logika Bisnis
│   ├── alembic/              # Database Migrations
│   └── seed.py               # Skrip Seeder awal database
│
└── frontend/                 # UI/UX (React.js)
    ├── public/               # Assets
    └── src/
        ├── api/              # Konfigurasi Axios
        ├── components/       # Reusable Components (Card, Input, Navbar, dll)
        └── pages/            # Halaman Role (Admin, Petugas, Pencari)
```
