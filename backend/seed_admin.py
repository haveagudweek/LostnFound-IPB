import os
import sys

# Tambahkan direktori root proyek ke sys.path agar impor app.cores dll. berfungsi
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

from app.cores.database import SessionLocal
from app.models.user import User, UserRole
from app.models.laporan import Laporan
from app.models.klaim import Klaim
from app.models.notifikasi import Notifikasi
from app.utils.security import get_password_hash

def seed_admin():
    db = SessionLocal()
    try:
        admin_email = "admin@apps.ipb.ac.id"
        user = db.query(User).filter(User.email == admin_email).first()
        if user:
            print("Admin sudah ada di database.")
            # Update password saja just in case
            user.password_hash = get_password_hash("admin123")
            db.commit()
            print("Password admin di-reset ke 'admin123'")
            return
            
        print("Membuat user admin baru...")
        admin = User(
            name="Admin SEEKEM",
            email=admin_email,
            nim="ADM001",
            phone="080000000000",
            password_hash=get_password_hash("admin123"),
            role=UserRole.admin
        )
        db.add(admin)
        db.commit()
        print("Berhasil membuat user admin!")
    except Exception as e:
        print(f"Error seeding admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
