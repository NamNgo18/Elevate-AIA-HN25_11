# 🤖 Project Interview AI System
Welcome to **Interview AI System** — an intelligent platform designed to elevate your skills and enhance your interview experience through AI-powered insights and personalized feedback.

## ⚙️ Setup Environment

This project includes both a React.js web UI (frontend) and a Python backend.
All necessary dependencies — including npm packages for the UI and Python packages for the backend — are automatically installed using the setup script below:
Since the web UI is built using React, make sure [Node.js](https://nodejs.org/) is installed on your system - it's recommended to install the latest version. Then, install all required Python packages using pip:

```bash
python ./scripts/setup_project.py
```
This script will:
- Check for [Node.js](https://nodejs.org/), npm, python, pip installations.
- Install all required React.js dependencies.
- Install all necessary Python packages using pip
- Create .env file for using local variable

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