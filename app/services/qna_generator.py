import json

from .qna_session_mgr             import SessionManager, SessionPhase
from ..utilities.openAI_helper    import OpenAIHelper
from ..utilities.log_manager      import LoggingManager

# Call OpenAI to generate introduction and questions
FN_VALIDATE_READNIESS = [{
    "type": "function",
    "function": {
        "name": "validate_readiness",
        "description": ("Classify readiness: ready / not_ready / uncertain based on the candidate's answer."
                        "If the candidate is ready, say to feel free to start first question"
                        "Otherwise, the candidate are ready, please lead to the first question with natural, human-like"
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "text": {
                    "type": "string",
                    "description": (
                        "The assistant's next reply based on the candidate is readiness."
                        "Base it on the fact that you asked the candidate to get ready for the interview session."
                    )
                },
                "text_summarize": {"type": "string"},
                "readiness": {
                    "type": "string",
                    "enum": ["ready", "not_ready", "uncertain"]
                },
                "next_stage": {
                    "type": "boolean",
                    "description": "Should move to next stage interview"
                }
            },
            "required": ["text", "text_summarize", "readiness", "next_stage"]
        }
    }
}]

FN_ASK_FOR_READINESS = [{
    "type": "function",
    "function": {
        "name": "ask_for_readiness",
        "description": (
                "Generate an appropriate assistant reply based on the candidate's readiness status. "
                "If 'ready', proceed to start the first question. "
                "If 'not_ready', respond with reassurance. "
                "If 'uncertain', gently clarify or guide the candidate."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "text": {
                    "type": "string",
                    "description": ("The assistant's advice or response based on the candidate's input. "
                    "If the candidate is ready, the response should invite them to start the interview. "
                    "If the candidate is not ready or uncertain, the response should provide advice, "
                    "encouragement, or a gentle prompt for clarification.")
                },
                "text_summarize": {"type": "string"},
                "readiness": {
                    "type": "string",
                    "enum": ["ready", "not_ready", "uncertain"],
                    "description": "Classification of the candidate's readiness."
                },
                "next_stage": {
                    "type": "boolean",
                    "description": "Should move to next stage interview"
                }
            },
            "required": ["text", "text_summarize", "readiness", "next_stage"]
        }
    }
}]

# Call OpenAI to generate introduction and questions
FN_START_INTERVIEWING = [{
    "type": "function",
    "function": {
        "name": "start_interviewing",
        "description": (
            "Start an interview session by introducing the interviewer, summarizing the job description."
            "The introduction should include a welcome message to the candidate, and a friendly first question "
            "about the candidate's customer or project experience."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "intro": {
                    "type": "string",
                    "description": (
                        "A combined introduction that greets the candidate, thanks them for their interest to"
                        "join interview, and politely asks about their custome brief or their experience."
                    )
                },
                "questions": {
                    "type": "array",
                    "description": "A list of all interview questions from lower level to higher level.",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": {"type": "string"},
                            "text": {"type": "string"},
                            "topic": {"type": "string"},
                            "level": {
                                "type": "string",
                                "enum": ["easy", "medium", "hard"]
                            }
                        },
                        "required": ["id", "text", "topic", "level"]
                    }
                }
            },
            "required": ["intro", "questions"]
        }
    }
}]

FN_QNA_INTERVIEW = [{
    "type": "function",
    "function": {
        "name": "qna_interview",
        "description": (
            "Analyzes and manages the interview conversation with a candidate. "
            "This function evaluates the candidate's response to a question, "
            "summarizes their answer, and determines the next interview action "
            "such as asking follow-up questions or proceeding to the next stage."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "text": {
                    "type": "string",
                    "description": (
                        "A brief, first-person summary of the candidate’s answer and its meaning. "
                    )
                },
                "text_summarize": {
                    "type": "string",
                    "description":  "A brief, first-person summary of the candidate’s answer and its meaning. For example: 'I explained how teamwork helps me solve problems effectively.'"
                },
                "followup_needed": {
                    "type": "boolean",
                    "description": "True if a follow-up question is needed due to lack of understanding, an incomplete answer, or if the candidate lost focus on the question."
                },
                "next_question": {
                    "type": "boolean",
                    "description": "True if the candidate’s answer is mostly correct or relevant, and the interviewer should proceed with the next question in the same stage."
                },
                "next_stage": {
                    "type": "boolean",
                    "description": "True if the candidate has decided to terminate the interview conversation or answered all questions."
                }
            },
            "required": ["text", "text_summarize", "followup_needed", "next_question", "next_stage"]
        }
    }
}]

