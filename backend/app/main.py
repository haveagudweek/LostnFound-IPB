from fastapi import FastAPI
from app.cores.database import engine
from app.models.base import Base
# Import all models here to ensure they are registered with Base before create_all
from app.models import user
from app.api import auth

# Buat tabel di database jika belum ada
Base.metadata.create_all(bind=engine)

# Inisialisasi aplikasi FastAPI
app = FastAPI(
    title="LostnFound-IPB API",
    description="API untuk sistem pelaporan kehilangan dan penemuan barang di IPB",
    version="1.0.0"
)

# Registrasi router
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

# Route dasar untuk testing
@app.get("/")
async def root():
    return {"message": "Selamat datang di LostnFound-IPB API"}

# Jika Anda ingin menjalankan server langsung dari file ini
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)