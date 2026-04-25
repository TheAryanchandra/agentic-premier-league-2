from collections.abc import Iterable


DOMAIN_KEYWORDS = {
    "sports": {
        "ipl",
        "cricket",
        "football",
        "soccer",
        "nba",
        "sport",
        "player",
        "tournament",
        "bowling",
        "batting",
        "dls",
    },
    "technology": {
        "api",
        "python",
        "database",
        "cloud",
        "ml",
        "machine learning",
        "blockchain",
        "react",
        "algorithm",
        "rest",
        "devops",
        "kubernetes",
    },
    "business": {
        "marketing",
        "sales",
        "finance",
        "revenue",
        "segmentation",
        "economics",
        "pricing",
        "startup",
        "market",
        "balance sheet",
    },
    "science": {
        "physics",
        "biology",
        "chemistry",
        "photosynthesis",
        "atom",
        "energy",
        "evolution",
        "cell",
        "quantum",
    },
    "history": {
        "history",
        "war",
        "empire",
        "revolution",
        "timeline",
        "civilization",
        "world war",
    },
}


def detect_domain(text: str, preferred_domain: str | None = None) -> str:
    if preferred_domain:
        return preferred_domain.lower()

    normalized = text.lower()
    best_domain = "general"
    best_score = 0

    for domain, keywords in DOMAIN_KEYWORDS.items():
        score = sum(1 for keyword in keywords if keyword in normalized)
        if score > best_score:
            best_domain = domain
            best_score = score

    return best_domain


def related_domains(domain: str) -> Iterable[str]:
    mapping = {
        "sports": ["general"],
        "technology": ["science", "general"],
        "business": ["general"],
        "science": ["technology", "general"],
        "history": ["general"],
        "general": [],
    }
    return mapping.get(domain, ["general"])
