import datetime
import os
import uuid
from pathlib import Path

from openai.types import file_content

from app.utilities.csv_utils import CsvUtils
import json  # For pretty printing

# --- Pre-config ---
# Use Path.resolve() to get a guaranteed absolute path
BASE_DIR = Path(__file__).parent.parent.parent.resolve()
UPLOAD_DIRECTORY = BASE_DIR / "data" / "upload" / "JD"
META_DATA_FILE_PATH = UPLOAD_DIRECTORY / "jd_file.csv"

# Schema: "id" is the unique UUid, "name" is the original uploaded filename
DATA_SCHEMA = ["id", "name","uploadDate"]

# Initialize the CSV handler with the absolute path
try:
    csv_handler = CsvUtils(str(META_DATA_FILE_PATH), DATA_SCHEMA)
except Exception as e:
    print(f"Error initializing CsvUtils: {e}")
    print("Please ensure the path is correct and within a /data directory.")
    # In a real app, you'd exit or handle this more gracefully
    exit(1)

# Create the upload directory if it doesn't exist
if not UPLOAD_DIRECTORY.exists():
    print(f"Creating directory: {UPLOAD_DIRECTORY}")
    UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)

ALLOWED_CONTENT_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"  # docx
]


# --- Helper Function ---
def _convert_dict_to_list(data: list[dict]) -> list[list]:
    """Converts a list of dicts back to a list of lists for writing."""
    new_list_of_lists = []
    for row_dict in data:
        # Ensure order is maintained using the schema
        new_row = [row_dict.get(key, "") for key in DATA_SCHEMA]
        new_list_of_lists.append(new_row)
    return new_list_of_lists


# --- Core Functions ---
def get_all() -> list[dict]:
    """ 
    Get all JD metadata from the CSV file.

    Returns:
        list[dict]: A list of dictionaries, e.g., 
                    [{'id': '...', 'name': '...'}, ...]
    """
    print("--- Getting all JDs ---")
    try:
        return csv_handler.read_from_csv()
    except FileNotFoundError:
        print("JD metadata file not found. Returning empty list.")
        return []
    except Exception as e:
        print(f"An error occurred in get_all: {e}")
        return []


def get_by_id(id: str) -> tuple[Path, str]:
    """ 
    Finds the file path for a given JD id.

    Args:
        id (str): The UUid of the JD to find.

    Returns:
        Path: The full, absolute path to the file.

    Raises:
        FileNotFoundError: If no JD with that id is found in the metadata
                           or if the file itself is missing.
    """
    print(f"--- Getting JD by id: {id} ---")
    all_jds = get_all()

    jd_meta = next((jd for jd in all_jds if jd.get("id") == id), None)

    if not jd_meta:
        raise FileNotFoundError(f"No metadata found for JD with id: {id}")

    # Reconstruct the filename (e.g., "uuid.pdf")
    original_filename = jd_meta.get("name", "").strip()
    file_extension = original_filename.split(".")[-1]

    file_path = UPLOAD_DIRECTORY / f"{id}.{file_extension}"
    print(f"File path: {file_path}")

    if not file_path.exists():
        raise FileNotFoundError(f"File not found on disk: {file_path}")

    print(f"Found file: {file_path}")
    return file_path,original_filename


def upload(original_filename: str, file_contents: bytes, content_type: str) -> str:
    """ 
    Uploads a JD file.
    1. Saves the file to the upload directory with a unique id.
    2. Updates the CSV metadata file.

    Args:
        original_filename (str): The original name of the file (e.g., "job.pdf").
        file_contents (bytes): The raw content of the file.
        content_type (str): The MIME type of the file.

    Returns:
        str: The newly generated unique id (UUid) for the file.

    Raises:
        ValueError: If the content type is not allowed.
    """
    print(f"--- Uploading file: {original_filename} ---")

    if content_type not in ALLOWED_CONTENT_TYPES:
        raise ValueError(f"File type not allowed: {content_type}")

    # --- 1. Save the file ---

    now = datetime.datetime.now().strftime("%Y%m%d%H:%M:%S")
    new_id = str(uuid.uuid4())
    new_filename = f"{original_filename}"
    file_extension = new_filename.split(".")[-1]
    save_path = UPLOAD_DIRECTORY / f"{new_id}.{file_extension}"

    try:
        with open(save_path, 'wb') as f:
            f.write(file_contents)
        print(f"File saved to: {save_path}")
    except IOError as e:
        raise Exception(f"Failed to save file: {e}")

    # --- 2. Update the CSV metadata ---
    # NOTE: This is not concurrency-safe.
    # In a real app, use a database or file locking.
    try:
        all_jds_data = get_all()  # This is list[dict]

        # Convert back to list[list] for writing
        data_to_write = _convert_dict_to_list(all_jds_data)

        # Add the new record
        data_to_write.append([new_id, new_filename,now])

        # Write all data back
        csv_handler.write_to_csv(data_to_write)

        print(f"Successfully added metadata for id: {new_id}")
        return new_id

    except Exception as e:
        # Attempt to roll back: delete the file we just saved
        print(f"Error updating metadata: {e}. Rolling back file save...")
        if save_path.exists():
            os.remove(save_path)
            print(f"Rolled back: Deleted {save_path}")
        raise  # Re-raise the exception


def delete_by_id(id: str):
    """ 
    Deletes a JD.
    1. Deletes the file from the upload directory.
    2. Removes the row from the CSV metadata file.

    Args:
        id (str): The UUid of the JD to delete.

    Raises:
        FileNotFoundError: If no JD with that id is found.
    """
    print(f"--- Deleting JD by id: {id} ---")
    all_jds = get_all()  # list[dict]

    jd_to_delete = next((jd for jd in all_jds if jd.get("id") == id), None)

    if not jd_to_delete:
        raise FileNotFoundError(f"No metadata found for JD with id: {id}")

    # --- 1. Delete the file ---
    try:
        original_filename = jd_to_delete.get("name", "").strip()
        file_extension = original_filename.split(".")[-1]
        file_path = UPLOAD_DIRECTORY / f"{id}.{file_extension}"

        if file_path.exists():
            os.remove(file_path)
            print(f"Deleted file: {file_path}")
        else:
            print(f"Warning: File not found on disk, but deleting metadata: {file_path}")

    except Exception as e:
        print(f"Error deleting file {file_path}: {e}")
        # Decide if you want to stop or continue to delete metadata
        # For this example, we'll continue

    # --- 2. Remove from metadata and re-write CSV ---
    new_data_list = [jd for jd in all_jds if jd.get("id") != id]

    # Convert list[dict] back to list[list] for writing
    data_to_write = _convert_dict_to_list(new_data_list)

    try:
        csv_handler.write_to_csv(data_to_write)
        print(f"Successfully removed metadata for id: {id}")
    except Exception as e:
        print(f"Error re-writing metadata after deletion: {e}")
        # At this point, the file is deleted but the CSV is out of sync.
        # This is a risk of using CSV as a database.
