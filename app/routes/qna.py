import asyncio

from pydantic                   import BaseModel
from fastapi                    import APIRouter, status
from fastapi.responses          import JSONResponse
from ..utilities.log_manager    import LoggingManager
from ..services                 import qna_session_mgr        as qna_smgr
from ..services                 import qna_generator          as qna_svc

# =======================================
#       QnA Interview Routes
# =======================================
router = APIRouter()

# =======================================
#     Payload Model sending from Client
# =======================================
class InterviewStartRequest(BaseModel):
    sys_prompt: str = "You are an AI designed to provide support and assistance for interview processes."
    job_description: dict

class InterviewAnswerRequest(BaseModel):
    session_id: str
    answer: str

# =======================================
#       Start Interview Session
# =======================================
@router.post("/start")
async def handle_interview_begin_session(param_in: InterviewStartRequest):
    """
    Initialize interview session
    """
    app_logger = LoggingManager().get_logger("AppLogger")
    result: dict = {
        "role": "ai",
        "session_id": None,
        "reply": None,
        "total_question": None,
        "error": None
    }

    params = {
        "phase_state": qna_smgr.SessionPhase.UNKNOWN,
        "sys_prompt": param_in.sys_prompt
    }

    # QnA session instance
    new_ssid: str = qna_smgr.SessionManager().create_session(**params)
    app_logger.info(f"Initializing interview session for session_id: {new_ssid}")
    svc_resp = qna_svc.handle_start_interview(new_ssid, param_in.job_description)
    if not svc_resp:
        result["error"] = f"Failed to start interview session - ID: {new_ssid}."
        return JSONResponse(content = result, status_code = status.HTTP_400_BAD_REQUEST)

    result["session_id"]     = new_ssid
    result["reply"]          = svc_resp
    result["total_question"] = qna_smgr.SessionManager().get_session(new_ssid)["question"]["total"]
    app_logger.info(f"Session {new_ssid} phase updated to {qna_smgr.SessionPhase.INTRO.name}.")
    return JSONResponse(content = result, status_code = status.HTTP_200_OK)

# =======================================
#       Process Interview Answer
# =======================================
@router.post("/answer")
def handle_interview_answer_submission(param_in: InterviewAnswerRequest):
    """
    Submit answer for the current question in the interview session
    """
    app_logger = LoggingManager().get_logger("AppLogger")
    qna_session_mgr = qna_smgr.SessionManager().get_session(param_in.session_id)
    result: dict = {"role": "ai", "session_id": None, "reply": None, "error": None}
    if not qna_session_mgr:
        app_logger.error(f"Session ID {param_in.session_id} not found.")
        return JSONResponse(content = result, status_code = status.HTTP_404_NOT_FOUND)

    app_logger.info(f"Submitting answer for session_id: {param_in.session_id}")
    if qna_session_mgr["phase"] == qna_smgr.SessionPhase.INTRO:
        svc_resp = qna_svc.handle_readniess(param_in.session_id, param_in.answer)
        if not svc_resp:
            result["error"] = "Failed to ask the candidate's readniess"
            return JSONResponse(content = result, status_code = status.HTTP_400_BAD_REQUEST)

        result["reply"] = svc_resp

    elif qna_session_mgr["phase"] == qna_smgr.SessionPhase.READINESS:
        svc_resp = qna_svc.handle_readniess(param_in.session_id, param_in.answer)
        if not svc_resp:
            result["error"] = "Failed to evaluate the candidate's readniess"
            return JSONResponse(content = result, status_code = status.HTTP_400_BAD_REQUEST)

        result["reply"] = svc_resp

    elif qna_session_mgr["phase"] == qna_smgr.SessionPhase.INTERVIEW:
        svc_resp = qna_svc.handle_interview(param_in.session_id, param_in.answer)
        if not svc_resp:
            result["error"] = "Failed to continious the candidate's interview"
            return JSONResponse(content = result, status_code = status.HTTP_400_BAD_REQUEST)

        result["reply"] = svc_resp

    return JSONResponse(content = result, status_code = status.HTTP_200_OK)

# =======================================
#       Terminate Interview Session
# =======================================
@router.delete("/{session_id}")
def handle_terminate_interview_session(session_id: str = None):
    """
    Delete interview session
    """
    app_logger = LoggingManager().get_logger("AppLogger")
    qna_session_mgr = qna_smgr.SessionManager().get_session(session_id)
    result: dict = {"role": "ai", "deleted": None, "error": None}
    app_logger.info(f"Deleting interview session for session_id: {session_id}")

    if not qna_session_mgr:
        app_logger.error(f"Session ID {session_id} not found.")
        return JSONResponse(content = result, status_code = status.HTTP_400_BAD_REQUEST)

    deleted = qna_smgr.SessionManager().delete_session(session_id)
    result["deleted"] = deleted
    if not deleted:
        app_logger.error(f"Failed to delete session ID: {session_id}.")
        return JSONResponse(content = result, status_code = status.HTTP_500_INTERNAL_SERVER_ERROR)

    app_logger.info(f"The interview session {session_id} has been deleted: {deleted}")
    return JSONResponse(content = result, status_code = status.HTTP_200_OK)