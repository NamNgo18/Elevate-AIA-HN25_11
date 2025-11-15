from fastapi import APIRouter
from fastapi.middleware.cors import CORSMiddleware # Cần thiết cho việc giao tiếp với React
from app.services.send_mail import send_email_with_smtp
from app.services.scan_cv_jd import find_infor_cv_jd
import os
from typing import List, Dict, Any

router = APIRouter()

@router.post("/send_confirmation")
def api_send_email(receiver, cv_id, jd_id):
    infor_cv_jd = find_infor_cv_jd(jd_id, cv_id)
    
    subject = f"Thư mời phỏng vấn - Vị trí {infor_cv_jd[0]['jd_name']}"
    content = f"""Kính gửi anh/chị {infor_cv_jd[0]['cv_name']}
    Sau khi xem xét hồ sơ và kinh nghiệm của anh/chị, chúng tôi nhận thấy anh/chị là một ứng viên tiềm năng và rất phù hợp với yêu cầu của vị trí này.
    
    Chúng tôi trân trọng mời anh/chị tham gia buổi phỏng vấn trực tuyến để thảo luận chi tiết hơn về kinh nghiệm, kỹ năng và vai trò tiềm năng của anh/chị trong đội ngũ của chúng tôi.
    
    Chi tiết phỏng vấn:
        - Vị trí: {infor_cv_jd[0]['jd_name']}
        - Hình thức: Phỏng vấn trực tuyến qua nền tảng Interview (AI của J_G)
        - Cách thức tham gia: Vui lòng truy cập vào đường link sau để bắt đầu buổi phỏng vấn:
            Link: http://localhost:3000/chat?jd_id={jd_id}&cv_id={cv_id}
            
    Nếu có bất kỳ câu hỏi nào hoặc cần sắp xếp lại lịch phỏng vấn, xin vui lòng liên hệ với chúng tôi qua email.
    
    Chúng tôi rất mong được gặp và trao đổi cùng anh/chị.

    Trân trọng,
    """
    
    if send_email_with_smtp(receiver, subject, content):
        return {"message": "Email đã được gửi!"}
    else:
        return {"error": "Không thể gửi email"}, 500

