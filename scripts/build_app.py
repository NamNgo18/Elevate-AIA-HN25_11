import os
import sys
import time
import threading
import webbrowser
import subprocess

from dotenv     import load_dotenv

__all__ = []

# ========================================
#           Configure env
# ========================================
def _config_env():
    load_dotenv()
    os.environ["PYTHONPATH"] = '.'

# ========================================
#           Run backend FastAPI app
# ========================================
def _run_backend():
    subprocess.Popen([
        sys.executable,
        "-m",
        "uvicorn",
        "app.main_app:app",
        "--host",
        "127.0.0.1",
        "--port",
        "8000",
        "--reload"
    ], env = os.environ)

# ========================================
#           Run Frontend (Streamlit)
# ========================================
def _run_frontend():
    try:
        time.sleep(2)
        subprocess.Popen([
            sys.executable,
            "-m",
            "streamlit",
            "run",
            os.path.join("ui", "main_ui.py"),
            "server.runOnSave = true",
            "--server.port",
            "8051"
        ], env = os.environ)
    except KeyboardInterrupt:
        webbrowser.open(os.getenv("APP_FRONTEND_URL").rstrip("/"))
        print("UI stopped by user!")

# ========================================
#           Application Entry Point
# ========================================
if __name__ == "__main__":
    _config_env()
    ui = threading.Thread(target = _run_frontend)
    be = threading.Thread(target = _run_backend)
    args_lower = [arg.lower() for arg in sys.argv[1:]]
    if args_lower == ["-fe"]:
        ui.start()
        ui.join()
    elif args_lower == ["-be"]:
        be.start()
        be.join()
    else:
        be.start()
        ui.start()
        ui.join()
        be.join()
