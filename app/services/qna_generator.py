import json

from .qna_session_mgr             import SessionManager, SessionPhase
from ..utilities.openAI_helper    import OpenAIHelper
from ..utilities.log_manager      import LoggingManager
from data.schema                  import *
from pathlib                      import Path

# =======================================
def handle_initialize_interview(jd_id: str = None, cv_id:str = None) -> dict:
    app_logger = LoggingManager().get_logger("AppLogger")
    try:
        full_path: str = Path(__file__).resolve().parents[2]/"data"/"upload"/"JD"/f"{jd_id}.json"
        with open(full_path, 'r') as jd_file:
            jd_info = json.load(jd_file)
        full_path: str = Path(__file__).resolve().parents[2]/"data"/"upload"/"CV"/f"{cv_id}.json"
        with open(full_path, 'r') as cv_file:
            cv_info = json.load(cv_file)
    except FileNotFoundError as e:
        app_logger.error(f"The file {e.filename} was not found.")
        return None
    except json.JSONDecodeError as e:
        app_logger.error(f"The file {e.doc} is not a valid JSON.")
        return None
    except Exception as e:
        app_logger.error(f"An unexpected error occurred while loading {e}")
        return None

    params = {
        "phase_state": SessionPhase.UNKNOWN,
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
    - followup_needed: True if the candidate's answer is unclear, incomplete, or too brief""",
        "jd_meta": jd_info,
        "cv_meta": cv_info
    }

    # QnA session instance
    new_ssid: str = SessionManager().create_session(**params)
    app_logger.info(jd_info)
    app_logger.info(cv_info)
    return {"session_id": new_ssid}

# =======================================
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
The job description: {qna_session_mgr["jd_meta"]}
The candidate resume: {qna_session_mgr["cv_meta"]} 
Begin by greeting and welcoming the candidate to the interview. Introduce yourself as the AI interviewer and briefly summarize the position they’re applying for in a clear and engaging way.
    e.g: Hello! I’m your AI interviewer for today’s mock interview session. I’m here to help you practice and improve your interview skills. We’ll go through a few questions covering topics relevant to your role.....
After the introduction, generate a dynamic list of interview questions ({json.dumps(user_prompt)}) ordered by random difficulty levels — easy, medium, and hard.

And then, ask candidate that could start by sharing a brief overview of their background or experience"

