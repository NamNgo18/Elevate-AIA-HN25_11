import uuid
import speech_recognition    as srecognizer

from gtts                       import gTTS
from pathlib                    import Path
from ..utilities.log_manager    import LoggingManager

# ========================================
__all__ = ["generate_tts", "generate_stt", "unlink_audio_file"]

# ========================================
def generate_tts(metadata: dict = None) -> str:
    '''
    Convert text to speech and save to a unique file.
    '''
    app_logger = LoggingManager().get_logger("AppLogger")
    if not metadata or not isinstance(metadata, dict):
        app_logger.error(f"Not provided the text to convert!")
        return None

    try:
        audio_file_nm = f"{Path(__file__).resolve().parents[2]}/data/audio/audio_QnA_{uuid.uuid4().hex[-8:]}.mp3"
        tts = gTTS(text = metadata.get("text", None), lang = metadata.get("lang", "en"))
        tts.save(audio_file_nm)
        app_logger.info(f"Audio saved as: {audio_file_nm}")
    except Exception as e:
        app_logger.critical(f"An error occurred: {e}")
        return None

    return audio_file_nm

# ========================================
def generate_stt(audio_link: str = None) -> str:
    '''
    Convert speech (audio file) to text. The audio file recommanded to be in WAV format.
    '''
    app_logger = LoggingManager().get_logger("AppLogger")
    if not audio_link or not isinstance(audio_link, str):
        app_logger.error(f"Not provided the audio_link!")
        return None

    try:
        audio_link = Path(audio_link)
        if not audio_link.is_absolute():
            audio_link = (Path(__file__).resolve().parents[2]/'data'/'audio'/audio_link).resolve()

        recognizer = srecognizer.Recognizer()
        with srecognizer.AudioFile(str(audio_link)) as source:
            app_logger.info("Listening to audio...")
            audio = recognizer.record(source)

        text_generated = recognizer.recognize_google(audio)
        app_logger.info(f"Recognized text: {text_generated}")
        return text_generated
    except srecognizer.UnknownValueError:
        app_logger.critical("Could not understand audio.")
    except srecognizer.RequestError as e:
        app_logger.critical(f"API error: {e}")
    except FileNotFoundError:
        app_logger.critical(f"Audio file not found at: {audio_link}")
    except Exception as e:
        app_logger.critical(f"An error occurred: {e}")
    return None

# ========================================
def unlink_audio_file(audio_link: str = None) -> bool:
    """Delete the specified file."""
    app_logger = LoggingManager().get_logger("AppLogger")
    if not audio_link or not isinstance(audio_link, str):
        app_logger.info(f"Not provided the file_name!")
        return False

    try:
        audio_link = Path(audio_link)
        if not audio_link.is_absolute():
            audio_link = (Path(__file__).resolve().parents[2]/'data'/'audio'/audio_link).resolve()

        audio_link.unlink()
        app_logger.info(f"Deleted file: {audio_link}")
    except FileNotFoundError:
        app_logger.critical(f"Already deleted or unavailable: {audio_link}")
        return False
    except Exception as e:
        app_logger.critical(f"An error occurred: {e}")
        return False

    return True