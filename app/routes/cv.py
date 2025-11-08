

from fastapi import APIRouter, HTTPException, File, UploadFile
from starlette.responses import FileResponse
from ..utilities.log_manager import LoggingManager
from ..services import cv_service as cv_service
import os

router = APIRouter()

@router.get(path="", summary="Get all CV")
def get_all_cvs():
    """ Get all CV metadata from the CSV file."""
    app_logger = LoggingManager().get_logger("AppLogger")
    app_logger.debug(f"Get all CV metadata from the CSV file.")
    try:
        cvs = cv_service.get_all()
        return {"data": cvs}
    except Exception as e:
        app_logger.error(f"Error in get_all_cvs: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(path="/{id}", summary="Download a CV file")
def get_cv_by_id(id: str):
    """ Download CV file based on its ID."""
    app_logger = LoggingManager().get_logger("AppLogger")
    app_logger.debug(f"GET request for CV ID: {id}")
    try:
        file_path, original_filename = cv_service.get_by_id(id)

        if not original_filename:
            # Fallback in case filename is blank in CSV
            original_filename = file_path.name

        # This header allows your frontend JS to read Content-Disposition
        headers = {
            "Access-Control-Expose-Headers": "Content-Disposition"
        }

        return FileResponse(
            path=file_path,
            filename=original_filename,  # This correctly sets Content-Disposition
            media_type='application/octet-stream',
            headers=headers  # Pass the extra header here
        )
    except FileNotFoundError as e:
        app_logger.warn(f"File not found for ID {id}: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        app_logger.error(f"Error in get_cv_by_id: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post(path="", summary="Upload a new CV")
async def upload_cv(file: UploadFile = File(...)):
    """ Upload a new CV file (.pdf or .docx)."""
    app_logger = LoggingManager().get_logger("AppLogger")
    app_logger.debug(f"POST request to upload file: {file.filename}")
    try:
        contents = await file.read()

        new_id = cv_service.upload(
            original_filename=f"{file.filename}",
            file_contents=contents,
            content_type=file.content_type
        )

        return {"id": new_id, "filename": file.filename, "status": "uploaded"}

    except ValueError as e:  # Handle bad content type
        app_logger.warn(f"Upload failed (ValueError): {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        app_logger.error(f"Upload failed (Exception): {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {e}")


@router.delete(path="/{id}", summary="Delete a CV")
def delete_cv_by_id(id: str):
    """ Delete a CV file and its metadata by ID."""
    app_logger = LoggingManager().get_logger("AppLogger")
    app_logger.debug(f"DELETE request for CV ID: {id}")
    try:
        cv_service.delete_by_id(id)
        # A 204 No Content is implicitly returned, but a JSON response is clearer
        return {"id": id, "status": "deleted"}
    except FileNotFoundError as e:
        app_logger.warn(f"Delete failed, file not found for ID {id}: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        app_logger.error(f"Error in delete_cv_by_id: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
