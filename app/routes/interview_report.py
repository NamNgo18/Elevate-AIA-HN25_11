from fastapi import APIRouter, HTTPException
from app.services.report_generator import ReportGenerator

router = APIRouter()
service = ReportGenerator()

@router.get(path="")
async def report_interview(session_id: str):
    try:
        result = service.report_interview(session_id)
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
