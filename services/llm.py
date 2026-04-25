import json
import os
from typing import Any

import requests


class LLMClient:
    def __init__(self) -> None:
        self.provider = os.getenv("LLM_PROVIDER", "mock").lower()
        self.model = os.getenv("LLM_MODEL", "gpt-4.1-mini")
        self.api_key = os.getenv("LLM_API_KEY", "")
        self.base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")

    def generate(
        self,
        domain: str,
        personalization: dict[str, Any],
        sources: list[dict[str, Any]],
    ) -> dict[str, Any] | None:
        if self.provider == "openai" and self.api_key:
            return self._generate_openai(domain, personalization, sources)
        return None

    def _generate_openai(
        self,
        domain: str,
        personalization: dict[str, Any],
        sources: list[dict[str, Any]],
    ) -> dict[str, Any] | None:
        prompt = self._build_prompt(domain, personalization, sources)

        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.model,
                    "temperature": 0.4,
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "You are an adaptive learning assistant. "
                                "Return JSON with summary, key_points, next_steps, and quiz."
                            ),
                        },
                        {"role": "user", "content": prompt},
                    ],
                    "response_format": {"type": "json_object"},
                },
                timeout=20,
            )
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            return json.loads(content)
        except (requests.RequestException, KeyError, ValueError):
            return None

    def _build_prompt(
        self,
        domain: str,
        personalization: dict[str, Any],
        sources: list[dict[str, Any]],
    ) -> str:
        source_lines = [
            f"- {item['source']}: {item['title']} | {item['snippet'][:220]} | {item['url']}"
            for item in sources[:5]
        ]
        source_block = "\n".join(source_lines) or "- No live sources available."

        context = personalization.get("context", "daily life")
        quick_wins = personalization.get("quick_wins", {})

        prompt = (
            f"Domain: {domain}\n"
            f"Concept: {personalization['concept']}\n"
            f"Objective: {personalization['objective']}\n"
            f"World Context: {context}\n"
            f"Learner pace: {personalization['pace']}\n"
            f"Learning style: {personalization['style']}\n"
            f"Knowledge level: {personalization['knowledge_level']}\n"
            f"Preferred depth: {personalization['depth']}\n"
            f"Terminology: {personalization['terminology']}\n"
        )

        if quick_wins.get("eli10"):
            prompt += "TONE: Explain like I'm 10 years old. Use very simple words.\n"
        
        if quick_wins.get("analogy"):
            prompt += f"MANDATORY: Use a detailed analogy based on the '{context}' world to explain the concept.\n"
        
        if quick_wins.get("test_me"):
            prompt += "QUIZ: Include a slightly more challenging quiz to test understanding.\n"

        prompt += (
            "\nUse the sources when relevant, but prioritize the selected World Context for examples.\n"
            "Sources:\n"
            f"{source_block}"
        )
        return prompt
