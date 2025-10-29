import sys
import shutil
import subprocess
import json
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

def _run_command(cmd_in: list[str], cwd=None):
    """Run a shell command and stream its output (raises on failure)."""
    cmd_str_for_printing = ' '.join(str(i) for i in cmd_in)
    print(f"\n✅ Running: {cmd_str_for_printing} (cwd = {cwd or Path.cwd()})")
    try:
        subprocess.run(cmd_in, cwd=cwd, check=True, shell=(sys.platform == "win32"))
        print("✅ Command finished successfully!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Command failed: {e}")
        sys.exit(1)

# ========================================
#    PNPM: Simple `pnpm install`
# ========================================

def _pnpm_install(react_project_dir: str = "ui"):
    """Run 'pnpm install' in the React project if needed."""
    if not _check_tool_installed("pnpm"):
        print("❌ pnpm not found. Please install pnpm first (npm i -g pnpm).")
        sys.exit(1)

    project_dir = (Path(__file__).resolve().parent.parent / react_project_dir).resolve()
    package_json_path = project_dir / "package.json"
    node_modules_dir = project_dir / "node_modules"

    if not package_json_path.exists():
        print(f"❌ No package.json found in {project_dir}")
        sys.exit(1)

    print(f"✅ Checking frontend dependencies in {project_dir}")

    # Load required dependencies from package.json
    with package_json_path.open("r", encoding="utf-8") as f:
        package_data = json.load(f)

    required_deps = set()
    for section in ("dependencies", "devDependencies"):
        if section in package_data:
            required_deps.update(package_data[section].keys())

    # If node_modules doesn't exist, we must install
    if not node_modules_dir.exists():
        print("📦 node_modules not found — running pnpm install...")
        _run_command(["pnpm", "install"], cwd=str(project_dir))
        return

    # Check if all dependencies exist inside node_modules
    missing = []
    for dep in required_deps:
        dep_path = node_modules_dir / dep
        if not dep_path.exists():
            missing.append(dep)

    if missing:
        print(f"📦 Missing dependencies detected")
        print("🔧 Running pnpm install to fix...")
        _run_command(["pnpm", "install"], cwd=str(project_dir))
    else:
        print("✅ All dependencies already installed. Skipping pnpm install.")

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
#    Write .env files from template
# ========================================
def _setup_env_file_from_template(template_path: Path, output_path: Path):
    """
    Copy a template .env file if it doesn't already exist.
    """
    if not template_path.exists():
        print(f"❌ Template not found: {template_path}")
        return

    if output_path.exists():
        print(f"⚠️ {output_path} already exists. Skipping to avoid overwriting.")
        return

    try:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(template_path, output_path)
        print(f"✅ Created {output_path} from {template_path}")
    except Exception as e:
        raise RuntimeError(f"❌ Unable to create {output_path}: {e}")

# ========================================
#    Main Entry Point
# ========================================
if __name__ == "__main__":
    script_path = Path(__file__).resolve().parent
    project_root = script_path.parent
    requirements_path = script_path / "requirements.txt"

    backend_template = project_root / ".env.example"
    backend_env = project_root / ".env"

    frontend_template = project_root / "ui" / ".env.example"
    frontend_env = project_root / "ui" / ".env"

    _pnpm_install("ui")
    _install_pip_dependencies(requirements_path)

    _setup_env_file_from_template(backend_template, backend_env)
    _setup_env_file_from_template(frontend_template, frontend_env)

    print("\n🎉 Setup complete! Your project is ready to run.")
