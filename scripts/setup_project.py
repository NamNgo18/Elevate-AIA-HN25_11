from pathlib import Path

__all__ = []

# ========================================
#    Write vars into .env file
# ========================================
def _setup_env_file(env_path: str = "../.env"):
    env_file_path = (Path(__file__).resolve().parent/env_path).resolve()

    if env_file_path.exists():
        print(f"{env_file_path} file already exists. Aborting to avoid overwriting.")
        return

    env_content = f"""# OpenAI API Configuration
OPENAI_API_KEY         =
OPENAI_URL             =
OPENAI_QNA_MODEL       =

# App Configuration
APP_FRONTEND_URL       = http://localhost:8501/
APP_BACKEND_URL        = http://127.0.0.1:8000/
"""
    try:
        env_file_path.parent.mkdir(parents = True, exist_ok = True)
    except Exception as e:
        raise RuntimeError(f"Unable to create: {env_file_path} - [{e}]")

    env_file_path.write_text(env_content)
    print(f"{env_file_path} has been created. Please enter your values manually later!")

# ========================================
#    Setup project vars
# ========================================
if __name__ == "__main__":
    _setup_env_file()