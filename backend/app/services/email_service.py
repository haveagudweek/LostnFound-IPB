import os
import httpx
from fastapi import HTTPException
from dotenv import load_dotenv
from jinja2 import Environment, FileSystemLoader

load_dotenv()

# Setup Jinja2 Environment (mencari folder templates di dalam app/)
current_dir = os.path.dirname(os.path.abspath(__file__))
templates_dir = os.path.join(os.path.dirname(current_dir), "templates")
env = Environment(loader=FileSystemLoader(templates_dir))

class EmailService:
    @staticmethod
    async def send_contact_email(target_email: str, reporter_name: str, item_name: str, sender_name: str, sender_whatsapp: str, message: str, item_type: str = "hilang"):
        api_key = os.getenv("BREVO_API_KEY")
        if not api_key:
            print("ERROR: BREVO_API_KEY tidak ditemukan di environment.")
            raise HTTPException(status_code=500, detail="Konfigurasi email (Brevo) belum diatur di server.")

        url = "https://api.brevo.com/v3/smtp/email"
        
        headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "api-key": api_key
        }
        
        # Konteks dinamis berdasarkan tipe laporan
        if item_type == "hilang":
            konteks = f"Seseorang mungkin telah menemukan barang Anda (<strong>{item_name}</strong>)."
        else:
            konteks = f"Seseorang mengklaim sebagai pemilik barang temuan Anda (<strong>{item_name}</strong>)."

        # HTML Sederhana dengan blockquote untuk pesan_koordinasi (message)
        pesan_html = f"<blockquote style='border-left: 4px solid #1a5632; padding-left: 15px; margin-left: 0; background: #f9f9f9; padding: 15px;'>{message}</blockquote>" if message else "<p><em>Tidak ada pesan khusus dari pengirim.</em></p>"

        # Render HTML menggunakan Jinja2
        template = env.get_template("email_template.html")
        html_content = template.render(
            reporter_name=reporter_name,
            konteks=konteks,
            sender_name=sender_name,
            pesan_html=pesan_html,
            sender_whatsapp=sender_whatsapp.replace('+', '')
        )

        payload = {
            "sender": {
                "name": "Admin SEEKEM", 
                "email": "bot.seekem@gmail.com"
            },
            "to": [
                {"email": target_email}
            ],
            "subject": "Notifikasi Klaim Barang - SEEKEM IPB",
            "htmlContent": html_content
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, headers=headers, json=payload, timeout=15.0)
                if response.status_code not in (200, 201):
                    print(f"BREVO API ERROR [{response.status_code}]: {response.text}")
                    raise HTTPException(status_code=500, detail="Gagal mengirim email via Brevo.")
            except httpx.RequestError as e:
                print(f"HTTPX NETWORK ERROR: {str(e)}")
                raise HTTPException(status_code=500, detail="Terjadi kesalahan jaringan saat mencoba mengirim email.")
