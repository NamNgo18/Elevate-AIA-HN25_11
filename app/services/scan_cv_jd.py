import json
import os
from openai import OpenAI, AsyncOpenAI
import asyncio
from typing import List, Dict, Any
from pathlib import Path
from dotenv import load_dotenv

# =======================================================
# 1. Config OpenAI / OpenRouter
# =======================================================
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_BASE_URL = os.getenv("OPENAI_URL")
OPENAI_MODEL = os.getenv("OPENAI_QNA_MODEL")

# Setting Client
client = None
async_client = None
try:
    if not all([OPENAI_API_KEY, OPENAI_BASE_URL]):
        print("WARNING: Please set the environment variables OPENAI_API_KEY and OPENAI_URL.")
    else:
        client = OpenAI(
            api_key=OPENAI_API_KEY,
            base_url=OPENAI_BASE_URL
        )
        async_client = AsyncOpenAI(
            api_key=OPENAI_API_KEY,
            base_url=OPENAI_BASE_URL
        )
except Exception as e:
    print(f"OpenAI configuration error: {e}")

# =======================================================
# 2. Definition of the Function Calling feature (Tool)
# =======================================================
def match_cv_to_job(name: str,phone_number: str,email: str,work: str,match_score: int,education: str, skills: str, awards: str
                    , explanation: str, missing_skills: List[str]) -> Dict[str, Any]:
    """ Assess the alignment between the CV and the job requirements (Job Description). """
    return {
        "name":name,
        "phone_number":phone_number,
        "email":email,
        "work":work,
        "education":education,
        "skills":skills,
        "awards": awards,
        "match_score": match_score,
        "explanation": explanation,
        "missing_skills": missing_skills
    }

tools = [
    {
        "type": "function",
        "function": {
            "name": "match_cv_to_job",
            "description": "Assess the alignment between a candidate's profile (CV) and a job description, based on skills, experience, and certifications.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Candidate's full name"},
                    "phone_number": {"type": "string", "description": "Candidate's phone number"},
                    "email": {"type": "string", "description": "Candidate's email address"},
                    "work": {"type": "string", "description": "Information about the candidate's previous work experience"},
                    "education": {"type": "string", "description": "Information about the universities the candidate attended"},
                    "skills": {"type": "string", "description": "The skills the candidate possesses"},
                    "awards": {"type": "string", "description": "The awards the candidate has received"},
                    "match_score": {"type": "integer", "description": "A score from 0 to 100."},
                    "explanation": {"type": "string", "description": "Summary of the reasoning for the score."},
                    "missing_skills": {"type": "array", "items": {"type": "string"}, "description": "A list of important skills that are **missing** from the CV."},
                },
                "required": ["name", "phone_number", "email", "match_score", "explanation", "missing_skills"],
            },
        }
    }
]

# =======================================================
# 3. Read File JSON
# =======================================================
def read_cv_by_json(folder_path, item_type):
    """Read all JSON files in the directory and return them as a list of dictionaries."""
    items = []
    if not os.path.exists(folder_path):
        print(f"Error: The directory path does not exist: {folder_path}")
        return items
        
    for filename in os.listdir(folder_path):
        if filename.endswith('.json'):
            file_path = os.path.join(folder_path, filename)
            with open(file_path, 'r', encoding='utf-8') as f:
                try:
                    data = json.load(f)
                    if item_type == 'cv':
                        items.append({"id": data.get('basics', {}).get('cv_id'), "content": json.dumps(data, ensure_ascii=False, indent=2)})
                    else:
                        items.append(data)
                except json.JSONDecodeError:
                    print(f"Warning: Error: Failed to read the JSON file {filename}.")
                    continue
    return items

# =======================================================
# 4. Batch Process Function
# =======================================================
async def process_cv_single(cv_data: Dict[str, Any], job_summary_str: str, job_title: str, semaphore: asyncio.Semaphore) -> Dict[str, Any]:
    """Process a single CV asynchronously."""
    async with semaphore:
        cv_id = cv_data["id"]
        cv_content_str = cv_data["content"]
        
        system_prompt = (
            "You are a Recruitment Expert. Your task is to compare a Candidate Profile (CV) with a Job Summary and use the function `match_cv_to_job` to return a score, an explanation, and any missing skills. "
            "Evaluate strictly and objectively based on the criteria in the 'match_criteria' section of the Job Summary and only use the function after evaluation. Use only the function `match_cv_to_job`."
        )
        user_prompt = (
            f"This is the Job Description:\n---\n{job_summary_str}\n---\n\n"
            f"This is the Candidate Profile (CV) to be evaluated:\n---\n{cv_content_str}\n---\n"
            "Please evaluate and call the function `match_cv_to_job`."
        )
        
        try:
            response = await async_client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
                tools=tools,
                tool_choice={"type": "function", "function": {"name": "match_cv_to_job"}},
                temperature=0
            )
            
            tool_calls = response.choices[0].message.tool_calls
            if tool_calls and tool_calls[0].function.name == "match_cv_to_job":
                arguments = json.loads(tool_calls[0].function.arguments)
                match_result = match_cv_to_job(**arguments)
                
                return {
                    "cv_id": cv_id,
                    "job_title": job_title,
                    "match_data": match_result
                }
            else:
                return {"cv_id": cv_id, "error": "LLM did not call the match_cv_to_job function."}

        except Exception as e:
            return {"cv_id": cv_id, "error": f"API or parsing error: {e}"}

