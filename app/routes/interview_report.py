from fastapi import APIRouter, HTTPException
from app.services.report_generator import ReportGenerator
from app.services.report_service import report_service

router = APIRouter()
service = ReportGenerator()

@router.get(path="/list")
async def list_reports():
    try:
        reports = report_service.get_all()
        return {"data": reports}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get(path="")
async def report_interview(session_id: str):
    try:
        result = service.report_interview(session_id)
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete(path="/{report_id}")
async def delete_report(report_id: str):
    try:
        success = report_service.delete_report(report_id)
        if not success:
            raise HTTPException(status_code=404, detail="Report not found")
        return {"message": "Report deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