FN_WARMUP = [{
    "type": "function",
    "function": {
        "name": "warmup_interview",
        "description": (
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "text": {
                    "type": "string",
                    "description": (
                        "Handles the warm-up or closing phase of an AI-powered interview session. "
                        "Depending on the candidate’s state, it either generates a follow-up question "
                        "or provides a polite closing message with encouragement and feedback."
                    )
                },
                "text_summarize": {
                    "type": "string",
                    "description": (
                        "A concise summary of the candidate’s performance or main points "
                        "from their responses. Used to evaluate clarity, structure, and relevance."
                    )
                },
                "followup_needed": {
                    "type": "boolean",
                    "description": (
                        "Indicates whether the AI interviewer should ask a follow-up question "
                        "based on the current response. True = another question needed; False = move on."
                    )
                },
                "complete_interview": {
                    "type": "boolean",
                    "description": "Specifies whether the entire interview session has been completed."
                }
            },
            "required": ["text", "text_summarize", "followup_needed", "complete_interview"]
        }
    }
}]

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

    prompt_text = SessionManager().get_trim_history(session_id)
    prompt_text.append({
        "role": "user",
        "content": f"""
The job description: {json.dumps(user_prompt)}
Begin by greeting and welcoming the candidate to the interview. Introduce yourself as the interviewer
and summarize the position apply in a clear and engaging way.
After the introduction, generate a dynamic list of interview questions(max 2 quiz) that align with the job is requirements and responsibilities.
"""
    })
    ai_response = OpenAIHelper().make_request(
        msg_prompt = prompt_text,
        func_defs  = FN_START_INTERVIEWING,
        func_name  = "auto",
        temp = 0.9
    )

    if "error" in ai_response:
        app_logger.critical(f"OpenAI call failed..... {ai_response['error']}")
        return None

    question_list = ai_response["func"][0]["args"].get("questions", [])
    qna_session_mgr["phase"]               = SessionPhase.INTRO
    qna_session_mgr["question"]["total"]   = len(question_list)
    qna_session_mgr["question"]["items"]   = question_list

    return ai_response["func"][0]["args"].get("intro", "There're somethings wrong starting the interview!")

