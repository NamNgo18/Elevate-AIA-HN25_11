import json
from app.utilities.openAI_helper import OpenAIHelper

class ReportGenerator:
    def __init__(self):
        self.openai = OpenAIHelper()

    def report_interview(self, interview_json: dict) -> dict:
        """Generate interview result evaluation from Q&A JSON."""
        prompt = f"""
        You are an experienced technical interviewer.
        Evaluate the following interview and return a JSON summary.

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
                return json.loads(response["msg_text"])
            return response
        except Exception as e:
            return {"error": f"Failed to parse model output: {e}", "raw": response}
