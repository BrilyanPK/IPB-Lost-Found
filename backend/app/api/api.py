from fastapi import APIRouter
from app.api.endpoints import auth, admin, petugas, pencari

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(petugas.router, prefix="/petugas", tags=["petugas"])
api_router.include_router(pencari.router, prefix="/pencari", tags=["pencari"])
