# main.py
from fastapi import APIRouter
from fastapi.middleware.cors import CORSMiddleware # Cần thiết cho việc giao tiếp với React
from app.services.scan_cv_jd import get_processed_jd_data, get_batch_matching_results
import os
from typing import List, Dict, Any

router = APIRouter()


@router.get("/")
def read_root():
    return {"Hello": "World from FastAPI"}

@router.get("/data")
def get_data():
    return {"message": "Dữ liệu từ Backend", "items": [1, 2, 3]}

@router.get("/scan-jd", response_model=List[Dict[str, Any]])
def scan_cv_endpoint():
    processed_data = get_processed_jd_data()
    return processed_data

@router.get("/batch-match", response_model=List[Dict[str, Any]])
def batch_match_endpoint(jd_id: str):
    results = get_batch_matching_results(jd_id=jd_id)
    return results

