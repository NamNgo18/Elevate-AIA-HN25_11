import asyncio

from fastapi                    import APIRouter, status, Query, Request
from fastapi.responses          import JSONResponse
from ..utilities.log_manager    import LoggingManager
from ..utilities.voice_recorder import VoiceRecorder
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
async def get_speech_to_text(param_in: Request) -> dict:
    app_logger = LoggingManager().get_logger("AppLogger")
    result: dict = {"text": None, "error": None}
    audio_path: str = param_in.query_params.get("audio_path", None)
    app_logger.info(f"NAM: {audio_path}")
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
@router.post("/voice")
def hanlde_start_record_voice(param_in: Request):
    result: dict = {
        "is_recorded": False,
        "audio_path": None,
        "error": None
    }
    app_logger = LoggingManager().get_logger("AppLogger")
    action: str = param_in.query_params.get("action", None)
    if not action:
        app_logger.error("Invalid param pass through..")
        result["error"] = "Invalid param pass through.."
        return JSONResponse(content = result, status_code = status.HTTP_400_BAD_REQUEST)

    if action == "start":
        resp_voice_rec = VoiceRecorder().start()
        resp_voice_err = "Failed to start recording voice."
    elif action == "stop":
        resp_voice_rec = VoiceRecorder().stop()
        result["audio_path"] = str(resp_voice_rec) if resp_voice_rec else None
        resp_voice_err = "Failed to stop recorder."
    else:
        resp_voice_rec = None
        resp_voice_err = "Invalid param to perform action."

    if not resp_voice_rec:
        app_logger.error(resp_voice_err)
        result["error"] = resp_voice_err
        return JSONResponse(content = result, status_code = status.HTTP_400_BAD_REQUEST)

    result["is_recorded"] = True
    return JSONResponse(content = result, status_code = status.HTTP_200_OK)

# =======================================
@router.delete("/audio")
def delete_audio_file(param_in: Request) -> dict:
    app_logger = LoggingManager().get_logger("AppLogger")
    result: dict = {"deleted": False, "error": None}
    audio_path: str = param_in.query_params.get("audio_path", None)
    is_deleted: bool = speech_convertor.unlink_audio_file(audio_path)
    if not is_deleted:
        result["error"] = f"Failed to delete the audio file: {audio_path}"
        app_logger.error(result["error"])
        return JSONResponse(content = result, status_code = status.HTTP_400_BAD_REQUEST)

    result["deleted"] = True
    app_logger.info("Handle delete audio file successfully.")
    return JSONResponse(content = result, status_code = status.HTTP_200_OK)

