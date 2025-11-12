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
    jd_id: str
    cv_id: str


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
    result: dict = {
        "role": "ai",
        "session_id": None,
        "reply": None,
        "error": None
    }

    app_logger = LoggingManager().get_logger("AppLogger")
    svc_resp = qna_svc.handle_initialize_interview(param_in.jd_id, param_in.cv_id)
    if not svc_resp:
        result["error"] = f"Failed to initialize interview session"
        app_logger.error(result["error"])
        return JSONResponse(content = result, status_code = status.HTTP_400_BAD_REQUEST)

    qna_session_mgr = qna_smgr.SessionManager().get_session(svc_resp["session_id"])
    app_logger.info(f'Initializing interview session for session_id: {svc_resp["session_id"]}')
    if not qna_session_mgr:
        result["error"] = f'Session ID {svc_resp["session_id"]} not found.'
        app_logger.error(result["error"])
        return JSONResponse(content = result, status_code = status.HTTP_404_NOT_FOUND)

    qna_svc.handle_build_interview_summary(svc_resp["session_id"])

    result["session_id"] = svc_resp["session_id"]
    result["reply"] = "Configuration completed successfully!"
    return JSONResponse(content = result, status_code = status.HTTP_200_OK)

# =======================================
#       Process Interview Answer
# =======================================
@router.post("/answer")
def handle_interview_answer_submission(param_in: InterviewAnswerRequest):
    """
    Submit answer for the current question in the interview session
    """
    qna_session_mgr = qna_smgr.SessionManager().get_session(param_in.session_id)
    if not qna_session_mgr:
        app_logger.error(f"Session ID {param_in.session_id} not found.")
        return JSONResponse(content = result, status_code = status.HTTP_404_NOT_FOUND)

    result: dict = {
        "role": "ai",
        "reply": None,
        "question": {
            "total": None,
            "current": None,
        },
        "error": None
    }

    app_logger = LoggingManager().get_logger("AppLogger")
    app_logger.info(f"Submitting answer for session_id: {param_in.session_id}")
    if qna_session_mgr["phase"] == qna_smgr.SessionPhase.UNKNOWN:
        svc_resp = qna_svc.handle_start_interview(param_in.session_id, param_in.answer)
        err_msg = "Failed to start interview session or generate questions bank"
    elif qna_session_mgr["phase"] == qna_smgr.SessionPhase.INTRO:
        svc_resp = qna_svc.handle_readniess_interview(param_in.session_id, param_in.answer)
        err_msg = "Failed to ask the candidate's readniess"
    elif qna_session_mgr["phase"] == qna_smgr.SessionPhase.READINESS:
        svc_resp = qna_svc.handle_readniess_interview(param_in.session_id, param_in.answer)
        err_msg = "Failed to evaluate the candidate's readniess"
    elif qna_session_mgr["phase"] == qna_smgr.SessionPhase.INTERVIEW:
        svc_resp = qna_svc.handle_qna_interview(param_in.session_id, param_in.answer)
        err_msg = "Failed to continious the candidate's interview"
    elif qna_session_mgr["phase"] == qna_smgr.SessionPhase.WARMUP:
        svc_resp = qna_svc.handle_warmup_interview(param_in.session_id, param_in.answer)
        err_msg = "Failed to continious the candidate's warm-up"
    else:
        result["error"] = f"UNKNOWN the phase for interviewing session ID: {param_in.session_id}"
        return JSONResponse(content = result, status_code = status.HTTP_404_NOT_FOUND)

    if not svc_resp:
        result["error"] = err_msg
        return JSONResponse(content = result, status_code = status.HTTP_400_BAD_REQUEST)

    result["reply"]                   = svc_resp
    result["question"]["total"]       = qna_session_mgr["question"]["total"]
    result["question"]["current_idx"] = qna_session_mgr["question"]["current"]
    return JSONResponse(content = result, status_code = status.HTTP_200_OK)

# =======================================
#       Terminate Interview Session
# =======================================
@router.delete("/interview")
def handle_terminate_interview_session(session_id: str = None):
    """
    Delete interview session
    """
    qna_session_mgr = qna_smgr.SessionManager().get_session(session_id)
    if not qna_session_mgr:
        app_logger.error(f"Session ID {session_id} not found.")
        return JSONResponse(content = result, status_code = status.HTTP_400_BAD_REQUEST)

    result: dict = {
        "role": "ai",
        "reply": None,
        "deleted": None,
        "error": None
    }

    app_logger = LoggingManager().get_logger("AppLogger")
    app_logger.info(f"Deleting interview session for session_id: {session_id}")
    deleted = qna_smgr.SessionManager().delete_session(session_id)
    result["deleted"] = deleted
    if not deleted:
        app_logger.error(f"Failed to delete session ID: {session_id}.")
        return JSONResponse(content = result, status_code = status.HTTP_500_INTERNAL_SERVER_ERROR)

    app_logger.info(f"The interview session {session_id} has been deleted: {deleted}")
    return JSONResponse(content = result, status_code = status.HTTP_200_OK)