import datetime

from fastapi import APIRouter, HTTPException, File, UploadFile
from starlette.responses import FileResponse
from ..utilities.log_manager import LoggingManager
from ..services import job_description_service as jd_service


router = APIRouter()

@router.get(path="", summary="Get all Job Descriptions")
def get_all_jds():
    """ Get all JD metadata from the CSV file."""
    app_logger = LoggingManager().get_logger("AppLogger")
    app_logger.debug(f"Get all JD metadata from the CSV file.")
    try:
        jds = jd_service.get_all()
        return {"data": jds}
    except Exception as e:
        app_logger.error(f"Error in get_all_jds: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(path="/{id}", summary="Download a Job Description file")
def get_jd_by_id(id: str):
    """ Download JD file based on its ID."""
    app_logger = LoggingManager().get_logger("AppLogger")
    app_logger.debug(f"GET request for JD ID: {id}")
    try:
        file_path, original_filename = jd_service.get_by_id(id)

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
        app_logger.error(f"Error in get_jd_by_id: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post(path="", summary="Upload a new Job Description")
async def upload_jd(file: UploadFile = File(...)):
    """ Upload a new JD file (.pdf or .docx)."""
    app_logger = LoggingManager().get_logger("AppLogger")
    app_logger.debug(f"POST request to upload file: {file.filename}")
    try:
        contents = await file.read()

        new_id = jd_service.upload(
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


@router.delete(path="/{id}", summary="Delete a Job Description")
def delete_jd_by_id(id: str):
    """ Delete a JD file and its metadata by ID."""
    app_logger = LoggingManager().get_logger("AppLogger")
    app_logger.debug(f"DELETE request for JD ID: {id}")
    try:
        jd_service.delete_by_id(id)
        # A 204 No Content is implicitly returned, but a JSON response is clearer
        return {"id": id, "status": "deleted"}
    except FileNotFoundError as e:
        app_logger.warn(f"Delete failed, file not found for ID {id}: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        app_logger.error(f"Error in delete_jd_by_id: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
