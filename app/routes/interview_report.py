from fastapi import APIRouter, HTTPException
from app.services.report_generator import ReportGenerator

router = APIRouter()
service = ReportGenerator()

@router.post(path="", summary="Generate interview report from interview JSON")
async def report_interview(interview: dict):
    """Endpoint to report an interview result JSON."""
    try:
        result = service.report_interview(interview)
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
