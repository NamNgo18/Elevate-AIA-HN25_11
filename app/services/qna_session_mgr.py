import uuid

from enum                       import Enum
from threading                  import Lock
from ..utilities.log_manager    import LoggingManager

__all__ = ["SessionManager", "SessionPhase"]

# ========================================
#        QnA Session Phases
# ========================================
class SessionPhase(Enum):
    INTRO           = 1
    READINESS       = 2
    INTERVIEW       = 3
    POST_INTERVIEW  = 4
    COMPLETED       = 5
    UNKNOWN         = 99

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
                "conversation_history": [{"role": "system", "content": kwargs.get("sys_prompt", None)}]
            }
            return session_id
    
    def get_session(self, session_id: str = None) -> str:
        return self._sessions.get(session_id) if session_id else None
    
    def delete_session(self, session_id: str = None) -> bool:
        with self._session_lock:
            if session_id in self._sessions:
                del self._sessions[session_id]
                return True
            return False