import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from dotenv import load_dotenv

load_dotenv()

# Konfigurasi Koneksi SMTP
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", "bot.seekem@gmail.com"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", ""),
    MAIL_FROM=os.getenv("MAIL_FROM", "bot.seekem@gmail.com"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 465)),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS=False,
    MAIL_SSL_TLS=True,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

class EmailService:
    @staticmethod
    async def send_contact_email(target_email: str, reporter_name: str, item_name: str, sender_name: str, sender_whatsapp: str, message: str):
        """
        Mengirim email pemberitahuan ke pelapor asli dengan template HTML profesional.
        """
        pesan_tambahan = f"<p><strong>Pesan:</strong><br>{message}</p>" if message else ""
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #1a5632; color: #ffffff; padding: 20px; text-align: center;">
                        <h2 style="margin: 0;">SEEKEM Lost and Found</h2>
                    </div>
                    <div style="padding: 20px;">
                        <p>Halo <strong>{reporter_name}</strong>,</p>
                        <p>Kabar baik! Seseorang telah menemukan barang <strong>"{item_name}"</strong> yang Anda laporkan dan ingin menghubungi Anda.</p>
                        
                        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #1a5632; margin-top: 20px; margin-bottom: 20px;">
                            <p style="margin: 0;"><strong>Nama Penghubung:</strong> {sender_name}</p>
                            <p style="margin: 5px 0 0 0;"><strong>Kontak WhatsApp:</strong> <a href="https://wa.me/{sender_whatsapp.replace('+', '')}">{sender_whatsapp}</a></p>
                        </div>
                        
                        {pesan_tambahan}
                        
                        <p>Silakan hubungi nomor WhatsApp di atas untuk mengoordinasikan pengembalian barang Anda dengan aman.</p>
                        <p>Terima kasih telah menggunakan SEEKEM IPB!</p>
                    </div>
                    <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #666;">
                        <p style="margin: 0;">&copy; 2026 SEEKEM IPB University. All rights reserved.</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        message_schema = MessageSchema(
            subject=f"[SEEKEM] Pemberitahuan Barang Ditemukan: {item_name}",
            recipients=[target_email],
            body=html_content,
            subtype=MessageType.html
        )
        
        fm = FastMail(conf)
        # Akan gagal (raise Exception) jika MAIL_PASSWORD kosong, namun kita biarkan bubble up ke HTTP 500
        await fm.send_message(message_schema)
