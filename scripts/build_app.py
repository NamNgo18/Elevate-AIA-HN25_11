import os
import sys
import time
import threading
import webbrowser
import subprocess  # <-- Use the main subprocess module

from dotenv import load_dotenv

__all__ = []

# Define the project root (one level up from this script's directory)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# ========================================
#           Configure env
# ========================================
def _config_env():
    load_dotenv()
    # Set the PYTHONPATH to the project root
    os.environ["PYTHONPATH"] = PROJECT_ROOT


# ========================================
#           Run backend FastAPI app
# ========================================
def _run_backend():
    # --- MODIFIED ---
    # Use subprocess.run() instead of Popen().
    # This is a BLOCKING call and will keep this thread alive
    # until the uvicorn server is manually stopped.
    subprocess.run([
        sys.executable,
        "-m",
        "uvicorn",
        "app.main_app:app",
        "--host",
        "127.0.0.1",
        "--port",
        "8000",
        "--reload",
        # Explicitly tell uvicorn to watch the 'app' directory
        "--reload-dir",
        os.path.join(PROJECT_ROOT, "app")
    ],
        env=os.environ,
        # Run this command *from* the project root directory
        cwd=PROJECT_ROOT
    )


# ========================================
#           Run Frontend (Streamlit)
# ========================================
def _run_frontend():
    try:
        time.sleep(2)  # Wait for backend to be ready

        # --- MODIFIED ---
        # Use subprocess.run() here as well.
        # This will keep this thread alive until streamlit is stopped.
        subprocess.run([
            sys.executable,
            "-m",
            "streamlit",
            "run",
            os.path.join("ui", "main_ui.py"),
            "server.runOnSave = true",
            "--server.port",
            "8051"
        ],
            env=os.environ,
            # Run this command *from* the project root directory
            cwd=PROJECT_ROOT
        )
    except KeyboardInterrupt:
        # This part is less important now, as subprocess.run
        # will handle the interrupt gracefully.
        print("\nUI stopped by user!")


# ========================================
#           Application Entry Point
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
        print("🚀 Starting frontend (Streamlit)...")
        ui.start()

        # Now, these .join() calls will correctly wait
        # until the threads are finished (which only happens
        # when you manually stop the servers).
        ui.join()
        be.join()

    print("👋 Both servers have been stopped. Goodbye!")