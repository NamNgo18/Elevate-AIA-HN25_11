import json

from .qna_session_mgr             import SessionManager, SessionPhase
from ..utilities.openAI_helper    import OpenAIHelper
from ..utilities.log_manager      import LoggingManager

__all__ = ["SessionManager", "SessionPhase"]

def handle_start_interview(session_id: str = None, user_prompt: str = None) -> str:
    """
    Handle the start of an interview for the given session ID.
    This is a placeholder function and should be implemented with actual logic.
    """
    app_logger = LoggingManager().get_logger("AppLogger")
    qna_session_mgr = SessionManager().get_session(session_id)
    if not qna_session_mgr:
        app_logger.error(f"Session ID {session_id} not found.")
        return None

    # Call OpenAI to generate introduction and questions
    fc_start_interviewing = [{
        "type": "function",
        "function": {
            "name": "start_interviewing",
            "description": (
                "Start an interview session by introducing the interviewer, "
                "summarizing the job description, and generating the list questions. "
                "The introduction should include a welcome "
                "message to the candidate, and a friendly first question "
                "about the candidate's customer or project experience."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "introduction": {
                        "type": "string",
                        "description": (
                            "A combined introduction that greets the candidate, thanks them for their interest to"
                            "join interview, and politely asks about their custome brief or their experience."
                        )
                    },
                    "questions_list": {
                        "type": "array",
                        "description": "A list of all interview questions from lower level to higher level.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "text": {"type": "string"},
                                "topic": {"type": "string"},
                                "difficulty": {
                                    "type": "string",
                                    "enum": ["easy", "medium", "hard"]
                                }
                            },
                            "required": ["text", "topic", "difficulty"]
                        }
                    }
                },
                "required": ["introduction", "questions_list"]
            }
        }
    }]
    prompt = SessionManager().get_trim_history(session_id)
    prompt.append({"role": "user", "content": json.dumps(user_prompt)})
    app_logger.debug(f"\n\n\n{prompt}\n\n\n")
    ai_response = OpenAIHelper().make_request(
                                msg_prompt = prompt,
                                func_defs  = fc_start_interviewing,
                                func_name  = "auto",
                                temp = 0.1
                            )

    if ai_response:
        app_logger.critical(f"OpenAI call failed.....")
        return None

    if "func" not in ai_response:
        app_logger.error(f"OpenAI did not return function call for session ID {session_id}.")
        return None

    question_list = ai_response["func"][0]["args"].get("questions_list", [])
    qna_session_mgr["phase"]               = SessionPhase.INTRO
    qna_session_mgr["question"]["total"]   = len(question_list)
    qna_session_mgr["question"]["current"] = 0
    qna_session_mgr["question"]["items"]   = question_list

    app_logger.debug(f"\n\n{question_list}\n\n\\n")

    return ai_response["func"][0]["args"].get("introduction", "There're somethings wrong starting the interview!")

# =======================================
#       Process Interview Answer
# =======================================
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