"""
HALO Legal Answer Generation Service
====================================
Synthesizes authoritative legal answers grounded strictly in retrieved statutory
and judicial evidence passages using Groq LLM inference.

Protocol:
- Delimited authoritative context prompt formulation matching Baseline 4/5.
- Deterministic sampling (temperature=0.0, seed=42).
- Key rotation and multi-key cooldown resilience.
- Clear error propagation if Groq API key is missing or service unreachable.
"""

import os
import json
import time
import urllib.request
import urllib.error
from typing import List, Dict, Any, Optional

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

SYSTEM_PROMPT = (
    "You are an authoritative Indian Legal Research Assistant specializing in the Companies Act, 2013 "
    "and Indian corporate jurisprudence. Answer the inquiry factually, accurately, and with precise statutory "
    "and judicial citations using the authoritative legal evidence provided below. "
    "If the provided context is insufficient or the proposition is unsupported, state so explicitly."
)


class GenerationServiceError(Exception):
    """Raised when legal answer synthesis fails or API is unconfigured."""
    pass


class LegalAnswerGenerationService:
    """Service for generating grounded legal answers via Groq LLM API."""

    _instance: Optional["LegalAnswerGenerationService"] = None

    def __init__(self):
        self.model_name = os.environ.get("GROQ_MODEL", "qwen/qwen3.8-27b")
        self.temperature = float(os.environ.get("GROQ_TEMPERATURE", 0.0))
        self.top_p = float(os.environ.get("GROQ_TOP_P", 1.0))
        self.max_tokens = int(os.environ.get("GROQ_MAX_TOKENS", 800))
        self.seed = int(os.environ.get("GROQ_SEED", 42))

        # Groq client instantiation
        self._groq_client = None

    @classmethod
    def get_instance(cls) -> "LegalAnswerGenerationService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _get_api_keys(self) -> List[str]:
        raw_key = os.environ.get("GROQ_API_KEY", "") or os.environ.get("GROQ_API_KEYS", "")
        if "," in raw_key:
            return [k.strip() for k in raw_key.split(",") if k.strip()]
        if raw_key.strip():
            return [raw_key.strip()]
        return []

    def construct_context_prompt(self, query_text: str, passages: List[Dict[str, Any]]) -> str:
        """Constructs prompt with clearly delimited authoritative evidence."""
        lines = [
            "AUTHORITATIVE LEGAL EVIDENCE",
            "=" * 50
        ]

        for i, p in enumerate(passages, 1):
            p_id = p.get("passage_id", f"PAS_{i:03d}")
            d_set = "Dataset 1 (Statutory - Companies Act, 2013)" if p.get("dataset") == "dataset1" else "Dataset 2 (Judicial Precedent)"
            lines.append(f"\n[EVIDENCE PASSAGE {i}]")
            lines.append(f"Passage ID: {p_id}")
            lines.append(f"Source: {d_set}")
            if p.get("section_id"):
                lines.append(f"Statutory Section: {p['section_id']}")
            if p.get("heading"):
                lines.append(f"Title / Heading: {p['heading']}")
            if p.get("court"):
                lines.append(f"Court: {p['court']}")
            if p.get("citation"):
                lines.append(f"Citation: {p['citation']}")
            lines.append(f"Passage Content:\n{p.get('text', '').strip()}")

        lines.append("\n" + "=" * 50)
        lines.append("END AUTHORITATIVE LEGAL EVIDENCE\n")
        lines.append(f"INQUIRY: {query_text.strip()}")
        lines.append(
            "Instructions: Based SOLELY on the authoritative legal evidence provided above, synthesize a complete, "
            "precise, and accurate answer to the inquiry. Cite relevant sections, clauses, and judicial precedents "
            "explicitly. If the provided evidence is silent or insufficient on any point, state that explicitly. "
            "Do NOT extrapolate beyond the supplied text."
        )

        return "\n".join(lines)

    def generate(self, query_text: str, passages: List[Dict[str, Any]]) -> str:
        """
        Executes Groq API generation over context-augmented prompt.
        Handles rate limits gracefully with retry-after backoff.
        Raises GenerationServiceError if API keys are missing or generation fails.
        """
        keys = self._get_api_keys()
        if not keys:
            raise GenerationServiceError(
                "GROQ_API_KEY environment variable is not configured. "
                "Please set GROQ_API_KEY in your backend .env file to enable live answer generation."
            )

        augmented_prompt = self.construct_context_prompt(query_text, passages)

        url = "https://api.groq.com/openai/v1/chat/completions"
        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": augmented_prompt}
            ],
            "temperature": self.temperature,
            "top_p": self.top_p,
            "max_tokens": self.max_tokens,
            "seed": self.seed
        }
        data_bytes = json.dumps(payload).encode("utf-8")

        max_attempts = 3
        last_error = None

        for attempt in range(max_attempts):
            for key in keys:
                req = urllib.request.Request(
                    url,
                    data=data_bytes,
                    headers={
                        "Authorization": f"Bearer {key}",
                        "Content-Type": "application/json",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) HALO-Pipeline/1.0"
                    }
                )
                try:
                    with urllib.request.urlopen(req, timeout=45) as resp:
                        resp_data = json.loads(resp.read().decode("utf-8"))
                        choices = resp_data.get("choices", [])
                        if choices:
                            text = choices[0].get("message", {}).get("content", "").strip()
                            if text:
                                return text
                except urllib.error.HTTPError as e:
                    last_error = e
                    if e.code == 429:
                        retry_after = 2.0
                        if e.headers and e.headers.get("retry-after"):
                            try:
                                retry_after = float(e.headers.get("retry-after")) + 0.5
                            except Exception:
                                pass
                        time.sleep(retry_after)
                        continue
                    elif e.code == 404:
                        # Try fallback model if configured model is unavailable
                        payload["model"] = "openai/gpt-oss-120b"
                        data_bytes = json.dumps(payload).encode("utf-8")
                        continue
                except Exception as e:
                    last_error = e
                    continue

        raise GenerationServiceError(f"Failed to generate answer via Groq API: {str(last_error)}")


def generate_answer(query_text: str, passages: List[Dict[str, Any]]) -> str:
    """Public helper function for legal answer generation."""
    service = LegalAnswerGenerationService.get_instance()
    return service.generate(query_text=query_text, passages=passages)
