from fastapi import FastAPI

# Inisialisasi aplikasi FastAPI
app = FastAPI(
    title="LostnFound-IPB API",
    description="API untuk sistem pelaporan kehilangan dan penemuan barang di IPB",
    version="1.0.0"
)

# Route dasar untuk testing
@app.get("/")
async def root():
    return {"message": "Selamat datang di LostnFound-IPB API"}

# Contoh route untuk laporan kehilangan (akan dikembangkan nanti)
@app.get("/reports")
async def get_reports():
    return {"reports": []}  # Placeholder, nanti ambil dari database

# Jika Anda ingin menjalankan server langsung dari file ini
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)