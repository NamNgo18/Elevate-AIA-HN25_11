import datetime
import os
from pathlib import Path
from app.utilities.csv_utils import CsvUtils
import app.utilities.content_2_json as Content2Json
import app.utilities.text_extraction_utils as TextractUtils
import json
from dotenv import load_dotenv
from data.schema import JD_SCHEMA

# --- Pre-config ---
# 1. Define your absolute base directory
BASE_DIR = Path(__file__).parent.parent.parent.resolve()

# 2. Create the full, absolute path to your .env file
ENV_FILE_PATH = BASE_DIR / ".env"

# 3. Load the .env file using its absolute path
load_dotenv(ENV_FILE_PATH)
# --- Other paths ---
UPLOAD_DIRECTORY = BASE_DIR / "data" / "upload" / "JD"
META_DATA_FILE_PATH = UPLOAD_DIRECTORY / "jd_file.csv"

# Schema: "id" is the unique UUid, "name" is the original uploaded filename
DATA_SCHEMA = ["id", "name","uploadBy","uploadDate"]

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
    1. Determines the next sequential ID (e.g., JD-001).
    2. Saves the file to the upload directory with that new id.
    3. Updates the CSV metadata file.

    Args:
        original_filename (str): The original name of the file (e.g., "job.pdf").
        file_contents (bytes): The raw content of the file.
        content_type (str): The MIME type of the file.

    Returns:
        str: The newly generated sequential id (e.g., "JD-001") for the file.

    Raises:
        ValueError: If the content type is not allowed.
        Exception: If file saving or metadata update fails.
    """
    print(f"--- Uploading file: {original_filename} ---")

    if content_type not in ALLOWED_CONTENT_TYPES:
        raise ValueError(f"File type not allowed: {content_type}")

    try:
        all_jds_data = get_all()  # This is list[dict]
    except Exception as e:
        raise Exception(f"Failed to read existing metadata: {e}")

    last_id_num = 0
    if all_jds_data:
        for jd in all_jds_data:
            current_id_str = jd.get('id', '')
            if current_id_str.startswith('JD-'):
                try:
                    num_part = int(current_id_str.split('-')[-1])
                    if num_part > last_id_num:
                        last_id_num = num_part
                except (ValueError, IndexError):
                    print(f"Warning: Skipping malformed ID: {current_id_str}")
                    pass

    next_id_num = last_id_num + 1
    new_id = f"JD-{next_id_num:03d}"
    print(f"Generated new ID: {new_id}")

    file_extension = original_filename.split(".")[-1]
    save_path = UPLOAD_DIRECTORY / f"{new_id}.{file_extension}"

    try:
        with open(save_path, 'wb') as f:
            f.write(file_contents)
        print(f"File saved to: {save_path}")
    except IOError as e:
        raise Exception(f"Failed to save file: {e}")

    try:
        # Create JSON DATA FILE
        now = datetime.datetime.now().strftime("%Y%m%d%H:%M:%S")
        json_content = __extract_data_to_json__( file_id=new_id, file_name=original_filename, time=now)
        data_to_write = _convert_dict_to_list(all_jds_data)
        data_to_write.append([new_id, original_filename, json_content['metadata']['uploaded_by'], now])
        csv_handler.write_to_csv(data_to_write)
        print(f"Successfully added metadata for id: {new_id}")

        return new_id

    except Exception as e:
        # Attempt to roll back: delete the file we just saved
        print(f"Error updating metadata: {e}. Rolling back file save...")
        if save_path.exists():
            try:
                os.remove(save_path)
                delete_by_id(new_id)
                print(f"Rolled back: Deleted {save_path}")
            except OSError as os_err:
                print(f"Rollback failed: Could not delete {save_path}. Error: {os_err}")
        raise  # Re-raise the original metadata exception

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
        file_json_path = UPLOAD_DIRECTORY / f"{id}.json"

        if file_path.exists():
            os.remove(file_path)
            os.remove(file_json_path)
            print(f"Deleted file: {file_path}")
            print(f"Deleted file: {file_json_path}")
        else:
            print(f"Warning: File not found on disk, but deleting metadata: {file_path}")

    except Exception as e:
        print(f"Error deleting file: {e}")
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


def __extract_data_to_json__(file_name: str, file_id: str, time: str):
    print(f"--- Extracting2JSON data from {UPLOAD_DIRECTORY} ---")
    json_file_path = UPLOAD_DIRECTORY / f"{file_id}.json"
    meta_data_content = f"""
    ==PRE DATA TO REFERENCE IF OTHER NOT FOUND FIND IN THE DOCUMENT CONTENT==
            "jd_id": {file_id},
            "source_file_name": {file_name},
            "scanned_at": {time}
            "uploaded_by": <<auto_detect>> if not it will be Admin User
    ==END PRE DATA TO REFERENCE IF OTHER NOT FOUND FIND IN THE DOCUMENT CONTENT==
    """
    file_extension = file_name.split(".")[-1].strip()
    file_path = (UPLOAD_DIRECTORY / f"{file_id}.{file_extension}")
    print(f"file_extension: {file_extension}")

    if file_extension == "docx":
        file_contents = TextractUtils.extract_text_from_docx(str(file_path))
    elif file_extension == "pdf":
        file_contents = TextractUtils.extract_text_from_pdf(str(file_path))
    else:
        raise Exception(f"Unsupported file extension: {file_extension}")

    if not file_contents:  # Check for empty string
        raise Exception(f"No content found: {UPLOAD_DIRECTORY}")
    else:
        print(f"Content found: {file_contents}")
        # Extract to JSON (this now returns a dictionary)
        json_content = Content2Json.parse_content_to_json(
            content_text=meta_data_content+ file_contents ,
            parameters_schema=JD_SCHEMA
        )
        try:
            with open(json_file_path, 'w', encoding='utf-8') as f:
                json.dump(json_content, f, indent=2, ensure_ascii=False)
                print(f"Successfully wrote file: {json_file_path}")
                return json_content
        except Exception as e:
            print(f"Error writing file: {json_file_path}\n{e}")
            raise
