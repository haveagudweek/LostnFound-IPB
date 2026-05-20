import os
from dotenv import load_dotenv

# Load .env file (asumsi .env ada di root project atau backend)
# Kita cari ke direktori parent
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
else:
    load_dotenv() # Fallback ke direktori saat ini

class Settings:
    PROJECT_NAME: str = "LostnFound-IPB API"
    VERSION: str = "1.0.0"
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/lostnfound")
    # Mengambil dari JWT_SECRET_KEY, fallback ke SECRET_KEY bawaan jika kosong
    SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your_secret_key_here")
    ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Konfigurasi S3 (Tigris / Railway)
    AWS_ENDPOINT_URL_S3: str = os.getenv("AWS_ENDPOINT_URL_S3", "")
    AWS_REGION: str = os.getenv("AWS_REGION", "auto")
    BUCKET_NAME: str = os.getenv("BUCKET_NAME", "")
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")

settings = Settings()
