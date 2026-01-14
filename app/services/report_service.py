import datetime
import json
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from .base_document_service import BaseDocumentService
from app.utilities.csv_utils import CsvUtils

# Base directory setup
BASE_DIR = Path(__file__).parent.parent.parent.resolve()

class ReportService:
    """Service to handle interview report metadata and file access."""
    
    def __init__(self):
        self.report_directory = BASE_DIR / "data" / "report"
        self.meta_data_file_path = self.report_directory / "report_file.csv"
        
        # Create the report directory if it doesn't exist
        if not self.report_directory.exists():
            self.report_directory.mkdir(parents=True, exist_ok=True)
            
        # Initialize CSV handler with a specific schema for reports
        # Schema: id (session_id), name (filename), candidate_name, position, uploadDate
        self.report_schema = ["id", "name", "candidate_name", "position", "uploadDate"]
        self.csv_handler = CsvUtils(str(self.meta_data_file_path), self.report_schema)

    def get_all(self) -> List[Dict]:
        """Get all report metadata from the CSV file."""
        try:
            return self.csv_handler.read_from_csv()
        except FileNotFoundError:
            return []
        except Exception as e:
            print(f"Error in ReportService.get_all: {e}")
            return []

    def get_by_id(self, report_id: str) -> Dict:
        """Finds the report details for a given report id (session_id)."""
        all_reports = self.get_all()
        report_meta = next((r for r in all_reports if r.get("id") == report_id), None)
        
        if not report_meta:
            return None
            
        return report_meta

    def load_report(self, report_id: str) -> Optional[Dict]:
        """Loads the full report JSON from disk for a given report id."""
        report_meta = self.get_by_id(report_id)
        if not report_meta:
            return None
            
        filename = report_meta.get("name")
        if not filename:
            return None
            
        path = self.report_directory / filename
        if not path.exists():
            return None
            
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading report file: {e}")
            return None

    def add_report(self, session_id: str, filename: str, candidate_name: str, position: str):
        """Adds a new report entry to the CSV file."""
        all_reports = self.get_all()
        
        # Check if already exists to avoid duplicates
        if any(r.get("id") == session_id for r in all_reports):
            # Update existing? For now, let's just skip or update if needed.
            return
            
        now = datetime.datetime.now().strftime("%Y%m%d%H:%M:%S")
        new_row = [session_id, filename, candidate_name, position, now]
        
        # Convert all to list of lists for writing
        data_to_write = []
        for r in all_reports:
            data_to_write.append([r.get(key, "") for key in self.report_schema])
        
        data_to_write.append(new_row)
        self.csv_handler.write_to_csv(data_to_write)

    def delete_report(self, report_id: str) -> bool:
        """Deletes a report from the CSV and removes its JSON file from disk."""
        all_reports = self.get_all()
        report_to_delete = next((r for r in all_reports if r.get("id") == report_id), None)
        
        if not report_to_delete:
            return False
            
        # 1. Remove from CSV
        remaining_reports = [r for r in all_reports if r.get("id") != report_id]
        data_to_write = []
        for r in remaining_reports:
            data_to_write.append([r.get(key, "") for key in self.report_schema])
        
        try:
            self.csv_handler.write_to_csv(data_to_write)
        except Exception as e:
            print(f"Error updating CSV during deletion: {e}")
            return False
            
        # 2. Delete JSON file
        filename = report_to_delete.get("name")
        if filename:
            path = self.report_directory / filename
            if path.exists():
                try:
                    path.unlink()
                except Exception as e:
                    print(f"Error deleting report file {path}: {e}")
                    # We still return True because it was removed from CSV
        
        return True

# Singleton instance
report_service = ReportService()