# =======================================
#       Process Interview Answer
# =======================================
def handle_readniess_interview(session_id: str = None, user_prompt: str = None) -> str | list:
    app_logger = LoggingManager().get_logger("AppLogger")
    qna_session_mgr = SessionManager().get_session(session_id)
    if not qna_session_mgr:
        app_logger.error(f"Session ID {session_id} not found.")
        return None

    params = {
        "msg_prompt" : None,
        "func_defs" : None,
    }
    
    params["msg_prompt"] = SessionManager().get_trim_history(session_id)
    if SessionPhase.INTRO == qna_session_mgr["phase"]:
        params["func_defs"] = FN_ASK_FOR_READINESS
        params["msg_prompt"].append({
        "role": "user",
        "content": f"""Analyze the candidate is message to determine their readiness.
Context: You asked the candidate to introduce themselves or share a brief about their experience.
The candidate's answer: {json.dumps(user_prompt)}
Response:
    text: The assistant’s appropriate next reply. If the candidate has been shared about their brief, ask them for starting interview
    next_stage: True only if the candidate has provided their brief and experience, or if it was explicitly decided to skip sharing, only ready is not allow to change stage.
    text_summarize: Provide a concise, first-person summary of your answer, clearly expressing its main idea or meaning
"""
        })
    elif SessionPhase.READINESS == qna_session_mgr["phase"]:
        params["func_defs"] = FN_VALIDATE_READNIESS
        params["msg_prompt"].append({
            "role": "user",
            "content": f"""Analyze the candidate is message to determine their readiness.
Context: You asked the candidate to ready for starting interview
The candidate's answer: {json.dumps(user_prompt)}
Response:
    text: Decide the next assistant reply. If the candidate has already confirmed they are ready, move on with the interview
    next_stage: Whether the candidate can move to the next stage if they have already confirmed
"""
        })

    ai_response = OpenAIHelper().make_request(
        msg_prompt = params["msg_prompt"],
        func_defs  = params["func_defs"],
        func_name  = "auto",
        temp       = 0.7
    )

    if "error" in ai_response:
        app_logger.critical(f"OpenAI call failed..... {ai_response['error']}")
        return None

    ai_resp_func = ai_response["func"][0]["args"]
    if not ai_resp_func:
        app_logger.critical(f"No response from OpenAI {ai_resp_func['error']}")
        return None

    app_logger.info(f"\n\n\nREPLY: {ai_resp_func}\nPHASE: {qna_session_mgr['phase']}\n")
    ai_reply_text: list = [ai_resp_func.get("text", "There're somethings wrong why readniess!")]
    if ai_resp_func["next_stage"]:
        if SessionPhase.INTRO == qna_session_mgr["phase"]:
            qna_session_mgr["phase"] = SessionPhase.READINESS
        elif SessionPhase.READINESS:
            qna_session_mgr["phase"] = SessionPhase.INTERVIEW 
            qna_session_mgr["question"]["current"] += 1
            ai_reply_text.append(
                qna_session_mgr["question"]["items"][
                    qna_session_mgr["question"]["current"] - 1
                ]["text"]
            )
        # Save the chat history for using later
        qna_session_mgr["conversation_history"].append({
            "role": "user",
            "content": ai_resp_func["text_summarize"]
        })
        qna_session_mgr["conversation_history"].append({
            "role": "assistant",
            "content": ai_resp_func["text"]
        })
        qna_session_mgr["conversation_history"].append({
            "role": "assistant",
            "content": qna_session_mgr["question"]["items"][
                        qna_session_mgr["question"]["current"] - 1
                    ]["text"]
        })
    elif "ready" != ai_resp_func["readiness"]:
        return ai_reply_text

    app_logger.info(f"PHASE CHANGED: {qna_session_mgr['phase']}\n\n\n")
    return ai_reply_text


def handle_qna_interview(session_id: str = None, user_prompt: str = None) -> str | list:
    app_logger = LoggingManager().get_logger("AppLogger")
    qna_session_mgr = SessionManager().get_session(session_id)
    if not qna_session_mgr:
        app_logger.error(f"Session ID {session_id} not found.")
        return None

    prompt_text = SessionManager().get_trim_history(session_id)
    prompt_text.append({
            "role": "user",
            "content": f"""You are supporting a candidate in a Q&A interview.
Context:
    - The candidate is participating in a Q&A interview. They may ask for clarification, pause, or decide to end the interview.
    - The candidate is currently on question {qna_session_mgr["question"]["current"]} of {qna_session_mgr["question"]["total"]}.
The candidate's answer: {json.dumps(user_prompt)}
Tasks:
    1. text: Confirm the candidate’s answer. Add brief encouragement and acknowledge clarity or effort. If possible, offer a relevant example, link, or short supportive comment.
    2. followup_needed: Identify if follow-up questions are needed when the answer is unclear, or off-topic.
    3. next_stage: if the candidate was confirmed definitely to cancel or all questions are done
    4. Encourage effort, acknowledge clarity, and gently guide if unsure or off-track.
    5. Maintain a professional, positive, friendly, motivating tone.
    6. Switch to next state if the queston is reached or the candidate explicit terminate/cancel/stop interview session
"""
    })

    ai_response = OpenAIHelper().make_request(
        msg_prompt = prompt_text,
        func_defs  = FN_QNA_INTERVIEW,
        func_name  = "auto",
        temp       = 0.2
    )

    if "error" in ai_response:
        app_logger.critical(f"OpenAI call failed..... {ai_response['error']}")
        return None

    ai_resp_func = ai_response["func"][0]["args"]
    if not ai_resp_func:
        app_logger.critical(f"No response from OpenAI {ai_resp_func['error']}")
        return None

    app_logger.info(f"\n\n\nREPLY: {ai_resp_func}\nPHASE: {qna_session_mgr['phase']}\n")
    ai_reply_text: list = [ai_resp_func.get("text", "There're somethings wrong why readniess!")]
    if ai_resp_func["next_stage"]:
        qna_session_mgr["phase"] = SessionPhase.WARMUP
        return ai_reply_text
    elif ai_resp_func["followup_needed"]:
        # Save the chat history for using later
        qna_session_mgr["conversation_history"].append({
            "role": "user",
            "content": ai_resp_func["text_summarize"]
        })
        qna_session_mgr["conversation_history"].append({
            "role": "assistant",
            "content": ai_resp_func["text"]
        })
        return ai_reply_text
    elif ai_resp_func["next_question"]:
        qna_session_mgr["question"]["current"] += 1
        ai_reply_text.append(
            qna_session_mgr["question"]["items"][
                qna_session_mgr["question"]["current"] - 1
            ]["text"]
        )
        # Save the chat history for using later
        qna_session_mgr["conversation_history"].append({
            "role": "user",
            "content": ai_resp_func["text_summarize"]
        })
        qna_session_mgr["conversation_history"].append({
            "role": "assistant",
            "content": ai_resp_func["text"]
        })
        qna_session_mgr["conversation_history"].append({
            "role": "assistant",
            "content": qna_session_mgr["question"]["items"][
                        qna_session_mgr["question"]["current"] - 1
                    ]["text"]
        })

    app_logger.info(f"PHASE CHANGED: {qna_session_mgr['phase']}\n\n\n")
    return ai_reply_text

