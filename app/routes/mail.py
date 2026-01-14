from fastapi import APIRouter
from fastapi.middleware.cors import CORSMiddleware # Cần thiết cho việc giao tiếp với React
from app.services.send_mail import send_email_with_smtp
from app.services.scan_cv_jd import find_infor_cv_jd
import os
from typing import List, Dict, Any

router = APIRouter()

@router.post("/send_confirmation")
def api_send_email(receiver, cv_id, jd_id, lang: str = "vi"):
    infor_cv_jd = find_infor_cv_jd(jd_id, cv_id)
    
    translations = {
        "en": {
            "subject": f"Interview Invitation - Position {infor_cv_jd[0]['jd_name']}",
            "greeting": f"Dear {infor_cv_jd[0]['cv_name']},",
            "body1": "After reviewing your profile and experience, we find that you are a potential candidate and very suitable for the requirements of this position.",
            "body2": "We cordially invite you to participate in an online interview to discuss in more detail your experience, skills, and potential role in our team.",
            "details_header": "Interview Details:",
            "position": "Position:",
            "format": "Format:",
            "format_val": "Online interview via Interview platform (AI by J_G)",
            "how_to_join": "How to join: Please access the following link to start the interview:",
            "closing": "If you have any questions or need to reschedule, please contact us via email.",
            "footer": "We look forward to meeting and talking with you.",
            "sincerely": "Sincerely,"
        },
        "vi": {
            "subject": f"Thư mời phỏng vấn - Vị trí {infor_cv_jd[0]['jd_name']}",
            "greeting": f"Kính gửi anh/chị {infor_cv_jd[0]['cv_name']},",
            "body1": "Sau khi xem xét hồ sơ và kinh nghiệm của anh/chị, chúng tôi nhận thấy anh/chị là một ứng viên tiềm năng và rất phù hợp với yêu cầu của vị trí này.",
            "body2": "Chúng tôi trân trọng mời anh/chị tham gia buổi phỏng vấn trực tuyến để thảo luận chi tiết hơn về kinh nghiệm, kỹ năng và vai trò tiềm năng của anh/chị trong đội ngũ của chúng tôi.",
            "details_header": "Chi tiết phỏng vấn:",
            "position": "Vị trí:",
            "format": "Hình thức:",
            "format_val": "Phỏng vấn trực tuyến qua nền tảng Interview (AI của J_G)",
            "how_to_join": "Cách thức tham gia: Vui lòng truy cập vào đường link sau để bắt đầu buổi phỏng vấn:",
            "closing": "Nếu có bất kỳ câu hỏi nào hoặc cần sắp xếp lại lịch phỏng vấn, xin vui lòng liên hệ với chúng tôi qua email.",
            "footer": "Chúng tôi rất mong được gặp và trao đổi cùng anh/chị.",
            "sincerely": "Trân trọng,"
        }
    }
    
    t = translations.get(lang, translations["vi"])
    
    subject = t["subject"]
    content = f"""{t["greeting"]}
    
{t["body1"]}
    
{t["body2"]}
    
{t["details_header"]}
    - {t["position"]} {infor_cv_jd[0]['jd_name']}
    - {t["format"]} {t["format_val"]}
    - {t["how_to_join"]}
        Link: http://127.0.0.1:3000/chat?jd_id={jd_id}&cv_id={cv_id}
            
{t["closing"]}
    
{t["footer"]}

{t["sincerely"]}
    """
    
    if send_email_with_smtp(receiver, subject, content):
        return {"message": "Email đã được gửi!" if lang == "vi" else "Email sent successfully!"}
    else:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=500, content={"error": "Không thể gửi email" if lang == "vi" else "Could not send email"})
