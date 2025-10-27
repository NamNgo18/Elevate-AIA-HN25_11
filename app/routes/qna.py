import asyncio

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
#       Start Interview Session
# =======================================
@router.post("/start")
def handle_interview_begin_session(sys_prompt: str = "You are an AI designed to provide support and assistance"):
    """
    Initialize interview session
    """
    app_logger = LoggingManager().get_logger("AppLogger")
    result: dict = {"session_id": None, "error": None}

    params = {
        "phase_state": qna_smgr.SessionPhase.INTRO,
        "sys_prompt": sys_prompt
    }

    # Get interview questions list
    #  TODO: Implement question fetching logic

    # QnA session instance
    new_session_id: str = qna_smgr.SessionManager().create_session(**params)
    app_logger.info(f"Initializing interview session for session_id: {new_session_id}")
    qna_session_mgr = qna_smgr.SessionManager().get_session(new_session_id)
    if not qna_session_mgr:
        app_logger.error(f"Session ID {new_session_id} not found.")
        result["error"] = "Failed to start interview session.."
        return JSONResponse(content = result, status_code = status.HTTP_400_BAD_REQUEST)

    result["session_id"] = new_session_id
    app_logger.info(f"Session {new_session_id} phase updated to {qna_smgr.SessionPhase.INTRO.name}.")
    return JSONResponse(content = result, status_code = status.HTTP_200_OK)

# =======================================
#       Process Interview Answer
# =======================================
@router.post("/answer/{session_id}")
def handle_interview_answer_submission(session_id: str = None, answer: str = None):
    """
    Submit answer for the current question in the interview session
    """
    app_logger = LoggingManager().get_logger("AppLogger")
    qna_session_mgr = qna_smgr.SessionManager().get_session(session_id)
    result: dict = {"question": None, "error": None}
    app_logger.info(f"Submitting answer for session_id: {session_id}")

    if not qna_session_mgr:
        app_logger.error(f"Session ID {session_id} not found.")
        return JSONResponse(content = result, status_code = status.HTTP_400_BAD_REQUEST)

    # current_question_index = qna_session_mgr["question"]["current"]
    # if current_question_index >= qna_session_mgr["question"]["total"]:
    #     app_logger.error(f"No more questions available for session ID {session_id}.")
    #     result["error"] = "No more questions available."
    #     return JSONResponse(content = result, status_code = status.HTTP_400_BAD_REQUEST)

    # # Store the answer in conversation history
    # qna_session_mgr["conversation_history"].append({
    #     "role": "user",
    #     "content": answer
    # })
    # app_logger.info(f"Answer recorded for session {session_id}, question index {current_question_index}.")

    # # Move to the next question
    # qna_session_mgr["question"]["current"] += 1
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
    result: dict = {"deleted": None, "error": None}
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