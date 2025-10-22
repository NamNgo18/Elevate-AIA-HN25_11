# 🤖 Project Interview AI System
Welcome to **Interview AI System** — an intelligent platform designed to elevate your skills and enhance your interview experience through AI-powered insights and personalized feedback.

## ⚙️ Setup Environment
Follow these steps to set up the development environment:

1. **Install Dependencies**

Since the web UI is built using React, make sure [Node.js](https://nodejs.org/) is installed on your system - it's recommended to install the latest version. Then, install all required Python packages using pip:

   ```bash
   pip install -r ./scripts/requirements.txt
   ```
2. **Initial Project Setup**

    If this is your first time setting up the project, run the setup script:
    ```bash
    python ./scripts/setup_project.py
    ```
## 🚀 Build & Run application
Use the `build_app.py` script to build the application components:
1. **Build both Backend and Frontend:**
    ```bash
    python ./scripts/build_app.py
    ```
2. **Build only the Frontend:**
    ```bash
    python ./scripts/build_app.py -fe
    ```
3. **Build only the Backend:**
    ```bash
    python ./scripts/build_app.py -be
    ```