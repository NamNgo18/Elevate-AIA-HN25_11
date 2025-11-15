import smtplib
import ssl
import os
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER")             # Server SMTP của Gmail
SMTP_PORT = os.getenv("SMTP_PORT")                 # Port cho kết nối SSL
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")     # Mật khẩu ứng dụng (App Password)

def send_email_with_smtp(receiver_email, subject, body_content):
    """
    Hàm gửi email sử dụng smtplib qua SMTP của Gmail (SSL).
    """
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = SENDER_EMAIL
    msg['To'] = receiver_email
    msg.set_content(body_content)

    context = ssl.create_default_context()

    try:
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, context=context) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            
            server.send_message(msg)
        
        print(f"Gửi email thành công tới: {receiver_email}")
        return True
    
    except Exception as e:
        print(f"Lỗi khi gửi email: {e}")
        return False
