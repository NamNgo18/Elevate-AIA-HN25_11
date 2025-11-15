import os
import json
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI
from typing import Dict, Any

from data.schema import CV_SCHEMA, JD_SCHEMA

BASE_DIR = Path(__file__).parent.parent.parent.resolve()

# 2. Create the full, absolute path to your .env file
ENV_FILE_PATH = BASE_DIR / ".env"

print(f"env load at {ENV_FILE_PATH}")

# 3. Load the .env file using its absolute path
load_dotenv(ENV_FILE_PATH)

# --- Main Reusable Function ---

def parse_content_to_json(
        content_text: str,
        parameters_schema: Dict[str, Any],
        model: str = "GPT-4o-mini"
) -> Dict[str, Any]: # <--- FIX 1: Changed return type to Dict
    """
    Parses raw text content (like a CV or JD) into a structured JSON
    object based on a provided JSON schema.

    Args:
        content_text: The raw text string to parse.
        parameters_schema: A Python dictionary representing the JSON schema
                           that the output *must* follow. This is the
                           'parameters' block for the OpenAI tool.
        model: The OpenAI model to use (e.g., "gpt-4o", "gpt-4-turbo").

    Returns:
        A Python dictionary with the parsed data. <--- FIX 2: Updated docstring

    Raises:
        ValueError: If the model fails to return tool calls or if the
                    response is not valid JSON.
        Exception: For any API-level errors.
    """

    # 1. Initialize the OpenAI client
    try:
        client = OpenAI(
            base_url = os.environ['OPENAI_URL'],
            api_key = os.environ['OPENAI_API_KEY'],
        )
        if not client.api_key:
            raise EnvironmentError("OPENAI_API_KEY environment variable not set.")
    except Exception as e:
        print(f"Error initializing OpenAI client: {e}")
        raise

    # 2. Define the tool (No changes here)
    openai_tool = {
        "type": "function",
        "function": {
            "name": "parse_content",
            "description": "Parses the raw text (e.g., CV or Job Description) into a structured JSON object according to the required schema. In case you can not match value to any field in a schema, return it null instead. DO NOT MISS ANY FIELD FROM THE SCHEMA",
            "parameters": parameters_schema
        }
    }

    # 3. Define the messages (No changes here)
    messages = [
        {"role": "system",
         "content": "You are an expert text parser. Extract all relevant information from the user's text and format it *only* using the 'parse_content' tool. Infer missing fields as 'null' if the information is not found."},
        {"role": "user", "content": content_text}
    ]

    # 4. Make the API call (No changes here)
    try:
        completion = client.chat.completions.create(
            model=model,
            messages=messages,
            tools=[openai_tool],
            tool_choice={"type": "function", "function": {"name": "parse_content"}}
        )
    except Exception as e:
        print(f"Error during OpenAI API call: {e}")
        raise

    # 5. Extract and parse the JSON response
    response_message = completion.choices[0].message
    if not response_message.tool_calls:
        raise ValueError(
            "Model did not return tool calls. The text might be unparseable or the prompt might be unclear.")

    json_arguments = response_message.tool_calls[0].function.arguments

    try:
        parsed_json = json.loads(json_arguments)
        return parsed_json  # <--- FIX 3: Return the dictionary directly
    except json.JSONDecodeError as e:
        print(f"--- Error: Failed to parse JSON response from model ---")
        print(f"Model's raw output (string): {json_arguments}")
        print(f"Error details: {e}")
        print(f"--- End of Error ---")
        raise

if __name__ == "__main__":

    # --- 1. Define your SCHEMAS ---



    # --- 2. Define Sample Content ---

    # Sample CV text (Unchanged)
    sample_cv_text = """
    Hoàng Văn E
    IT Project Manager (Scrum Master)
    hoangvane@email.com

    Summary:
    Quản lý dự án IT chuyên nghiệp với 7 năm kinh nghiệm.

    Experience:
    - Project Manager/Scrum Master at Consulting Firm Z (2018-05-01 to 2025-10-28)
      - Quản lý thành công 10+ dự án.
      - Thiết lập quy trình Agile.

    Education:
    - Thạc sĩ, Quản lý Dự án at Học viện Công nghệ Bưu chính Viễn thông
    """

    # Sample JD text
    # *** THIS IS THE NEW, MORE DETAILED JD TEXT ***
    sample_jd_text = """
    Vị trí: Senior AI Engineer (Python/ML) - FPT Software AI Lab
    Phòng ban: F-Soft AI
    Địa điểm: Cầu Giấy, Hà Nội (Cho phép hybrid)
    Loại hình: Full-time

    Tóm tắt:
    Chúng tôi đang tìm kiếm một Kỹ sư AI cao cấp có kinh nghiệm để tham gia vào team R&D, phát triển các giải pháp AI thế hệ mới.

    Trách nhiệm chính:
    - Thiết kế, xây dựng và triển khai các mô hình Machine Learning.
    - Làm việc với các bộ dữ liệu lớn (Big Data).
    - Tối ưu hóa các mô hình AI cho hiệu suất cao.
    - Cố vấn cho các thành viên junior.

    Yêu cầu (Must-have):
    - Bắt buộc có 5+ năm kinh nghiệm về Python.
    - Bắt buộc thành thạo TensorFlow hoặc PyTorch.
    - Bắt buộc có kinh nghiệm làm việc với NLP.
    - Cần bằng Thạc sĩ (Master) chuyên ngành Computer Science.
    - Kỹ năng giao tiếp tốt.

    Yêu cầu (Ưu tiên):
    - Ưu tiên ứng viên có kinh nghiệm với MLOps.
    - Ưu tiên có chứng chỉ AWS/GCP.
    - Tiếng Anh giao tiếp tốt là một lợi thế.

    Phúc lợi:
    - Mức lương: $3000 - $5000 (USD)
    - Thưởng tháng 13, thưởng dự án.
    - Gói FPT Care.
    """

    # --- 3. Run the Parser ---

    print("--- Parsing CV ---")
    try:
        # Pass the string content directly
        parsed_cv = parse_content_to_json(sample_cv_text, CV_SCHEMA)
        print(json.dumps(parsed_cv, indent=2, ensure_ascii=False))

    except Exception as e:
        print(f"Failed to parse CV: {e}")

    print("\n" + "=" * 30 + "\n")

    print("--- Parsing Job Description ---")
    try:
        # Pass the string content directly
        parsed_jd = parse_content_to_json(sample_jd_text, JD_SCHEMA)
        print(parsed_jd)

    except Exception as e:
        print(f"Failed to parse JD: {e}")