def handle_warmup_interview(session_id: str = None, user_prompt: str = None) -> str | list:
    app_logger = LoggingManager().get_logger("AppLogger")
    qna_session_mgr = SessionManager().get_session(session_id)
    if not qna_session_mgr:
        app_logger.error(f"Session ID {session_id} not found.")
        return None

    prompt_text = SessionManager().get_trim_history(session_id)
    prompt_text.append({
            "role": "user",
            "content": f"""
Context: - The candidate is participating in a Q&A interview. They may ask for clarification, pause, or decide to end the interview.
The candidate's answer: {json.dumps(user_prompt)}
Provide positive support
    - Summarize the candidate’s response in first-person.
    - Identify if follow-up questions are needed when the answer is unclear, or off-topic.
    - Conclude the interview politely if the candidate wants to cancel or all questions are done.
    - Provide positive support: encourage effort, acknowledge clarity, and gently guide if unsure or off-track.
    - Maintain a professional, friendly, motivating tone.
    - Switch to next state if the queston is reached or the candidate explicit terminate/cancel/stop interview session
"""
    })

    ai_response = OpenAIHelper().make_request(
        msg_prompt = prompt_text,
        func_defs  = FN_WARMUP,
        func_name  = "auto",
        temp       = 0.7
    )

    if "error" in ai_response:
        app_logger.critical(f"OpenAI call failed..... {ai_response['error']}")
        return None

    ai_resp_func = ai_response["func"][0]["args"]
    if not ai_resp_func:
        app_logger.critical(f"No response from OpenAI {ai_resp_func['error']}")
        return None

    app_logger.info(f"\n\n\nREPLY: {ai_resp_func}\nPHASE: {qna_session_mgr['phase']}\n")
    ai_reply_text: list = [ai_resp_func.get("text", "There're somethings wrong why readniess!")]
    if ai_resp_func["complete_interview"]:
        app_logger.info(f"Completely interview done!")
        return ai_reply_text
    elif ai_resp_func["followup_needed"]:
        # Save the chat history for using later
        qna_session_mgr["conversation_history"].append({
            "role": "user",
            "content": ai_resp_func["text_summarize"]
        })
        qna_session_mgr["conversation_history"].append({
            "role": "assistant",
            "content": ai_resp_func["text"]
        })
        return ai_reply_text

    app_logger.info(f"PHASE CHANGED: {qna_session_mgr['phase']}\n\n\n")
    return ai_reply_text