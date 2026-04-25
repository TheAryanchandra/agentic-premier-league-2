from typing import Any


def build_personalization_context(
    learner: dict[str, Any],
    domain_profile: dict[str, Any] | None,
    concept: str,
    objective: str,
    context: str = "daily life",
    quick_wins: dict[str, Any] | None = None,
) -> dict[str, Any]:
    pace = learner["pace"]
    style = learner["learning_style"]
    knowledge_level = (domain_profile or {}).get("knowledge_level", "beginner")
    mastered = (domain_profile or {}).get("mastered_concepts", [])
    struggles = (domain_profile or {}).get("struggle_notes", [])

    if pace == "fast":
        depth = "concise"
    elif pace == "slow":
        depth = "step-by-step"
    else:
        depth = "balanced"

    terminology = "plain language" if knowledge_level == "beginner" else "mixed technical language"
    if knowledge_level == "advanced":
        terminology = "technical language"

    return {
        "concept": concept,
        "objective": objective or "Understand the concept well enough to explain it back.",
        "pace": pace,
        "style": style,
        "knowledge_level": knowledge_level,
        "depth": depth,
        "terminology": terminology,
        "mastered_concepts": mastered,
        "struggle_notes": struggles,
        "context": context,
        "quick_wins": quick_wins or {},
    }


def build_fallback_response(
    context: dict[str, Any],
    domain: str,
    source_highlights: list[str],
) -> dict[str, Any]:
    concept = context["concept"]
    style = context["style"]
    knowledge_level = context["knowledge_level"]
    depth = context["depth"]

    explanation = [
        f"{concept} sits in the {domain} domain.",
        f"This explanation is tuned for a {knowledge_level} learner and uses a {depth} pace.",
    ]

    if style == "visual":
        explanation.append(
            "Picture it as a small system with inputs, a process in the middle, and outputs you can observe."
        )
    elif style == "textual":
        explanation.append(
            "We will focus on a clean definition first, then connect it to why it matters."
        )
    else:
        explanation.append(
            "We will anchor the idea through examples so the concept feels concrete quickly."
        )

    if source_highlights:
        explanation.append("Live source context suggests these useful anchors:")
        explanation.extend(source_highlights[:3])

    return {
        "summary": " ".join(explanation),
        "key_points": [
            f"Definition: {concept} should be understood in terms of purpose, mechanism, and result.",
            f"Adaptation: The system is avoiding jargon overload because your profile is {knowledge_level}.",
            "Retention tip: Rephrase the concept in your own words and compare it with one familiar example.",
        ],
        "next_steps": [
            f"Ask for a worked example of {concept}.",
            f"Ask how {concept} changes across beginner and advanced use cases.",
            f"Try a quick self-check: explain {concept} in two sentences.",
        ],
        "quiz": [
            {
                "question": f"In one line, what problem does {concept} solve?",
                "expected_focus": "purpose",
            },
            {
                "question": f"What changes about {concept} when the context becomes more complex?",
                "expected_focus": "adaptation",
            },
        ],
    }