Required:
    - Ensure that the set of questions includes at least one easy and one hard question that align closely with the job’s key requirements and responsibilities.
    - The question should be added the text transition to(e.g: Question 1: What's...)
"""})
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

    app_logger.info(f"PHASE CHANGED: {qna_session_mgr['phase']}\n\n")
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
        "content": f"""Analyze the candidate is message to determine their readiness and don't create new interview question here
Context: You asked the candidate to introduce themselves or share a brief about their experience.
The candidate's answer: {json.dumps(user_prompt)}
Response as:
    text:The assistant’s next reply.
        - If the candidate has been shared about their brief, ask them for starting interview
        - Otherwise, generate an answer to reply candidate's confusing or a follow-up question or ask them for starting interview
    next_stage: True only if the candidate has provided their brief and experience, or if it was explicitly decided to skip sharing, only ready is not allow to change stage.
"""})
    elif SessionPhase.READINESS == qna_session_mgr["phase"]:
        params["func_defs"] = FN_VALIDATE_READNIESS
        params["msg_prompt"].append({
            "role": "user",
            "content": f"""Analyze the candidate is message to determine their readiness.
Context: The candidate's confirm their readiness according to the prevous question?
The candidate's answer: {json.dumps(user_prompt)}
Response as:
    text: Ask to start the interview and provide the assistant’s next reply:
          - If the candidate has confirmed they are ready(next_stage = True), but MUST NOT create a new question.
          - Otherwise, generate an answer to reply candidate's confusing or a follow-up question or ask for clarification.
    readiness: Indicate the candidate's reainess for starting QnA interview session
    next_stage: True only if the candidate's readiness is READY
    text_summarize: Provide a concise, first-person summary of your reply. For example: To clarify, you said.....
"""})

    ai_response = OpenAIHelper().make_request(
        msg_prompt = params["msg_prompt"],
        func_defs  = params["func_defs"],
        func_name  = "auto",
        temp       = 0.7
    )

    if "error" in ai_response:
        app_logger.critical(f"OpenAI call failed..... {ai_response['error']}")
        return None

    try:
        ai_resp_func = ai_response["func"][0]["args"]
        if not ai_resp_func:
            app_logger.critical(f"No response from OpenAI {ai_resp_func['error']}")
            return None
    except:
        return ai_response["msg_text"]

    app_logger.info(f"\n\n\nREPLY: {ai_resp_func}\nPHASE: {qna_session_mgr['phase']}\n")
    ai_reply_text: list = [ai_resp_func.get("text", "There're somethings wrong why readniess!")]
    # Save the chat history for using later
    qna_session_mgr["conversation_history"].append({
        "role": "user",
        "content": user_prompt
    })
    qna_session_mgr["conversation_history"].append({
        "role": "assistant",
        "content": ai_resp_func["text"]
    })
    if ai_resp_func["next_stage"]:
        if SessionPhase.INTRO == qna_session_mgr["phase"]:
            qna_session_mgr["phase"] = SessionPhase.READINESS
        elif SessionPhase.READINESS == qna_session_mgr["phase"]:
            qna_session_mgr["phase"] = SessionPhase.INTERVIEW 
            qna_session_mgr["question"]["current"] += 1
            ai_reply_text.append(
                qna_session_mgr["question"]["items"][
                    qna_session_mgr["question"]["current"] - 1
                ]["text"]
            )
            qna_session_mgr["conversation_history"].append({
                "role": "assistant",
                "content": qna_session_mgr["question"]["items"][
                            qna_session_mgr["question"]["current"] - 1
                        ]["text"]
            })
        else:
            # Other phase won't handled
            return None
    elif "ready" != ai_resp_func["readiness"]:
        return ai_reply_text

    app_logger.info(f"PHASE CHANGED: {qna_session_mgr['phase']}\n\n")
    return ai_reply_text

# =======================================
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
Context: The candidate is participating in a Q&A interview. They may ask for clarification, pause, or decide to end the interview.
The candidate's answer: {json.dumps(user_prompt)}
Instructions:
    1. text:
        - Evaluate the candidate’s answer for correctness, clarity without repeat the user's answer.
        - Provide brief, constructive feedback and encouragement.
        - If possible, include a short example, explanation, or a helpful reference link to reinforce understanding.
        - Keep your tone professional, friendly, and motivating.
        - All questions have been completed if {qna_session_mgr["question"]["current"]} is greater than {qna_session_mgr["question"]["total"]}
        Example: 
            + Your explanations was clear and well-structured! How/Could/What...
    2. followup_needed: Generate a thoughtful follow-up question if the candidate's answer is off-topic or the candidate couldn't understand the question
        Example:
            + To calrify/What I meant was...
            + I understand — thanks for letting me know. Let me clarify that question a bit....
    3. next_stage:
        - when all questions have been completed if {qna_session_mgr["question"]["current"]} is greater than or equal to {qna_session_mgr["question"]["total"]}
        - when the candidate's confirm to end interview session
    4. Encourage effort, acknowledge clarity, and gently guide the candidate if unsure or off-track.
    5. Maintain a professional, positive, friendly, and motivating tone.
    6. If "next_question" is "true" and the answer is acceptable:
        - Provide a short positive text or clarification to reinforce the concept.
        - Transition smoothly to the next question (e.g: use natural connectors like “Great job on that! Let’s move on to the next question…”).
"""})

    ai_response = OpenAIHelper().make_request(
        msg_prompt = prompt_text,
        func_defs  = FN_QNA_INTERVIEW,
        func_name  = "auto",
        temp       = 0.5
    )

    if "error" in ai_response:
        app_logger.critical(f"OpenAI call failed..... {ai_response['error']}")
        return None

    try:
        ai_resp_func = ai_response["func"][0]["args"]
        if not ai_resp_func:
            app_logger.critical(f"No response from OpenAI {ai_resp_func['error']}")
            return None
    except:
        return ai_response["msg_text"]

    app_logger.info(f"\n\n\nREPLY: {ai_resp_func}\nPHASE: {qna_session_mgr['phase']}\n")
    ai_reply_text: list = [ai_resp_func.get("text", "There're somethings wrong why readniess!")]
    # Save the chat history for using later
    qna_session_mgr["conversation_history"].append({
        "role": "user",
        "content": user_prompt
    })
    qna_session_mgr["conversation_history"].append({
        "role": "assistant",
        "content": ai_resp_func["text"]
    })
    if ai_resp_func["next_stage"]:
        qna_session_mgr["phase"] = SessionPhase.WARMUP
    elif ai_resp_func["followup_needed"]:
        app_logger.info("Follow-up question now....")
    elif ai_resp_func["next_question"]:
        qna_session_mgr["question"]["current"] += 1
        if qna_session_mgr["question"]["current"] > qna_session_mgr["question"]["total"]:
            qna_session_mgr["phase"] = SessionPhase.WARMUP
            app_logger.warning("All questions have been completed. Moving on to the next phase")
        else:
            # Save the chat history for using later
            ai_reply_text.append(
                qna_session_mgr["question"]["items"][
                    qna_session_mgr["question"]["current"] - 1
                ]["text"]
            )
            qna_session_mgr["conversation_history"].append({
                "role": "assistant",
                "content": qna_session_mgr["question"]["items"][
                            qna_session_mgr["question"]["current"] - 1
                        ]["text"]
            })

    app_logger.info(f"PHASE CHANGED: {qna_session_mgr['phase']}\n\n")
    return ai_reply_text

