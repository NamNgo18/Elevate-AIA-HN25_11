import json
import re
from pathlib import Path
from datetime import datetime

from app.utilities.openAI_helper import OpenAIHelper
from app.services.qna_generator import handle_build_interview_summary

class ReportGenerator:
    def __init__(self):
        self.openai = OpenAIHelper()

    # ----------------------------
    # Path & Filename Utilities
    # ----------------------------

    def _get_report_dir(self) -> Path:
        """Return the internal report directory."""
        return Path(__file__).resolve().parents[2] / "data" / "report"

    def _sanitize_filename(self, s: str) -> str:
        """Ensure filename is OS-safe."""
        if not isinstance(s, str):
            s = str(s)
        return re.sub(r'[^A-Za-z0-9_.-]', '_', s) or "report"

    def _build_filename(self, candidate_name: str, position: str) -> str:
        ts = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
        cand = self._sanitize_filename(candidate_name)
        pos = self._sanitize_filename(position)

        if pos:
            return f"{cand}_{pos}_{ts}.json"
        return f"{cand}_{ts}.json"

    def _save_report(self, candidate_name: str, position: str, report_obj: dict) -> None:
        """Save the JSON report internally."""
        report_dir = self._get_report_dir()
        report_dir.mkdir(parents=True, exist_ok=True)

        filename = self._build_filename(candidate_name, position)
        path = report_dir / filename

        with open(path, "w", encoding="utf-8") as f:
            json.dump(report_obj, f, indent=2, ensure_ascii=False)

    # ----------------------------
    # Extracting candidate info
    # ----------------------------

    def _extract_candidate_info(self, interview_json: dict) -> tuple[str, str]:
        """Extract candidate name and position safely from new JSON structure."""
        candidate = interview_json.get("candidate", {}) or {}
        name = candidate.get("name", "report")
        position = candidate.get("target_position", "")
        return name, position

    # ----------------------------
    # Core Logic
    # ----------------------------

    def _build_prompt(self, interview_json: dict) -> str:
        return f"""
You are an experienced technical interviewer.
Evaluate the following interview and return a JSON summary.

IMPORTANT:
- DO NOT call any external tools.
- DO NOT generate function calls.
- Respond ONLY with raw JSON (no markdown, no text outside JSON).

Interview data:
{json.dumps(interview_json, indent=2)}

Respond strictly as JSON with this structure:
{{
    "passed": true/false,
    "overall_score": integer (0-100),
    "technical_skill": integer (0-100),
    "problem_solving": integer (0-100),
    "communication": integer (0-100),
    "experience": integer (0-100),
    "pros": [list of strengths],
    "cons": [list of weaknesses],
    "summary": "1-2 sentences summarizing performance"
}}
"""

    def _parse_json_response(self, response: dict) -> dict | None:
        """Extract safe JSON from OpenAI response."""
        text = response.get("msg_text")
        if not text:
            return None

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return None

    def report_interview(self, session_id: str) -> dict:
        # Get the raw interview JSON
        interview_json = handle_build_interview_summary(session_id)

        # Extract candidate info
        candidate_info = interview_json.get("candidate", {})

        # Generate prompt for OpenAI
        prompt = self._build_prompt(interview_json)

        response = self.openai.make_request(
            msg_prompt=[{"role": "user", "content": prompt}],
            temp=0.5,
            max_ouput_tokens=600
        )

        parsed = self._parse_json_response(response)

        # Retry if first attempt returned invalid JSON or function calls
        if not parsed and response.get("func"):
            fallback_prompt = (
                "The previous response incorrectly returned function calls. "
                "Please respond ONLY with raw JSON matching the required structure.\n\n"
                f"Interview data:\n{json.dumps(interview_json, indent=2)}"
            )

            fallback_resp = self.openai.make_request(
                msg_prompt=[{"role": "user", "content": fallback_prompt}],
                temp=0.0,
                max_ouput_tokens=600
            )

            parsed = self._parse_json_response(fallback_resp)

        # If still invalid, return error
        if not parsed:
            return {
                "error": "Failed to parse JSON from model response.",
                "raw": response,
                "candidate": candidate_info
            }

        # Save report internally
        try:
            candidate_name = candidate_info.get("name", "report")
            position = candidate_info.get("target_position", "")
            self._save_report(candidate_name, position, parsed)
        except Exception:
            pass

        # Merge candidate info with evaluation summary
        final_output = {
            "candidate": candidate_info,
            "interview_summary": parsed
        }

        return final_output
