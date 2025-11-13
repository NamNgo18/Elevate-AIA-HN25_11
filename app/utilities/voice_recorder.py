import uuid
import sounddevice      as sd
import numpy            as np

from pathlib            import Path
from scipy.io.wavfile   import write
from threading          import Lock
from .log_manager       import LoggingManager

__all__ = ["VoiceRecorder"]

class VoiceRecorder:
    _instance = None
    _lock = Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(VoiceRecorder, cls).__new__(cls)
                cls._instance.file_path_nm = None
                cls._instance.sample_rate = 44100
                cls._instance.recording = False
                cls._instance.frames = []
        return cls._instance

    def _callback(self, indata, frames, time, status):
        if self.recording:
            self.frames.append(indata.copy())

    def start(self) -> bool:
        app_logger = LoggingManager().get_logger("AppLogger")
        if self.recording:
            app_logger.info("Already recording!")
            return False

        try:
            self.file_path_nm = Path(__file__).resolve().parents[2]/'data'/'audio'/'audio_QnA_'f'{uuid.uuid4().hex[-8:]}.wav'
            self.frames = []
            self.recording = True
            self.stream = sd.InputStream(
                samplerate = self.sample_rate,
                channels   = 2,
                callback   = self._callback
            )
            self.stream.start()
            app_logger.info(f"Recording started: {self.file_path_nm}")
            return True
        except Exception as e:
            app_logger.error(f"Error start recording voice: {e}")
            return False

    def stop(self) -> str:
        app_logger = LoggingManager().get_logger("AppLogger")
        if not self.recording:
            app_logger.info("Not recording!")
            return None
        try:
            self.recording = False
            self.stream.stop()
            self.stream.close()
            audio_data = np.concatenate(self.frames, axis = 0)
            write(self.file_path_nm, self.sample_rate, audio_data)
            app_logger.info(f"Audio file saved at: {self.file_path_nm}")
            return self.file_path_nm
        except Exception as e:
            app_logger.error(f"Error saving audio: {e}")
            return None