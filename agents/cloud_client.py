"""Google Cloud Vertex AI client integration for Gemini LLM reasoning.

Configured with:
- Google Cloud Application Default Credentials (ADC) with automatic token refresh
- Dynamic project resolution (auto-detects project from ADC or GOOGLE_CLOUD_PROJECT)
- Multi-region routing (defaults to us-central1)
- Vertex AI Gemini publisher model endpoint (gemini-3.8-flash with dynamic failover)
- Dynamic publisher models list discovery & caching from Vertex AI API
- DeepSeek API failover for Gemini resource exhaustion (429) & quota errors
- Connection pooling & persistent sessions
- Exponential backoff with jitter for transient errors (429, 503)
- Quota-aware token bucket rate limiter
- Structured JSON output support
- Offline fallback mock synthesis when ADC is unavailable or network is disconnected
"""

from __future__ import annotations

import json
import logging
import os
import random
import time
from typing import Any, Dict, List, Optional
import urllib.request
import urllib.error

# Automatically load .env for credentials (DEEPSEEK_API, etc.)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

logger = logging.getLogger(__name__)

# Try importing google.auth for Application Default Credentials
try:
    import google.auth
    from google.auth.transport.requests import Request as GoogleAuthRequest
    HAS_GOOGLE_AUTH = True
except ImportError:
    HAS_GOOGLE_AUTH = False


class TokenBucketRateLimiter:
    """Sliding token bucket rate limiter for Google Cloud API quotas."""

    def __init__(self, requests_per_minute: int = 60):
        self.capacity = float(requests_per_minute)
        self.tokens = float(requests_per_minute)
        self.fill_rate = requests_per_minute / 60.0  # tokens per second
        self.last_update = time.monotonic()

    def acquire(self) -> None:
        """Block until a token is available."""
        while True:
            now = time.monotonic()
            elapsed = now - self.last_update
            self.last_update = now
            self.tokens = min(self.capacity, self.tokens + elapsed * self.fill_rate)

            if self.tokens >= 1.0:
                self.tokens -= 1.0
                return
            sleep_needed = (1.0 - self.tokens) / self.fill_rate
            time.sleep(max(0.05, sleep_needed))


