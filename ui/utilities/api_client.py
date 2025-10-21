import os
import requests
import threading

from app.utilities.log_manager import LoggingManager

__all__ = ["APIClient"]

# ========================================
#   API Client Singleton
# ========================================
class APIClient:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, base_url: str = None):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance

    def __init__(self, base_url: str = None):
        if getattr(self, "_initialized", False):
            return
        self._initialized = True
        self._base_url = base_url.rstrip("/")
        self._session = requests.Session()
        self._logger = LoggingManager().get_logger("APILogger")
        self._logger.info(f"APIClient initialized with base URL: {self._base_url}")

    def _request(self, method, endpoint, **kwargs):
        url = f"{self._base_url}/{endpoint.strip('/')}"
        try:
            response = self._session.request(method, url, timeout = 10, **kwargs)
            response.raise_for_status()
            return response
        except requests.RequestException as e:
            self._logger.error(f"Request failed: {method.upper()} {url} | {e}")
            return {"error": str(e)}

    # ✅ Explicitly show common parameters
    def get(self, endpoint, params = None, **kwargs):
        return self._request("GET", endpoint, params = params, **kwargs)

    def post(self, endpoint, data = None, json = None, **kwargs):
        return self._request("POST", endpoint, data = data, json = json, **kwargs)

    def put(self, endpoint, data = None, json = None, **kwargs):
        return self._request("PUT", endpoint, data = data, json = json, **kwargs)

    def delete(self, endpoint, **kwargs):
        return self._request("DELETE", endpoint, **kwargs)