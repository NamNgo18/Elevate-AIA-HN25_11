from fastapi                      import  APIRouter
from fastapi.responses            import  JSONResponse, status
from ..utilities.log_manager      import  LoggingManager
from ..services.speech_convertor  import  *

router = APIRouter()

# =======================================
@router.get("/tts")
def get_text_to_speech(text_in: str = "") -> dict:
    app_logger = LoggingManager().get_logger("AppLogger")
    result: dict = {"audio_path": None, "error": None}

    audio_path: str = tts_generation({"text": text_in, "lang": "en"})
    if not audio_path:
        app_logger.error("Failed to convert text to speech.")
        result["error"] = "Failed to convert text to speech."
        return JSONResponse(content = result, status_code = status.HTTP_400_BAD_REQUEST)

    result["audio_path"] = audio_path
    app_logger.info("Handle convert text to speech successfully.")
    return JSONResponse(content = result, status_code = status.HTTP_200_OK)

# =======================================
@router.get("/stt")
def get_speech_to_text(audio_path: str = None) -> dict:
    app_logger = LoggingManager().get_logger("AppLogger")
    result: dict = {"text": None, "error": None}

    text_converted: str = stt_generation(audio_path)
    if not text_converted:
        app_logger.error("Failed to convert speech to text.")
        result["error"] = "Failed to convert speech to text."
        return JSONResponse(content = result, status_code = status.HTTP_400_BAD_REQUEST)

    result["text"] = text_converted
    app_logger.info("Handle convert speech to text successfully.")
    return JSONResponse(content = result, status_code = status.HTTP_200_OK)

# =======================================
@router.delete("/audio")
def del_audio_file(file_name: str = None) -> dict:
    app_logger = LoggingManager().get_logger("AppLogger")
    result: dict = {"deleted": False, "error": None}

    is_deleted: bool = unlink_audio(file_name)
    if not is_deleted:
        app_logger.error("Failed to delete the audio file.")
        result["error"] = "Failed to delete the audio file."
        return JSONResponse(content = result, status_code = status.HTTP_400_BAD_REQUEST)

    result["deleted"] = True
    app_logger.info("Handle delete audio file successfully.")
    return JSONResponse(content = result, status_code = status.HTTP_200_OK)

