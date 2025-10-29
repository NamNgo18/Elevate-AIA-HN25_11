import os
import json
import threading

from openai    import OpenAI

__all__ = ["OpenAIHelper"]

# =========================================================
# Singleton OpenAI Helper Class
# =========================================================
class OpenAIHelper:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(OpenAIHelper, cls).__new__(cls)
                    cls._instance._client = OpenAI(
                                    base_url = os.getenv("OPENAI_URL"),
                                    api_key  = os.getenv("OPENAI_API_KEY")
                                )
        return cls._instance

    def make_request(self, msg_prompt: str = None, func_defs: str | list = None, func_name: str | list = None, temp: int = None, max_ouput_tokens: int = None) -> dict:
        """
        Core OpenAI chat call with optional function calling support.
        Handles multiple tool calls and returns structured JSON result.
        """

        resp_ai = self._client.chat.completions.create(
            model        = os.getenv("OPENAI_QNA_MODEL") or "",
            messages     = msg_prompt or "",
            tools        = func_defs or [],
            tool_choice  = func_name if not func_name else ("auto" if func_name == "auto" else {"type": "function", "function": {"name": func_name}}),
            temperature  = temp or 0,
            max_tokens   = max_ouput_tokens or 500
        )

        # --- Handle multiple function calls ---
        msg_ai_reply = resp_ai.choices[0].message
        if hasattr(msg_ai_reply, "tool_calls") and msg_ai_reply.tool_calls:
            func = []
            for call in msg_ai_reply.tool_calls:
                fn_name = call.function.name
                try:
                    args = json.loads(call.function.arguments)
                except Exception:
                    args = {"error": "Failed to parse function arguments"}
                func.append({"name": fn_name, "args": args})
            return {"func": func}

        # Only text response
        return {"msg_text": msg_ai_reply.content.strip() if msg_ai_reply.content else ""}