"""
Job Description Service Module

This module provides JD-specific document management functionality,
extending the BaseDocumentService for JD-specific operations.
"""

from data.schema import JD_SCHEMA
from .base_document_service import BaseDocumentService


class JDService(BaseDocumentService):
    """Job Description Document Service - handles JD file management."""
    
    def __init__(self):
        super().__init__(entity_type="JD", json_schema=JD_SCHEMA)
    
    @property
    def metadata_id_field(self) -> str:
        return "jd_id"


# Create singleton instance for backward compatibility
_jd_service_instance = JDService()


# Expose module-level functions for backward compatibility with existing code
def get_all():
    """Get all JD metadata from the CSV file."""
    return _jd_service_instance.get_all()


def get_by_id(id: str):
    """Finds the file path for a given JD id."""
    return _jd_service_instance.get_by_id(id)


def get_analysis_by_id(id: str):
    """Finds and reads the JD analysis JSON file for a given JD id."""
    return _jd_service_instance.get_analysis_by_id(id)


def upload(original_filename: str, file_contents: bytes, content_type: str):
    """Uploads a JD file."""
    return _jd_service_instance.upload(original_filename, file_contents, content_type)


def delete_by_id(id: str):
    """Deletes a JD."""
    return _jd_service_instance.delete_by_id(id)
