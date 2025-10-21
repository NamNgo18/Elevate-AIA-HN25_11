from fastapi import APIRouter
from ..utilities.log_manager import LoggingManager

router = APIRouter()

@router.get("/tts")
def do_text_to_speech(text_in: str):
    app_logger = LoggingManager().get_logger("AppLogger")
    app_logger.debug(f"input is: {text_in}")
    return {"username": "john_doe", "email": "john@example.com"}