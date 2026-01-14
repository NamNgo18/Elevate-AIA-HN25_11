"""
Base Document Service Module

This module provides a base class for document management services (CV, JD, etc.)
to eliminate code duplication and ensure consistent behavior across document types.
"""

import datetime
import os
import json
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Optional

from app.utilities.csv_utils import CsvUtils
import app.utilities.content_2_json as Content2Json
import app.utilities.text_extraction_utils as TextractUtils
from dotenv import load_dotenv


# Base directory setup
BASE_DIR = Path(__file__).parent.parent.parent.resolve()
ENV_FILE_PATH = BASE_DIR / ".env"
load_dotenv(ENV_FILE_PATH)

# Common data schema for all document types
DATA_SCHEMA = ["id", "name", "uploadBy", "uploadDate"]

# Allowed content types for document uploads
ALLOWED_CONTENT_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"  # docx
]


class BaseDocumentService(ABC):
    """
    Abstract base class for document management services.
    Provides common functionality for CV and JD services.
    """

    def __init__(self, entity_type: str, json_schema: dict):
        """
        Initialize the document service.
        
        Args:
            entity_type: The type of entity (e.g., "CV", "JD")
            json_schema: The JSON schema for parsing document content
        """
        self.entity_type = entity_type
        self.json_schema = json_schema
        self.upload_directory = BASE_DIR / "data" / "upload" / entity_type
        self.meta_data_file_path = self.upload_directory / f"{entity_type.lower()}_file.csv"
        
        # Create the upload directory if it doesn't exist
        if not self.upload_directory.exists():
            print(f"Creating directory: {self.upload_directory}")
            self.upload_directory.mkdir(parents=True, exist_ok=True)
        
        # Initialize CSV handler
        try:
            self.csv_handler = CsvUtils(str(self.meta_data_file_path), DATA_SCHEMA)
        except Exception as e:
            print(f"Error initializing CsvUtils for {entity_type}: {e}")
            raise

    @property
    def id_prefix(self) -> str:
        """Returns the ID prefix for this entity type (e.g., 'CV-', 'JD-')"""
        return f"{self.entity_type}-"

    @property
    @abstractmethod
    def metadata_id_field(self) -> str:
        """Returns the metadata ID field name (e.g., 'cv_id', 'jd_id')"""
        pass

    def _convert_dict_to_list(self, data: list[dict]) -> list[list]:
        """Converts a list of dicts back to a list of lists for writing."""
        new_list_of_lists = []
        for row_dict in data:
            new_row = [row_dict.get(key, "") for key in DATA_SCHEMA]
            new_list_of_lists.append(new_row)
        return new_list_of_lists

    def get_all(self) -> list[dict]:
        """
        Get all document metadata from the CSV file.
        
        Returns:
            list[dict]: A list of dictionaries with document metadata
        """
        print(f"--- Getting all {self.entity_type}s ---")
        try:
            return self.csv_handler.read_from_csv()
        except FileNotFoundError:
            print(f"{self.entity_type} metadata file not found. Returning empty list.")
            return []
        except Exception as e:
            print(f"An error occurred in get_all: {e}")
            return []

    def get_by_id(self, id: str) -> tuple[Path, str]:
        """
        Finds the file path for a given document id.
        
        Args:
            id: The UUID of the document to find.
            
        Returns:
            tuple: The full path to the file and the original filename.
            
        Raises:
            FileNotFoundError: If no document with that id is found.
        """
        print(f"--- Getting {self.entity_type} by id: {id} ---")
        all_docs = self.get_all()

        doc_meta = next((doc for doc in all_docs if doc.get("id") == id), None)

        if not doc_meta:
            raise FileNotFoundError(f"No metadata found for {self.entity_type} with id: {id}")

        original_filename = doc_meta.get("name", "").strip()
        file_extension = original_filename.split(".")[-1]

        file_path = self.upload_directory / f"{id}.{file_extension}"
        print(f"File path: {file_path}")

        if not file_path.exists():
            raise FileNotFoundError(f"File not found on disk: {file_path}")

        print(f"Found file: {file_path}")
        return file_path, original_filename

    def get_analysis_by_id(self, id: str) -> dict:
        """
        Finds and reads the document analysis JSON file for a given id.
        
        Args:
            id: The UUID of the document to find.
            
        Returns:
            dict: The analysis data as a dictionary.
            
        Raises:
            FileNotFoundError: If no analysis file is found.
        """
        print(f"--- Getting {self.entity_type} analysis by id: {id} ---")
        
        json_file_path = self.upload_directory / f"{id}.json"
        print(f"JSON file path: {json_file_path}")

        if not json_file_path.exists():
            raise FileNotFoundError(f"Analysis file not found: {json_file_path}")

        try:
            with open(json_file_path, 'r', encoding='utf-8') as f:
                json_data = json.load(f)
            print(f"Successfully loaded analysis file: {json_file_path}")
            return json_data
        except json.JSONDecodeError as e:
            raise Exception(f"Invalid JSON in analysis file: {e}")
        except Exception as e:
            raise Exception(f"Error reading analysis file: {e}")

    def upload(self, original_filename: str, file_contents: bytes, content_type: str) -> str:
        """
        Uploads a document file.
        
        Args:
            original_filename: The original name of the file.
            file_contents: The raw content of the file.
            content_type: The MIME type of the file.
            
        Returns:
            str: The newly generated ID for the file.
            
        Raises:
            ValueError: If the content type is not allowed.
            Exception: If file saving or metadata update fails.
        """
        print(f"--- Uploading file: {original_filename} ---")

        if content_type not in ALLOWED_CONTENT_TYPES:
            raise ValueError(f"File type not allowed: {content_type}")

        try:
            all_docs_data = self.get_all()
        except Exception as e:
            raise Exception(f"Failed to read existing metadata: {e}")

        # Generate new ID
        last_id_num = 0
        if all_docs_data:
            for doc in all_docs_data:
                current_id_str = doc.get('id', '')
                if current_id_str.startswith(self.id_prefix):
                    try:
                        num_part = int(current_id_str.split('-')[-1])
                        if num_part > last_id_num:
                            last_id_num = num_part
                    except (ValueError, IndexError):
                        print(f"Warning: Skipping malformed ID: {current_id_str}")
                        pass

        next_id_num = last_id_num + 1
        new_id = f"{self.id_prefix}{next_id_num:03d}"
        print(f"Generated new ID: {new_id}")

        file_extension = original_filename.split(".")[-1]
        save_path = self.upload_directory / f"{new_id}.{file_extension}"

        try:
            with open(save_path, 'wb') as f:
                f.write(file_contents)
            print(f"File saved to: {save_path}")
        except IOError as e:
            raise Exception(f"Failed to save file: {e}")

        try:
            # Create JSON DATA FILE
            now = datetime.datetime.now().strftime("%Y%m%d%H:%M:%S")
            json_content = self._extract_data_to_json(file_id=new_id, file_name=original_filename, time=now)
            data_to_write = self._convert_dict_to_list(all_docs_data)
            data_to_write.append([new_id, original_filename, json_content['metadata']['uploaded_by'], now])
            self.csv_handler.write_to_csv(data_to_write)
            print(f"Successfully added metadata for id: {new_id}")

            return new_id

        except Exception as e:
            # Attempt to roll back: delete the file we just saved
            print(f"Error updating metadata: {e}. Rolling back file save...")
            if save_path.exists():
                try:
                    os.remove(save_path)
                    self.delete_by_id(new_id)
                    print(f"Rolled back: Deleted {save_path}")
                except OSError as os_err:
                    print(f"Rollback failed: Could not delete {save_path}. Error: {os_err}")
            raise

    def delete_by_id(self, id: str):
        """
        Deletes a document.
        
        Args:
            id: The UUID of the document to delete.
            
        Raises:
            FileNotFoundError: If no document with that id is found.
        """
        print(f"--- Deleting {self.entity_type} by id: {id} ---")
        all_docs = self.get_all()

        doc_to_delete = next((doc for doc in all_docs if doc.get("id") == id), None)

        if not doc_to_delete:
            raise FileNotFoundError(f"No metadata found for {self.entity_type} with id: {id}")

        # 1. Delete the file
        try:
            original_filename = doc_to_delete.get("name", "").strip()
            file_extension = original_filename.split(".")[-1]
            file_path = self.upload_directory / f"{id}.{file_extension}"
            file_json_path = self.upload_directory / f"{id}.json"

            if file_path.exists():
                os.remove(file_path)
                print(f"Deleted file: {file_path}")
            if file_json_path.exists():
                os.remove(file_json_path)
                print(f"Deleted file: {file_json_path}")
            else:
                print(f"Warning: File not found on disk, but deleting metadata: {file_path}")

        except Exception as e:
            print(f"Error deleting file: {e}")

        # 2. Remove from metadata and re-write CSV
        new_data_list = [doc for doc in all_docs if doc.get("id") != id]
        data_to_write = self._convert_dict_to_list(new_data_list)

        try:
            self.csv_handler.write_to_csv(data_to_write)
            print(f"Successfully removed metadata for id: {id}")
        except Exception as e:
            print(f"Error re-writing metadata after deletion: {e}")

    def _extract_data_to_json(self, file_name: str, file_id: str, time: str) -> dict:
        """
        Extract document data and save as JSON.
        
        Args:
            file_name: Original filename
            file_id: Generated file ID
            time: Upload timestamp
            
        Returns:
            dict: The extracted JSON content
        """
        print(f"--- Extracting2JSON data from {self.upload_directory} ---")
        json_file_path = self.upload_directory / f"{file_id}.json"
        meta_data_content = f"""
    ==PRE DATA TO REFERENCE IF OTHER NOT FOUND FIND IN THE DOCUMENT CONTENT==
            "{self.metadata_id_field}": {file_id},
            "source_file_name": {file_name},
            "scanned_at": {time}
            "uploaded_by": find in the document. Admin User as a default value in case not found
    ==END PRE DATA TO REFERENCE IF OTHER NOT FOUND FIND IN THE DOCUMENT CONTENT==
    """
        file_extension = file_name.split(".")[-1].strip()
        file_path = self.upload_directory / f"{file_id}.{file_extension}"
        print(f"file_extension: {file_extension}")

        if file_extension == "docx":
            file_contents = TextractUtils.extract_text_from_docx(str(file_path))
        elif file_extension == "pdf":
            file_contents = TextractUtils.extract_text_from_pdf(str(file_path))
        else:
            raise Exception(f"Unsupported file extension: {file_extension}")

        if not file_contents:
            raise Exception(f"No content found: {self.upload_directory}")
        else:
            print(f"Content found: {file_contents}")
            json_content = Content2Json.parse_content_to_json(
                content_text=meta_data_content + file_contents,
                parameters_schema=self.json_schema
            )
            try:
                with open(json_file_path, 'w', encoding='utf-8') as f:
                    json.dump(json_content, f, indent=2, ensure_ascii=False)
                    print(f"Successfully wrote file: {json_file_path}")
                    return json_content
            except Exception as e:
                print(f"Error writing file: {json_file_path}\n{e}")
                raise
