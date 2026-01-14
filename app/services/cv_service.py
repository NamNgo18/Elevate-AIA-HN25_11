"""
CV Service Module

This module provides CV-specific document management functionality,
extending the BaseDocumentService for CV-specific operations.
"""

from data.schema import CV_SCHEMA
from .base_document_service import BaseDocumentService


class CVService(BaseDocumentService):
    """CV Document Service - handles CV file management."""
    
    def __init__(self):
        super().__init__(entity_type="CV", json_schema=CV_SCHEMA)
    
    @property
    def metadata_id_field(self) -> str:
        return "cv_id"


# Create singleton instance for backward compatibility
_cv_service_instance = CVService()


# Expose module-level functions for backward compatibility with existing code
def get_all():
    """Get all CV metadata from the CSV file."""
    return _cv_service_instance.get_all()


def get_by_id(id: str):
    """Finds the file path for a given CV id."""
    return _cv_service_instance.get_by_id(id)


def get_analysis_by_id(id: str):
    """Finds and reads the CV analysis JSON file for a given CV id."""
    return _cv_service_instance.get_analysis_by_id(id)


def upload(original_filename: str, file_contents: bytes, content_type: str):
    """Uploads a CV file."""
    return _cv_service_instance.upload(original_filename, file_contents, content_type)


def delete_by_id(id: str):
    """Deletes a CV."""
    return _cv_service_instance.delete_by_id(id)
