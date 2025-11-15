import json
import os
from openai import AzureOpenAI
from typing import List, Dict, Any
from pathlib import Path
from dotenv import load_dotenv

# =======================================================
# 1. Config Azure OpenAI
# =======================================================
load_dotenv()
AZURE_OPENAI_KEY = os.getenv("OPENAI_API_KEY")
AZURE_OPENAI_ENDPOINT = os.getenv("OPENAI_URL")
AZURE_OPENAI_DEPLOYMENT_NAME = os.getenv("OPENAI_QNA_MODEL")
AZURE_OPENAI_API_VERSION = "2024-07-01-preview"

# Setting Client
client = None
try:
    if not all([AZURE_OPENAI_KEY, AZURE_OPENAI_ENDPOINT]):
        print("WARNING: Please set the environment variables AZURE_OPENAI_KEY and AZURE_OPENAI_ENDPOINT.")
    else:
        client = AzureOpenAI(
            api_key=AZURE_OPENAI_KEY,
            azure_endpoint=AZURE_OPENAI_ENDPOINT,
            api_version=AZURE_OPENAI_API_VERSION
        )
except Exception as e:
    print(f"Azure OpenAI configuration error: {e}")

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
            "description": "Đánh giá mức độ phù hợp của hồ sơ ứng viên (CV) với mô tả công việc, dựa trên kỹ năng, kinh nghiệm và chứng chỉ.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Họ và tên của ứng viên"},
                    "phone_number": {"type": "string", "description": "Số điện thoại của ứng viên"},
                    "email": {"type": "string", "description": "Địa chỉ email của ứng viên"},
                    "work": {"type": "string", "description": "Thông tin công việc mà ứng viên đã làm trước đó"},
                    "education": {"type": "string", "description": "Thông tin các trường đại học mà ứng viên đã học"},
                    "skills": {"type": "string", "description": "Các skills mà ứng viên có"},
                    "awards": {"type": "string", "description": "Những awards mà ứng viên có"},
                    "match_score": {"type": "integer", "description": "Điểm số từ 0 đến 100."},
                    "explanation": {"type": "string", "description": "Tóm tắt lý do cho điểm số."},
                    "missing_skills": {"type": "array", "items": {"type": "string"}, "description": "Danh sách các kỹ năng quan trọng mà CV **thiếu**."},
                },
                "required": ["name","phone_number","email","match_score", "explanation", "missing_skills"],
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
def process_cv_batch(cv_list: List[Dict[str, Any]], job_summary: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Perform batch processing of CVs by sending each CV and the corresponding Job Summary to Azure OpenAI, utilizing Function Calling to evaluate their relevance.
    """
    if not client:
        return []
    
    job_title = job_summary.get('basic_info', {}).get('job_title', 'Job Title Unknown')
    job_summary_str = json.dumps(job_summary, ensure_ascii=False, indent=2)
    results = []
    
    for cv_data in cv_list:
        cv_id = cv_data["id"]
        cv_content_str = cv_data["content"]
        
        system_prompt = (
            "Bạn là một chuyên gia Tuyển dụng. Nhiệm vụ của bạn là so sánh một Hồ sơ Ứng viên (CV) với Mô tả Công việc (Job Summary) và sử dụng hàm `match_cv_to_job` để trả về điểm số, giải thích và các kỹ năng còn thiếu. "
            "Đánh giá một cách nghiêm túc, khách quan, dựa trên các tiêu chí trong phần 'match_criteria' của Job Summary và chỉ sử dụng hàm sau khi đánh giá. Chỉ sử dụng hàm `match_cv_to_job`."
        )
        user_prompt = (
            f"Đây là Mô tả Công việc:\n---\n{job_summary_str}\n---\n\n"
            f"Đây là Hồ sơ Ứng viên (CV) cần đánh giá:\n---\n{cv_content_str}\n---\n"
            "Hãy đánh giá và gọi hàm `match_cv_to_job`."
        )
        
        try:
            response = client.chat.completions.create(
                model=AZURE_OPENAI_DEPLOYMENT_NAME,
                messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
                tools=tools,
                tool_choice={"type": "function", "function": {"name": "match_cv_to_job"}}
            )
            
            tool_calls = response.choices[0].message.tool_calls
            if tool_calls and tool_calls[0].function.name == "match_cv_to_job":
                arguments = json.loads(tool_calls[0].function.arguments)
                match_result = match_cv_to_job(**arguments)
                
                results.append({
                    "cv_id": cv_id,
                    "job_title": job_title,
                    "match_data": match_result
                })
            else:
                results.append({"cv_id": cv_id, "error": "LLM did not call the match_cv_to_job function."})

        except Exception as e:
            results.append({"cv_id": cv_id, "error": f"API or parsing error: {e}"})

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

def get_batch_matching_results(jd_id: str) -> List[Dict[str, Any]]:
  
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
    
    batch_results = process_cv_batch(all_cvs, job_summary_data)
    
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
