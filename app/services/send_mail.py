import smtplib
import ssl
import os
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

def send_email_with_smtp(receiver_email, subject, body_content):
    """
    Hàm gửi email sử dụng smtplib. Tự động chọn SSL hoặc STARTTLS dựa trên port.
    """
    load_dotenv()
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 465))
    sender_email = os.getenv("SENDER_EMAIL")
    sender_password = os.getenv("SENDER_PASSWORD")

    if not sender_email or not sender_password:
        print("Lỗi: SENDER_EMAIL hoặc SENDER_PASSWORD chưa được cấu hình trong .env")
        return False

    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg.set_content(body_content)

    try:
        print(f"Đang kết nối tới {smtp_server}:{smtp_port}...")
        
        # Sử dụng SSL cho port 465
        if smtp_port == 465:
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(smtp_server, smtp_port, context=context) as server:
                server.login(sender_email, sender_password)
                server.send_message(msg)
        # Sử dụng STARTTLS cho các port khác (thường là 587)
        else:
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.ehlo()
                if smtp_port == 587:
                    context = ssl.create_default_context()
                    server.starttls(context=context)
                    server.ehlo()
                server.login(sender_email, sender_password)
                server.send_message(msg)
        
        print(f"Gửi email thành công tới: {receiver_email}")
        return True
    
    except Exception as e:
        print(f"Lỗi khi gửi email: {e}")
        import traceback
        traceback.print_exc()
        return False
