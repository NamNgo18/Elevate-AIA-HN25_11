import uuid
import copy

from enum                       import Enum
from threading                  import Lock

__all__ = ["SessionManager", "SessionPhase"]

# ========================================
#        QnA Session Phases
# ========================================
class SessionPhase(Enum):
    INTRO     = 1
    READINESS = 2
    INTERVIEW = 3
    WARMUP    = 4
    COMPLETED = 5
    UNKNOWN   = 99

# ========================================
#    QnA Session Manager
# ========================================
class SessionManager:
    _instance = None
    _lock = Lock()

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            with cls._lock:
                if not cls._instance:
                    cls._instance = super(SessionManager, cls).__new__(cls)         
                    cls._instance._sessions     = {}
                    cls._instance._session_lock = Lock()
        return cls._instance

    def create_session(self, **kwargs) -> str:
        with self._session_lock:
            session_id = str(uuid.uuid4().hex[-8:])
            self._sessions[session_id] = {
                "phase": kwargs.get("phase_state", SessionPhase.UNKNOWN),
                "question": {
                    "total": kwargs.get("total_question", 0),
                    "current": kwargs.get("current_question", 0),
                    "items": kwargs.get("question_items", [])
                },
                "jd_meta": kwargs.get("jd_meta", []),
                "cv_meta": kwargs.get("cv_meta", []),
                "conversation_history": [{"role": "system", "content": kwargs.get("sys_prompt", None)}]
            }
            return session_id
    
    def get_session(self, session_id: str = None) -> str:
        return self._sessions.get(session_id) if session_id else None
    
    def get_trim_history(self, session_id: str = None, max_hst: int = 20, msg_nb_first: int = 6) -> list:
        if session_id not in self._sessions:
            return None

        # Safety copy
        chat_hst = copy.deepcopy(self._sessions[session_id]["conversation_history"])
        if len(chat_hst) <= max_hst:
            return chat_hst

        stat = min(msg_nb_first, max_hst)
        end = max_hst - stat
        return chat_hst[:stat] + chat_hst[-end:] if end > 0 else chat_hst[:]

    def delete_session(self, session_id: str = None) -> bool:
        with self._session_lock:
            if session_id in self._sessions:
                del self._sessions[session_id]
                return True
            return False