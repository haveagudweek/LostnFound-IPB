import boto3
from fastapi import UploadFile, HTTPException
import uuid
import anyio
from app.cores.config import settings

# Inisialisasi S3 client secara global agar bisa di-reuse
try:
    if settings.AWS_ENDPOINT_URL_S3:
        s3_client = boto3.client(
            's3',
            endpoint_url=settings.AWS_ENDPOINT_URL_S3,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
    else:
        s3_client = None
except Exception as e:
    s3_client = None
    print(f"Warning: Gagal menginisialisasi S3 client: {e}")

class UploadService:
    @staticmethod
    def _upload_to_s3_sync(file_bytes: bytes, filename: str, content_type: str) -> str:
        if not s3_client:
            raise HTTPException(status_code=500, detail="S3 client belum terkonfigurasi dengan benar.")
        
        try:
            # Operasi blocking menggunakan boto3
            s3_client.put_object(
                Bucket=settings.BUCKET_NAME,
                Key=filename,
                Body=file_bytes,
                ContentType=content_type,
                ACL='public-read' # Minta S3 agar file ini bisa diakses publik (pastikan setting Bucket mengizinkan)
            )
            # URL publik untuk Tigris S3 (dan sebagian besar S3-compatible)
            return f"{settings.AWS_ENDPOINT_URL_S3}/{settings.BUCKET_NAME}/{filename}"
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Gagal mengunggah file ke cloud storage: {str(e)}")

    @staticmethod
    async def upload_image(file: UploadFile) -> str:
        """
        Mengunggah gambar ke Tigris S3 secara asinkronus.
        Karena boto3 bersifat blocking, kita jalankan di thread pool (anyio).
        """
        if not settings.AWS_ENDPOINT_URL_S3 or not settings.BUCKET_NAME:
            raise HTTPException(status_code=500, detail="Konfigurasi S3 (Tigris) belum diatur di .env")
            
        try:
            # Baca bytes dari UploadFile
            file_bytes = await file.read()
            
            # Buat nama unik menggunakan UUID untuk menghindari tabrakan nama file
            ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
            unique_filename = f"uploads/{uuid.uuid4()}.{ext}"
            content_type = file.content_type or 'image/jpeg'
            
            # Lakukan proses upload sinkron di dalam threadpool
            url = await anyio.to_thread.run_sync(
                UploadService._upload_to_s3_sync,
                file_bytes,
                unique_filename,
                content_type
            )
            return url
            
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Terjadi kesalahan saat memproses gambar: {str(exc)}")
