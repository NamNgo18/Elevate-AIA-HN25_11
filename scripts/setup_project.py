import sys
import shutil
import subprocess
from pathlib                import Path
from packaging.version      import Version, InvalidVersion
from packaging.requirements import Requirement

__all__ = []

# ========================================
#    Utility Functions
# ========================================
def _check_tool_installed(tool_name: str) -> bool:
    """Check if a command-line tool is available on PATH."""
    return shutil.which(tool_name) is not None

def _run_command(cmd_in: str = "", cwd = None):
    """Run a shell command and stream its output (raises on failure)."""
    cmd = ' '.join(str(i) for i in cmd_in)
    print(f"\n✅ Running: {cmd} (cwd = {cwd or Path.cwd()})")
    try:
        subprocess.run(cmd, cwd = cwd, check = True)
        print("✅ Command finished successfully!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Command failed: {e}")
        sys.exit(1)

# ========================================
#    NPM: Simple `npm install`
# ========================================
def _npm_install(react_actual_path: str = ""):
    """Run 'npm install' inside the React project directory."""
    if not _check_tool_installed("npm"):
        print("❌ npm not found. Please install Node.js and npm first.")
        sys.exit(1)

    project_dir = Path(react_actual_path).resolve()
    if not (project_dir/"package.json").exists():
        print(f"❌ No package.json found in {project_dir}")
        sys.exit(1)

    print(f"✅ Running 'npm install' in {project_dir}")
    _run_command(["npm", "install"], cwd = str(project_dir))

# ========================================
#    PIP Installation (requirements.txt)
# ========================================
def _get_installed_pip_versions() -> dict:
    """Return {package_name: version} for all installed pip packages."""
    try:
        result = subprocess.check_output([sys.executable, "-m", "pip", "freeze"], text = True)
    except subprocess.CalledProcessError:
        return {}

    packages = {}
    for line in result.splitlines():
        if "==" in line:
            name, version = line.strip().split("==", 1)
            packages[name.lower()] = version
    return packages

def _get_required_pip_requirements(requirements_path: str = None) -> list[Requirement]:
    """Parse all requirement lines into Requirement objects."""
    req = Path(requirements_path)
    if not req.exists():
        print(f"❌ requirements.txt not found at: {req.resolve()}")
        sys.exit(1)

    requirements = []
    with req.open() as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            try:
                requirements.append(Requirement(line))
            except Exception as e:
                print(f"⚠️ Skipping invalid requirement '{line}': {e}")
    return requirements

def _install_pip_dependencies(requirements_path: str = None):
    if not _check_tool_installed("pip"):
        print("❌ pip not found. Please install Python and pip first.")
        sys.exit(1)

    print("\n=== Checking pip packages (with version awareness) ===")
    installed = _get_installed_pip_versions()
    required_reqs = _get_required_pip_requirements(requirements_path)

    missing_or_mismatch = []
    for req in required_reqs:
        name = req.name.lower()
        installed_version = installed.get(name)

        # Not installed
        if not installed_version:
            missing_or_mismatch.append(str(req))
            continue

        # Check version constraints
        try:
            ver = Version(installed_version)
            if not req.specifier.contains(ver, prereleases = True):
                missing_or_mismatch.append(str(req))
        except InvalidVersion:
            missing_or_mismatch.append(str(req))

    if missing_or_mismatch:
        print(f"📦 Installing/Updating: {', '.join(missing_or_mismatch)}")
        _run_command([sys.executable, "-m", "pip", "install", "-r", requirements_path])
    else:
        print("✅ All Python packages (and versions) satisfy requirements. Skipping install.")

# ========================================
#    Write vars into .env file
# ========================================
def _setup_env_file(env_path: str = "../.env", env_content: str = ""):
    if not env_content.strip():
        raise ValueError("env_content is empty — please provide environment variables content.")

    env_file_path = (Path(__file__).resolve().parent / env_path).resolve()

    if env_file_path.exists():
        print(f"⚠️ {env_file_path} already exists. Aborting to avoid overwriting.")
        return

    try:
        env_file_path.parent.mkdir(parents=True, exist_ok=True)
    except Exception as e:
        raise RuntimeError(f"❌ Unable to create {env_file_path} - [{e}]")

    env_file_path.write_text(env_content)
    print(f"✅ {env_file_path} has been created. Please fill in your values manually later!")

# ========================================
#    Main Entry Point
# ========================================
if __name__ == "__main__":
    script_path = Path(__file__).resolve().parent
    react_actual_path = (script_path.parent/"requirements.txt").resolve()
    requirements_path = (script_path/"requirements.txt").resolve()
    env_file_path = (script_path.parent/".env").resolve()

    env_content_fix = f"""# OpenAI API Configuration
OPENAI_API_KEY         =
OPENAI_URL             =
OPENAI_QNA_MODEL       =

# App Configuration
APP_FRONTEND_URL       = http://localhost:3000/
APP_BACKEND_URL        = http://127.0.0.1:8000/
"""

    # _npm_install(react_actual_path)
    _install_pip_dependencies(requirements_path)
    _setup_env_file(env_path = env_file_path, env_content = env_content_fix)

    print("\n🎉 Setup complete! Your project is ready to run.")