# =======================================
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
Context: You are supportive, motivating, and use a natural conversational tone.
The candidate’s answer: {json.dumps(user_prompt)}

Instructions:
    1. Start with a brief, positive piece of feedback or advice based on the candidate’s answer.
    2. Politely ask if the candidate has any questions, confusion, or concerns they’d like to discuss.
    3. If the candidate has no further questions, close with an encouraging message that wishes them confidence and growth in their real interview.
"""})

    ai_response = OpenAIHelper().make_request(
        msg_prompt = prompt_text,
        func_defs  = FN_WARMUP_INTERVIEW,
        func_name  = "auto",
        temp       = 0.9
    )

    if "error" in ai_response:
        app_logger.critical(f"OpenAI call failed..... {ai_response['error']}")
        return None

    try:
        ai_resp_func = ai_response["func"][0]["args"]
        if not ai_resp_func:
            app_logger.critical(f"No response from OpenAI {ai_resp_func['error']}")
            return None
    except:
        return ai_response["msg_text"]

    app_logger.info(f"\n\n\nREPLY: {ai_resp_func}\nPHASE: {qna_session_mgr['phase']}\n")
    ai_reply_text: list = [ai_resp_func.get("text", "There're somethings wrong why readniess!")]
    if ai_resp_func["complete_interview"]:
        app_logger.info(f"Completely interview done!")
    elif ai_resp_func["followup_needed"]:
        # Save the chat history for using later
        qna_session_mgr["conversation_history"].append({
            "role": "user",
            "content": user_prompt
        })
        qna_session_mgr["conversation_history"].append({
            "role": "assistant",
            "content": ai_resp_func["text"]
        })

    app_logger.info(f"PHASE CHANGED: {qna_session_mgr['phase']}\n\n")
    return ai_reply_text

# =======================================
def handle_build_interview_summary(session_id: str = None) -> dict:
    resume: dict = {
        "candidate": {
            "name": "John Doe",
            "target_position": "SW-E",
            "contact_phone": "113",
            "email_address": "johndoe@email.com"
        },
        "conversation_history": [
            {"role": "user", "content": "Hello"},
            {"role": "ai", "content": "Hi, how can I help?"}
        ]
    }
    app_logger = LoggingManager().get_logger("AppLogger")
    qna_session_mgr = SessionManager().get_session(session_id)
    resume["candidate"]["target_position"] = qna_session_mgr["jd_meta"].get('basic_info', {}).get('job_title', 'Job title not available')

    app_logger.info(f"Generated interview summary:\n{resume}")
    return resume