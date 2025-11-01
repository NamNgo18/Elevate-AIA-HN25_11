from fastapi                  import  FastAPI
from fastapi.middleware.cors  import  CORSMiddleware

from dotenv                     import  load_dotenv
from app.utilities.log_manager  import  LoggingManager

# ========================================
#           setup config
# ========================================
def _setup_confg() -> None:
    load_dotenv()
    loggingMgr = LoggingManager()
    loggingMgr.setup_logger()

# ========================================
#           API routes
# ========================================
def _setup_api(app: FastAPI = None) -> None:
    if not app:
        raise RuntimeError("Unable to identify the FAST application..")

    # Import routers
    from app.routes.speech              import  router  as  speech_router
    from app.utilities.openAI_helper    import  OpenAIHelper
    from app.routes.jd import router as jd_router
    # Initialize OpenAI Helper singleton
    OpenAIHelper()
    from app.routes.speech  import  router  as  speech_router

    # Setup CORS to allow Streamlit frontend to call backend
    app.add_middleware(
        CORSMiddleware,
        allow_origins = ["*"],
        allow_methods = ["*"],
        allow_headers = ["*"]
    )
    # Include API routes
    app.include_router(speech_router, prefix = "/routes/speech")
    app.include_router(jd_router, prefix="/jd")

# ========================================
#           Backend FastAPI app
# ========================================
if __name__ != "__main__":
    """
    Initialize FastAPI `app` at import time so external runners (uvicorn -m app.main_app:app)
    can import this module and find the `app` object. Running inside the "__main__"
    which caused the build scripts to fail.
    """
    app = FastAPI()
    _setup_confg()
    _setup_api(app)