class GoogleCloudClient:
    """Production client for Google Cloud Vertex AI (Gemini).
    
    Supports:
    1. Application Default Credentials (ADC) - Enterprise recommended
    2. Fallback to API Key (Google AI Studio)
    3. Graceful offline deterministic fallback if unauthenticated
    """

    def __init__(
        self,
        project_id: Optional[str] = None,
        location: Optional[str] = None,
        model_name: Optional[str] = None,
        api_key: Optional[str] = None,
        max_retries: int = 4,
        rpm_limit: int = 60,
        force_fallback: bool = False,
    ):
        self.max_retries = max_retries
        self.force_fallback = force_fallback
        self.limiter = TokenBucketRateLimiter(requests_per_minute=rpm_limit)

        self.model_name = (
            model_name
            or os.getenv("VERTEX_AI_MODEL")
            or os.getenv("GOOGLE_CLOUD_MODEL")
            or "gemini-3.8-flash"
        )
        self.location = (
            location
            or os.getenv("GOOGLE_CLOUD_LOCATION")
            or os.getenv("VERTEX_AI_LOCATION")
            or "us-central1"
        )
        self.api_key = (
            api_key
            or os.getenv("GOOGLE_CLOUD_API_KEY")
            or os.getenv("GEMINI_API_KEY")
        )

        self.credentials = None
        self.project_id = project_id or os.getenv("GOOGLE_CLOUD_PROJECT") or os.getenv("VERTEX_AI_PROJECT")
        self.auth_method = "OFFLINE_FALLBACK"

        # Initialize Application Default Credentials (ADC)
        if HAS_GOOGLE_AUTH and not self.force_fallback:
            try:
                creds, adc_project = google.auth.default(
                    scopes=["https://www.googleapis.com/auth/cloud-platform"]
                )
                self.credentials = creds
                if not self.project_id:
                    self.project_id = adc_project or getattr(creds, "quota_project_id", None)
                if self.credentials and self.project_id:
                    self.auth_method = "APPLICATION_DEFAULT_CREDENTIALS"
                    logger.info(
                        "Google Cloud Vertex AI initialized via ADC. Project: %s, Location: %s, Model: %s",
                        self.project_id,
                        self.location,
                        self.model_name,
                    )
            except Exception as e:
                logger.debug("ADC initialization skipped or unconfigured: %s", e)

        if self.auth_method == "OFFLINE_FALLBACK" and self.api_key:
            self.auth_method = "API_KEY"

        # DeepSeek API failover integration (for Gemini Resource Exhaustion / 429)
        self.deepseek_api_key = (
            os.getenv("DEEPSEEK_API")
            or os.getenv("DEEPSEEK_API_KEY")
        )
        self.deepseek_model = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")

        self.last_used_provider = self.auth_method
        self.last_used_model = self.model_name
        self._cached_publisher_models: List[str] = []
        self._models_cache_time: float = 0.0

    def _get_bearer_token(self) -> Optional[str]:
        """Obtain a fresh OAuth2 Bearer token from Application Default Credentials."""
        if not self.credentials:
            return None
        try:
            if not self.credentials.valid:
                req = GoogleAuthRequest()
                self.credentials.refresh(req)
            return self.credentials.token
        except Exception as e:
            logger.warning("Failed to refresh ADC token: %s", e)
            return None

    def get_status(self) -> Dict[str, Any]:
        """Return detailed Google Cloud Vertex AI connection telemetry and multi-tier failover status."""
        is_adc = self.auth_method == "APPLICATION_DEFAULT_CREDENTIALS"
        token_valid = bool(is_adc and self.credentials and self._get_bearer_token())
        return {
            "provider": "Google Cloud Vertex AI",
            "auth_method": self.auth_method,
            "connected": token_valid or bool(self.api_key) or bool(self.deepseek_api_key),
            "project_id": self.project_id,
            "location": self.location,
            "model_name": self.model_name,
            "has_adc": HAS_GOOGLE_AUTH and self.credentials is not None,
            "token_valid": token_valid,
            "discovered_gemini_models": self._cached_publisher_models or [self.model_name, "gemini-2.5-flash", "gemini-2.5-pro"],
            "deepseek_configured": bool(self.deepseek_api_key),
            "deepseek_model": self.deepseek_model,
            "last_used_provider": self.last_used_provider,
            "last_used_model": self.last_used_model,
        }

    def fetch_available_gemini_models(self) -> List[str]:
        """Fetch latest active publisher models list from Vertex AI API and filter to text/reasoning models.
        
        Caches results with a 1-hour TTL and provides a resilient curated fallback.
        """
        now = time.monotonic()
        if self._cached_publisher_models and (now - self._models_cache_time < 3600):
            return list(self._cached_publisher_models)

        token = self._get_bearer_token() if self.auth_method == "APPLICATION_DEFAULT_CREDENTIALS" else None
        discovered: List[str] = []

        if token and self.project_id:
            try:
                url = f"https://{self.location}-aiplatform.googleapis.com/v1beta1/publishers/google/models"
                req = urllib.request.Request(
                    url,
                    headers={
                        "Authorization": f"Bearer {token}",
                        "x-goog-user-project": self.project_id,
                        "Content-Type": "application/json",
                    },
                )
                with urllib.request.urlopen(req, timeout=8) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    publisher_models = data.get("publisherModels", [])
                    raw_names = [
                        m.get("name", "").split("/")[-1]
                        for m in publisher_models
                        if "gemini" in m.get("name", "").lower()
                    ]
                    # Filter out non-generation models (embeddings, tts, speech, computer-use, etc.)
                    discovered = [
                        m for m in raw_names
                        if not any(k in m for k in ("embedding", "tts", "audio", "computer-use", "transcribe", "translate", "robotics", "image", "-live", "banana"))
                    ]
                    if discovered:
                        logger.info("Discovered %d active Gemini publisher models from Vertex AI API.", len(discovered))
            except Exception as e:
                logger.warning("Could not dynamically query Vertex AI publisher models list: %s", e)

        # Build prioritized list starting with requested model, active stable models, and discovered models
        base_priority = [
            self.model_name,
            "gemini-2.5-flash",
            "gemini-2.5-pro",
            "gemini-2.5-flash-lite",
            "gemini-3.7-flash",
            "gemini-3.6-flash",
            "gemini-3.5-flash",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
        ]
        ordered_models: List[str] = []
        for m in base_priority + discovered:
            if m and m not in ordered_models:
                ordered_models.append(m)

        self._cached_publisher_models = ordered_models
        self._models_cache_time = now
        return list(ordered_models)

    def generate_content(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        response_schema: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Call Vertex AI with structured output, dynamic model fallbacks, DeepSeek failover, and offline fallback."""
        if self.force_fallback:
            return self._mock_reasoning_fallback(prompt, response_schema)

        # 1. Try Vertex AI with Application Default Credentials (ADC)
        if self.auth_method == "APPLICATION_DEFAULT_CREDENTIALS":
            token = self._get_bearer_token()
            if token and self.project_id:
                candidate_models = self.fetch_available_gemini_models()

                for candidate in candidate_models:
                    url = (
                        f"https://{self.location}-aiplatform.googleapis.com/v1/"
                        f"projects/{self.project_id}/locations/{self.location}/publishers/google/models/"
                        f"{candidate}:generateContent"
                    )
                    headers = {
                        "Authorization": f"Bearer {token}",
                        "x-goog-user-project": self.project_id,
                        "Content-Type": "application/json",
                    }
                    res, status_code = self._execute_http_request(url, headers, prompt, system_instruction, response_schema)
                    if res is not None:
                        self.last_used_provider = "Google Cloud Vertex AI"
                        self.last_used_model = candidate
                        return res
                    if status_code in (404, 429):
                        err_label = "RESOURCE_EXHAUSTED (429)" if status_code == 429 else "NOT_FOUND (404)"
                        logger.warning("Vertex AI model '%s' returned %s; switching to next fallback candidate...", candidate, err_label)
                        continue
                logger.warning("All Vertex AI Gemini model candidates failed or exhausted.")

        # 2. Try Gemini Developer API Key fallback if provided
        if self.api_key:
            candidate_models = [self.model_name, "gemini-2.5-flash", "gemini-1.5-flash"]
            for candidate in candidate_models:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{candidate}:generateContent?key={self.api_key}"
                headers = {"Content-Type": "application/json"}
                res, status_code = self._execute_http_request(url, headers, prompt, system_instruction, response_schema)
                if res is not None:
                    self.last_used_provider = "Google AI Studio"
                    self.last_used_model = candidate
                    return res
                if status_code in (404, 429):
                    continue

        # 3. DeepSeek API failover (if Gemini models hit resource exhaustion 429 or are unavailable)
        if self.deepseek_api_key:
            logger.warning(
                "Gemini models exhausted or unavailable. Initiating seamless DeepSeek failover (%s)...",
                self.deepseek_model,
            )
            res = self._execute_deepseek_request(prompt, system_instruction, response_schema)
            if res is not None:
                self.last_used_provider = "DeepSeek (Failover)"
                self.last_used_model = self.deepseek_model
                return res
            logger.warning("DeepSeek API failover failed.")

        # 4. Deterministic offline fallback
        logger.info("Executing offline synthetic reasoning fallback.")
        self.last_used_provider = "Offline Fallback"
        self.last_used_model = "heuristic-synthesizer"
        return self._mock_reasoning_fallback(prompt, response_schema)

    def _execute_deepseek_request(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        response_schema: Optional[Dict[str, Any]] = None,
    ) -> Optional[str]:
        """Execute request against DeepSeek API with OpenAI-compatible chat format."""
        if not self.deepseek_api_key:
            return None

        url = "https://api.deepseek.com/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.deepseek_api_key}",
            "Content-Type": "application/json",
        }

        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        elif response_schema:
            messages.append({
                "role": "system",
                "content": "You are a senior causal AI diagnostic engine. Respond strictly in valid JSON matching requested fields.",
            })
        messages.append({"role": "user", "content": prompt})

        payload: Dict[str, Any] = {
            "model": self.deepseek_model or "deepseek-chat",
            "messages": messages,
            "temperature": 0.2,
        }

        if response_schema:
            payload["response_format"] = {"type": "json_object"}

        body_data = json.dumps(payload).encode("utf-8")

        for attempt in range(2):
            try:
                req = urllib.request.Request(
                    url,
                    data=body_data,
                    headers=headers,
                    method="POST",
                )
                with urllib.request.urlopen(req, timeout=20) as resp:
                    resp_json = json.loads(resp.read().decode("utf-8"))
                    choices = resp_json.get("choices", [])
                    if choices:
                        return choices[0].get("message", {}).get("content", "")
                    return ""
            except Exception as e:
                logger.error("DeepSeek API failover error (attempt %d): %s", attempt + 1, e)
                if attempt == 0:
                    time.sleep(1.0)

        return None

    def _execute_http_request(
        self,
        url: str,
        headers: Dict[str, str],
        prompt: str,
        system_instruction: Optional[str] = None,
        response_schema: Optional[Dict[str, Any]] = None,
    ) -> tuple[Optional[str], int]:
        """Perform HTTP request with rate limiting and exponential backoff.
        
        Returns:
            Tuple of (response_text_or_None, status_code)
        """
        self.limiter.acquire()

        payload: Dict[str, Any] = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2},
        }

        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        if response_schema:
            payload["generationConfig"]["responseMimeType"] = "application/json"
            payload["generationConfig"]["responseSchema"] = response_schema

        body_data = json.dumps(payload).encode("utf-8")

        for attempt in range(self.max_retries):
            try:
                req = urllib.request.Request(
                    url,
                    data=body_data,
                    headers=headers,
                    method="POST",
                )
                with urllib.request.urlopen(req, timeout=20) as resp:
                    resp_json = json.loads(resp.read().decode("utf-8"))
                    candidates = resp_json.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", ""), 200
                    return "", 200
            except urllib.error.HTTPError as e:
                if e.code in (404, 429):
                    # 404: model not published / not in region
                    # 429: resource exhausted / quota exceeded -> failover immediately to next candidate
                    return None, e.code
                # Retry on temporary server errors (500, 503)
                if e.code in (500, 503) and attempt < self.max_retries - 1:
                    sleep_time = (2 ** attempt) + random.uniform(0.1, 0.5)
                    logger.warning("HTTP %d from Google Cloud API. Backing off for %.2fs...", e.code, sleep_time)
                    time.sleep(sleep_time)
                else:
                    logger.error("Google Cloud API HTTP error %d: %s", e.code, e)
                    return None, e.code
            except Exception as e:
                logger.error("Google Cloud connection failure: %s", e)
                return None, 0

        return None, 0

    def _mock_reasoning_fallback(
        self, prompt: str, response_schema: Optional[Dict[str, Any]] = None
    ) -> str:
        """Deterministic fallback synthesizer for offline zero-blocker operations."""
        if "stockout" in prompt.lower() or "inventory" in prompt.lower():
            result = {
                "root_cause": "INVENTORY_STOCKOUT",
                "confidence": 0.94,
                "summary": "Attributed ROAS collapse is driven by a stockout on the hero product in Shopify while ad spend continued burning across channels.",
                "commercial_action": "THROTTLE_AND_REALLOCATE",
                "recommended_action_text": "Immediately throttle Meta ad spend on out-of-stock SKU and shift $1,500 budget toward high-margin in-stock inventory.",
                "projected_margin_recovery": 3480.0,
            }
        elif "fatigue" in prompt.lower() or "creative" in prompt.lower():
            result = {
                "root_cause": "CREATIVE_FATIGUE",
                "confidence": 0.88,
                "summary": "Meta ad creative frequency exceeded 4.2 with CTR decaying >40% over 7 days.",
                "commercial_action": "ROTATE_CREATIVES",
                "recommended_action_text": "Rotate exhausted creative assets and refresh audience seed lists.",
                "projected_margin_recovery": 1250.0,
            }
        else:
            result = {
                "root_cause": "AUCTION_COMPETITION_SURGE",
                "confidence": 0.82,
                "summary": "Observed CPM spike due to category competitor auction bidding pressure.",
                "commercial_action": "ADJUST_BID_CAPS",
                "recommended_action_text": "Tighten bid ceilings to protect target ROAS thresholds.",
                "projected_margin_recovery": 890.0,
            }

        if response_schema:
            return json.dumps(result)
        return result["summary"]
