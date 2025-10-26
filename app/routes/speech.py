import asyncio

from fastapi                    import status
from fastapi                    import APIRouter
from fastapi.responses          import JSONResponse
from ..utilities.log_manager    import LoggingManager
from ..services                 import speech_convertor

router = APIRouter()

# =======================================
@router.post("/tts")
async def get_text_to_speech(text_in: str = "") -> dict:
    app_logger = LoggingManager().get_logger("AppLogger")
    result: dict = {"audio_path": None, "error": None}

    try:
        audio_path: str = await asyncio.wait_for(
            asyncio.to_thread(speech_convertor.generate_tts,
                                {"text": text_in, "lang": "en"}
                        ),
            timeout = 30
        )
    except asyncio.TimeoutError:
        app_logger.error("Text to speech conversion timed out.")
        result["error"] = "Text to speech conversion timed out."
        return JSONResponse(content = result, status_code = status.HTTP_504_GATEWAY_TIMEOUT)

    if not audio_path:
        app_logger.error("Failed to convert text to speech.")
        result["error"] = "Failed to convert text to speech."
        return JSONResponse(content = result, status_code = status.HTTP_400_BAD_REQUEST)

    result["audio_path"] = audio_path
    app_logger.info("Handle convert text to speech successfully.")
    return JSONResponse(content = result, status_code = status.HTTP_200_OK)

# =======================================
@router.post("/stt")
async def get_speech_to_text(audio_path: str = None) -> dict:
    app_logger = LoggingManager().get_logger("AppLogger")
    result: dict = {"text": None, "error": None}

    try:
        text_converted: str = await asyncio.wait_for(
            asyncio.to_thread(speech_convertor.generate_stt ,audio_path),
            timeout = 40
        )
    except asyncio.TimeoutError:
        app_logger.error("Speech to text conversion timed out.")
        result["error"] = "Speech to text conversion timed out."
        return JSONResponse(content = result, status_code = status.HTTP_504_GATEWAY_TIMEOUT)

    if not text_converted:
        app_logger.error("Failed to convert speech to text.")
        result["error"] = "Failed to convert speech to text."
        return JSONResponse(content = result, status_code = status.HTTP_400_BAD_REQUEST)

    result["text"] = text_converted
    app_logger.info("Handle convert speech to text successfully.")
    return JSONResponse(content = result, status_code = status.HTTP_200_OK)

# =======================================
@router.delete("/audio")
def delete_audio_file(file_path: str = None) -> dict:
    app_logger = LoggingManager().get_logger("AppLogger")
    result: dict = {"deleted": False, "error": None}

    is_deleted: bool = speech_convertor.unlink_audio_file(file_path)
    if not is_deleted:
        app_logger.error("Failed to delete the audio file.")
        result["error"] = "Failed to delete the audio file."
        return JSONResponse(content = result, status_code = status.HTTP_400_BAD_REQUEST)

    result["deleted"] = True
    app_logger.info("Handle delete audio file successfully.")
    return JSONResponse(content = result, status_code = status.HTTP_200_OK)

