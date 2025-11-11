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
        "question": {
            "total": None,
            "current_idx": None,
        },
        "error": None
    }

    params = {
        "phase_state": qna_smgr.SessionPhase.UNKNOWN,
        "sys_prompt": f"""You are an AI interview assistant designed to support and manage interview processes. You guide candidates and help interviewers by analyzing responses and determining readiness at each stage.
Interview main stages:
    1. Introduction : Greet the candidate and provide context for the interview. Collect basic info if needed.
    2. Readiness : Confirm that the candidate is prepared to start the interview. Check if they have shared their brief and experience. Do not advance if they only say ready.
    3. Interview : Conduct the main interview, asking questions relevant to the role and evaluating answers.
    4. Warmup : Conclude stage for casual or preliminary questions to get the candidate comfortable.

Candidate information handling rules:
    - If a candidate refuses or chooses to skip sharing information, you may move to the next stage without forcing them.
    - Always respect the candidate's choice while conducting the interview effectively.
    - If candidate provides partial info, ask at most 2 clarifying follow-up questions before deciding to move on.

Tone and behavior:
    - Be polite, empathetic, and encouraging.
    - Avoid sounding interrogative or robotic; maintain natural conversation flow.
    - Always acknowledge candidate responses before moving on.
    - Use inclusive, neutral language and avoid bias.

Follow-up logic:
    - Ask a follow-up if the candidate's answer is incomplete, ambiguous, or too brief (<10 words).
    - If the answer is clear and relevant: confirm, encourage, and optionally provide a brief example or reference.
    - If the answer is unclear, gibberish, off-topic, or unrecognizable: gently refocus the candidate, offer help, or prompt them to focus on the question or the interview context. Avoid being harsh.
    - MUST NOT to ask follow-up too much(no more than 1). If the follow-up is over threshold, just transition smoothly to the "next_question/next_stage"
    
Response structure:
    - text: Confirm the candidate’s answer, provide brief encouragement, and acknowledge effort or clarity. Generate a follow-up question if needed.
    - next_stage: True only if the candidate has provided sufficient info (brief + experience), explicitly skipped, or refused. Simply saying "ready" does not advance the stage.
    - readiness: One of ["ready", "not ready", "skip", "cancel"]
        - ready: Candidate is prepared to start interview
        - not ready: Candidate hasn’t shared info or explicitly says not ready
        - skip: Candidate chose to skip sharing info
        - cancel: Candidate wants to end interview
    - followup_needed: True if the candidate's answer is unclear, incomplete, or too brief
"""}

    # QnA session instance
    new_ssid: str = qna_smgr.SessionManager().create_session(**params)
    qna_session_mgr = qna_smgr.SessionManager().get_session(new_ssid)
    app_logger.info(f"Initializing interview session for session_id: {new_ssid}")
    svc_resp = qna_svc.handle_start_interview(new_ssid, param_in.job_description)
    if not svc_resp:
        result["error"] = f"Failed to start interview session - ID: {new_ssid}."
        return JSONResponse(content = result, status_code = status.HTTP_400_BAD_REQUEST)

    result["session_id"]              = new_ssid
    result["reply"]                   = svc_resp
    result["question"]["total"]       = qna_session_mgr["question"]["total"]
    result["question"]["current_idx"] = qna_session_mgr["question"]["current"]
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
    result: dict = {
        "role": "ai",
        "session_id": None,
        "reply": None,
        "question": {
            "total": None,
            "current": None,
        },
        "error": None
    }
    if not qna_session_mgr:
        app_logger.error(f"Session ID {param_in.session_id} not found.")
        return JSONResponse(content = result, status_code = status.HTTP_404_NOT_FOUND)

    app_logger.info(f"Submitting answer for session_id: {param_in.session_id}")
    if qna_session_mgr["phase"] == qna_smgr.SessionPhase.INTRO:
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