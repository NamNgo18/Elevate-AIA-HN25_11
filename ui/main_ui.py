import os
import streamlit as st

from dotenv     import load_dotenv
from app.utilities.log_manager import LoggingManager
from ui.utilities.api_client   import APIClient

# ========================================
#    Declare global API client, vars and initialize some instances
# ========================================
api_client: APIClient     = None
ui_logger: LoggingManager = None

def init_main_screen():
    global api_client, ui_logger
    load_dotenv()
    loggingMgr = LoggingManager()
    loggingMgr.setup_logger()
    ui_logger = LoggingManager().get_logger("UILogger")
    api_client = APIClient(os.getenv("APP_BACKEND_URL"))

# =======================================
#    Setup environment and UI screen
# =======================================
init_main_screen()

# Remove sidebar
st.set_page_config(page_title = "Interview AI", layout = "centered", initial_sidebar_state = "collapsed")

# Center content with spacing
st.markdown("<br><br><br>", unsafe_allow_html = True)
st.markdown("""
    <style>
        .css-1d391kg { display: none !important; }
        .css-18e3th9 { margin-left: 0 !important; width: 100% !important; }
        /* Hide the sidebar toggle arrow */
        button[data-testid="stExpandSidebarButton"] {
            display: none !important;
        }
                    /* Center content vertically */
        .center-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            text-align: center;
        }
        /* Make the Start button larger */
        .stButton > button {
            width: 180px;
            height: 60px;
            font-size: 18px;
            font-weight: bold;
        }
    </style>
""", unsafe_allow_html=True)
st.markdown("<h1 style = 'text-align: center;'>Welcome to the Interview App</h1>", unsafe_allow_html = True)
st.markdown("<p style = 'text-align: center;'>Click the button below to get started.</p>", unsafe_allow_html = True)

# Centered button using columns
col1, col2, col3 = st.columns([2, 1, 3])
with col2:
    if st.button("Start"):
        # switch_page("upload_pasttext")
        ui_logger.info("Start button clicked - Navigate to next page")
        response = api_client.get(
            "routes/speech/tts",
            params = {"text_in": "Hello from Streamlit!"}
        )

        if response.status_code == 200:
            result = response.json()
            st.success(f"Processed Text: {result['email']}")
        else:
            st.error("Failed to connect to FastAPI")

# st.title("Streamlit + FastAPI Demo1  ")
# user_input = st.text_input("Enter some text")

# if st.button("Send to FastAPI"):
#     if user_input:
#         response = api_client.get(
#             "routes/speech/tts",
#             params = {"text_in": user_input}
#         )

#         if response.status_code == 200:
#             result = response.json()
#             st.success(f"Processed Text: {result['email']}")
#         else:
#             st.error("Failed to connect to FastAPI")