from typing import Any

from services.domain import detect_domain
from services.llm import LLMClient
from services.personalization import build_fallback_response, build_personalization_context
from services.sources import SourceAggregator
from services.storage import LearningRepository


class LearningEngine:
    def __init__(self, repository: LearningRepository):
        self.repository = repository
        self.sources = SourceAggregator()
        self.llm = LLMClient()

    def generate_learning_experience(
        self,
        learner_id: int,
        concept: str,
        preferred_domain: str | None = None,
        context: str = "daily life",
        quick_wins: dict[str, bool] | None = None,
        objective: str = "",
    ) -> dict[str, Any]:
        learner = self.repository.get_learner(learner_id)
        if learner is None:
            raise ValueError("Learner not found.")

        domain = detect_domain(f"{concept} {objective}", preferred_domain=preferred_domain)
        domain_profile = self.repository.get_domain_profile(learner_id, domain)
        if domain_profile is None:
            self.repository.upsert_domain_profile(
                learner_id=learner_id,
                domain=domain,
                knowledge_level="beginner",
            )
            domain_profile = self.repository.get_domain_profile(learner_id, domain)

        personalization = build_personalization_context(
            learner=learner,
            domain_profile=domain_profile,
            concept=concept,
            objective=objective,
            context=context,
            quick_wins=quick_wins or {},
        )
        source_cards = self.sources.gather(concept=concept, domain=domain)

        generated = self.llm.generate(
            domain=domain,
            personalization=personalization,
            sources=source_cards,
        )

        source_highlights = [
            f"{item['source']}: {item['title']} - {item['snippet'][:120]}"
            for item in source_cards
        ]
        content = generated or build_fallback_response(personalization, domain, source_highlights)

        result = {
            "learner": learner,
            "domain": domain,
            "profile": domain_profile,
            "personalization": personalization,
            "content": content,
            "sources": source_cards,
        }

        self.repository.save_interaction(
            learner_id=learner_id,
            concept=concept,
            domain=domain,
            objective=objective,
            response_payload=result,
        )
        return result
