from .qna_session_mgr             import SessionManager, SessionPhase
from ..utilities.openAI_helper    import OpenAIHelper
from ..utilities.log_manager      import LoggingManager

__all__ = ["SessionManager", "SessionPhase"]

def handle_start_interview(session_id: str = None) -> bool:
    """
    Handle the start of an interview for the given session ID.
    This is a placeholder function and should be implemented with actual logic.
    """
    app_logger = LoggingManager().get_logger("AppLogger")
    qna_session_mgr = SessionManager().get_session(session_id)
    if not qna_session_mgr:
        app_logger.error(f"Session ID {session_id} not found.")
        return None

    qna_session_mgr["question"]["total"] = 10
    qna_session_mgr["question"]["current"] = 0
    qna_session_mgr["question"]["items"] = [
        "What are your strengths?",
        "What are your weaknesses?",
        "Why do you want this job?",
        "Where do you see yourself in 5 years?",
        "Why should we hire you?",
        "Tell me about a challenge you faced and how you handled it.",
        "Describe a time when you worked in a team.",
        "How do you handle stress and pressure?",
        "What motivates you?",
        "Do you have any questions for us?"
    ]

    return ....

def handle_answer(session_id: str = None, answer: str = None) -> bool:
    """
    Handle the submitted answer for the given session ID.
    This is a placeholder function and should be implemented with actual logic.
    """
    session_qna = SessionManager().get_session(session_id)
    if not session_qna:
        return False

    # Placeholder for processing the answer
    # Actual implementation would involve updating the session state,
    # storing the answer, and possibly generating the next question.

    return True

# =======================================
#    Categorize Readiness via AI
# =======================================
def categorize_readiness_ai(msg_in: str = None) -> str:
    """
    Ask OpenAI to classify candidate's readiness.
    Returns: 'ready', 'not_ready', or 'uncertain'
    """
    prompt = f"""
    The candidate answered: "{answer}"
    Classify their readiness to start the interview in one of these categories:
    - "ready": fully ready
    - "not_ready": clearly not ready
    - "uncertain": partially ready or needs clarification

    Return only one word: ready, not_ready, or uncertain.
    """
    # TODO: Implement the call to OpenAI API
    result = call_openai(session_id, prompt, temperature=0)
    return result.strip().lower()