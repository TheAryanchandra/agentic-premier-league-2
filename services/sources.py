import os
from typing import Any

import requests


class SourceAggregator:
    def __init__(self) -> None:
        self.news_api_key = os.getenv("NEWS_API_KEY", "")

    def gather(self, concept: str, domain: str) -> list[dict[str, Any]]:
        sources: list[dict[str, Any]] = []
        sources.extend(self._fetch_wikipedia(concept))

        if domain == "technology":
            sources.extend(self._fetch_github(concept))
        if domain in {"business", "general"} and self.news_api_key:
            sources.extend(self._fetch_news(concept))

        return sources

    def _fetch_wikipedia(self, concept: str) -> list[dict[str, Any]]:
        try:
            response = requests.get(
                f"https://en.wikipedia.org/api/rest_v1/page/summary/{concept}",
                timeout=6,
                headers={"User-Agent": "concept-learning-engine/1.0"},
            )
            if response.ok:
                data = response.json()
                extract = data.get("extract")
                if extract:
                    return [
                        {
                            "source": "Wikipedia",
                            "title": data.get("title", concept),
                            "snippet": extract,
                            "url": data.get("content_urls", {})
                            .get("desktop", {})
                            .get("page", "https://wikipedia.org"),
                        }
                    ]
        except requests.RequestException:
            return []
        return []

    def _fetch_github(self, concept: str) -> list[dict[str, Any]]:
        try:
            response = requests.get(
                "https://api.github.com/search/repositories",
                params={"q": concept, "sort": "stars", "per_page": 3},
                timeout=6,
                headers={"Accept": "application/vnd.github+json"},
            )
            if response.ok:
                items = response.json().get("items", [])
                return [
                    {
                        "source": "GitHub",
                        "title": item["full_name"],
                        "snippet": item.get("description") or "Popular repository related to the concept.",
                        "url": item["html_url"],
                    }
                    for item in items
                ]
        except requests.RequestException:
            return []
        return []

    def _fetch_news(self, concept: str) -> list[dict[str, Any]]:
        try:
            response = requests.get(
                "https://newsapi.org/v2/everything",
                params={"q": concept, "pageSize": 3, "apiKey": self.news_api_key, "language": "en"},
                timeout=6,
            )
            if response.ok:
                articles = response.json().get("articles", [])
                return [
                    {
                        "source": "NewsAPI",
                        "title": article["title"],
                        "snippet": article.get("description") or article.get("content") or "",
                        "url": article["url"],
                    }
                    for article in articles
                ]
        except requests.RequestException:
            return []
        return []