async def process_cv_batch(cv_list: List[Dict[str, Any]], job_summary: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Perform batch processing of CVs by sending each CV and the corresponding Job Summary to OpenAI asynchronously and in parallel.
    """
    if not async_client:
        return []
    
    job_title = job_summary.get('basic_info', {}).get('job_title', 'Job Title Unknown')
    job_summary_str = json.dumps(job_summary, ensure_ascii=False, indent=2)
    
    # Limit concurrency to avoid hitting rate limits too hard (e.g., 5 concurrent requests)
    semaphore = asyncio.Semaphore(5)
    
    tasks = [process_cv_single(cv_data, job_summary_str, job_title, semaphore) for cv_data in cv_list]
    results = await asyncio.gather(*tasks)
    
    return results

# =======================================================
# 5. Main function to be called from FastAPI
# =======================================================
def get_processed_jd_data() -> List[Dict[str, Any]]:
    """
    Load JD data from a file and extract basic fields for the frontend (for the main table).
    """
    # Get folder path 'DB/JD' (backend/DB/JD)
    # current_dir = os.path.dirname(os.path.abspath(__file__))
    current_dir = Path(__file__).resolve().parent.parent.parent
    jd_folder = os.path.join(current_dir,'data', 'upload','DB', 'JD')
    
    job_summaries = read_cv_by_json(jd_folder, 'jd')
    
    if not job_summaries:
        return []

    processed_data = []
    
    for job_summary in job_summaries: 
        try:
            # Extract basic data from the JSON structure
            metadata = job_summary.get("metadata", {})
            basic_info = job_summary.get("basic_info", {})
            
            jd_id = metadata.get("jd_id")
            uploaded_by = metadata.get("uploaded_by")
            scanned_at = metadata.get("scanned_at")
            job_title = basic_info.get("job_title")

            processed_item = {
                "key": jd_id, 
                "jd_id": jd_id,
                "job_title": job_title,
                "uploaded_by": uploaded_by,
                "scanned_at": scanned_at
            }
            # Add data ino response
            processed_data.append(processed_item)
            
        except Exception as e:
            print(f"JD processing error : {e} cho bản ghi: {job_summary.get('metadata', {}).get('source_file_name', 'Unknown')}")
            continue
    
    return processed_data


# scan_cv_jd.py (Phần hàm get_batch_matching_results đã sửa)

async def get_batch_matching_results(jd_id: str) -> List[Dict[str, Any]]:
  
    current_dir = Path(__file__).resolve().parent.parent.parent
    jd_folder = os.path.join(current_dir,'data', 'upload', 'JD')
    cv_folder = os.path.join(current_dir,'data', 'upload', 'CV')

    all_cvs = read_cv_by_json(cv_folder, 'cv')
    
    job_summaries = read_cv_by_json(jd_folder, 'jd')
    
    job_summary_data = None
    
    for jd in job_summaries:
        if jd.get('metadata', {}).get('jd_id') == jd_id:
            job_summary_data = jd
            break
    
    if not all_cvs:
        return []

    if not job_summary_data:
        print(f"CẢNH BÁO: Không tìm thấy JD với ID '{jd_id}' trong thư mục DB.")
        return []
    
    batch_results = await process_cv_batch(all_cvs, job_summary_data)
    
    formatted_results = []
    for result in batch_results:
        if "match_data" in result:
            match_data = result["match_data"]
            
            formatted_results.append({
                "key": result["cv_id"],
                "cv_id": result["cv_id"],
                "job_title": result["job_title"],
                "name": match_data.get("name"), 
                "phone_number": match_data.get("phone_number"),
                "email": match_data.get("email"),
                "work":match_data.get("work"),
                "education":match_data.get("education"),
                "skills":match_data.get("skills"),
                "awards":match_data.get("awards"),
                "match_score": match_data.get("match_score"),
                "explanation": match_data.get("explanation"),
                "missing_skills": match_data.get("missing_skills"),
            })
            
    return formatted_results

def find_infor_cv_jd(jd_id: str, cv_id: str) -> List[Dict[str, Any]]:
    current_dir = Path(__file__).resolve().parent.parent.parent
    jd_folder = os.path.join(current_dir,'data', 'upload', 'JD')
    cv_folder = os.path.join(current_dir,'data', 'upload', 'CV')
    all_cvs = read_cv_by_json(cv_folder, 'cv')
    
    job_summaries = read_cv_by_json(jd_folder, 'jd')
    
    job_name = None
    for jd in job_summaries:
        if jd.get('metadata', {}).get('jd_id') == jd_id:
            job_name = jd.get('basic_info', {}).get('job_title')
            break
        
    cv_name = None
    for cv in all_cvs:
    # 1. Check if the ID matches
        if cv.get('id') == cv_id:
            cv_content_str = cv.get('content')
            if cv_content_str:
                try:
                    # Use json.loads() to parse a JSON string
                    cv_data = json.loads(cv_content_str)
                    # Safely retrieve the nested name
                    cv_name = cv_data.get('basics', {}).get('name')
                    print(f"Found name: {cv_name}")
                    break
                except json.JSONDecodeError as e:
                    print(f"Error decoding JSON for CV ID {cv_id}: {e}")
                    cv_name = None
            else:
                print(f"CV ID {cv_id} found but 'content' is missing.")
                cv_name = None
            if cv_name is not None:
                break
            break
    formatted_results = []
    formatted_results.append({
        'cv_name': cv_name,
        'jd_name': job_name
    })
    return formatted_results
