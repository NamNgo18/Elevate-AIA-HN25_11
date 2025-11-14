import json
import re
from pathlib import Path
from datetime import datetime

from app.utilities.openAI_helper import OpenAIHelper


class ReportGenerator:
    def __init__(self):
        self.openai = OpenAIHelper()

    def _get_report_dir(self) -> Path:
        # repo root is two parents above this file (app/services/<file>)
        return Path(__file__).resolve().parents[2] / "data" / "report"

    def _sanitize_filename(self, s: str) -> str:
        if not s:
            return "report"
        return re.sub(r'[^A-Za-z0-9_.-]', '_', s)

    def _save_report(self, candidate: str, position: str, report_obj: dict) -> None:
        """Save report internally but don’t expose path in response."""
        report_dir = self._get_report_dir()
        report_dir.mkdir(parents=True, exist_ok=True)
        ts = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
        cand = self._sanitize_filename(candidate)
        pos = self._sanitize_filename(position)
        fname = f"{cand}_{pos}_{ts}.json" if pos else f"{cand}_{ts}.json"
        path = report_dir / fname
        with open(path, "w", encoding="utf-8") as f:
            json.dump(report_obj, f, indent=2, ensure_ascii=False)

    def report_interview(self, interview_json: dict) -> dict:
        """Generate interview result evaluation from Q&A JSON."""
        prompt = f"""
        You are an experienced technical interviewer.
        Evaluate the following interview and return a JSON summary.

        IMPORTANT: Do NOT call any external functions or tools. Do NOT return function-call objects.
        Respond only as assistant content, and return only the JSON (no markdown, no surrounding text).

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

        response = self.openai.make_request(
            msg_prompt=[{"role": "user", "content": prompt}],
            temp=0.5,
            max_ouput_tokens=600
        )

        try:
            if "msg_text" in response and response["msg_text"]:
                parsed = json.loads(response["msg_text"])
                # Save internally but don’t modify the return
                try:
                    self._save_report(
                        interview_json.get("candidate", "report"),
                        interview_json.get("position", ""),
                        parsed
                    )
                except Exception:
                    pass
                return parsed

            if "func" in response and response["func"]:
                fallback_prompt = (
                    "The previous response returned function calls instead of the requested JSON. "
                    "Please IGNORE the function calls and now respond ONLY with the JSON described earlier, "
                    "with no extra text, no markdown, and no function/tool calls.\n\n"
                    f"Interview data:\n{json.dumps(interview_json, indent=2)}"
                )

                fallback_resp = self.openai.make_request(
                    msg_prompt=[{"role": "user", "content": fallback_prompt}],
                    temp=0.0,
                    max_ouput_tokens=600
                )

                if "msg_text" in fallback_resp and fallback_resp["msg_text"]:
                    parsed = json.loads(fallback_resp["msg_text"])
                    try:
                        self._save_report(
                            interview_json.get("candidate", "report"),
                            interview_json.get("position", ""),
                            parsed
                        )
                    except Exception:
                        pass
                    return parsed

            return response
        except Exception as e:
            return {"error": f"Failed to parse model output: {e}", "raw": response}
