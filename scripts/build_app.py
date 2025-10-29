import os
import sys
import time
import threading
import webbrowser
import subprocess
from dotenv import load_dotenv

__all__ = []

# ========================================
#           Project Root
# ========================================
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# ========================================
#           Configure env
# ========================================
def _config_env():
    load_dotenv()
    os.environ["PYTHONPATH"] = PROJECT_ROOT


# ========================================
#           Run backend FastAPI app
# ========================================
def _run_backend():
    subprocess.run([
        sys.executable,
        "-m",
        "uvicorn",
        "app.main_app:app",
        "--host", "127.0.0.1",
        "--port", "8000",
        "--reload",
        "--reload-dir", os.path.join(PROJECT_ROOT, "app")
    ],
        cwd=PROJECT_ROOT,
        env=os.environ,
        shell=(sys.platform == "win32")  # ✅ fixes Windows path lookup
    )


# ========================================
#           Run Frontend (Next.js)
# ========================================
def _run_frontend():
    try:
        time.sleep(2)
        script_dir = os.path.dirname(os.path.abspath(__file__))
        ui_dir = os.path.abspath(os.path.join(script_dir, "..", "ui"))

        # ✅ Use pnpm.cmd on Windows, pnpm on others
        pnpm_cmd = "pnpm.cmd" if sys.platform == "win32" else "pnpm"
        webbrowser.open(os.getenv("APP_FRONTEND_URL").rstrip("/"))

        subprocess.Popen(
            [pnpm_cmd, "dev"],
            cwd=ui_dir,
            env=os.environ,
            shell=(sys.platform == "win32"),  # ✅ allow PATH resolution
        )
    except KeyboardInterrupt:
        webbrowser.open(os.getenv("APP_FRONTEND_URL").rstrip("/"))
        print("UI stopped by user!")


# ========================================
#           Entry Point
# ========================================
if __name__ == "__main__":
    _config_env()

    ui = threading.Thread(target=_run_frontend)
    be = threading.Thread(target=_run_backend)
    args_lower = [arg.lower() for arg in sys.argv[1:]]

    if args_lower == ["-fe"]:
        ui.start()
        ui.join()
    elif args_lower == ["-be"]:
        be.start()
        be.join()
    else:
        print("🚀 Starting backend (FastAPI)...")
        be.start()
        print("🚀 Starting frontend (Next.js)...")
        ui.start()
        ui.join()
        be.join()

    print("👋 Both servers have been stopped. Goodbye!")
