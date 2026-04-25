import os

from flask import Flask, jsonify, render_template, request

from services.learning_engine import LearningEngine
from services.storage import LearningRepository


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")
    app.config["DATABASE_PATH"] = os.getenv("DATABASE_PATH", "learning.db")

    if os.getenv("USE_FIREBASE") == "true":
        from services.storage import FirestoreRepository
        repository = FirestoreRepository()
    else:
        repository = LearningRepository(app.config["DATABASE_PATH"])
        repository.initialize()

    engine = LearningEngine(repository=repository)

    @app.get("/")
    def index():
        return render_template("index.html")

    @app.get("/health")
    def health():
        return jsonify({"status": "ok"})

    @app.post("/api/profile")
    def save_profile():
        payload = request.get_json(silent=True) or {}

        learner = repository.upsert_learner(
            name=payload.get("name", "Learner").strip() or "Learner",
            pace=payload.get("pace", "moderate"),
            learning_style=payload.get("learning_style", "example-based"),
        )

        domain_levels = payload.get("domain_levels", {}) or {}
        for domain, level in domain_levels.items():
            repository.upsert_domain_profile(
                learner_id=learner["id"],
                domain=domain,
                knowledge_level=level,
            )

        return jsonify({"learner": learner})

    @app.post("/api/learn")
    def learn():
        payload = request.get_json(silent=True) or {}

        learner_id = payload.get("learner_id")
        concept = (payload.get("concept") or "").strip()
        if not learner_id or not concept:
            return jsonify({"error": "learner_id and concept are required"}), 400

        result = engine.generate_learning_experience(
            learner_id=learner_id,
            concept=concept,
            preferred_domain=payload.get("domain"),
            context=payload.get("context", "daily life"),
            quick_wins=payload.get("quick_wins", {}),
            objective=payload.get("objective", ""),
        )
        return jsonify(result)

    @app.get("/api/history/<learner_id>")
    def history(learner_id: str):
        return jsonify({"history": repository.get_interaction_history(learner_id)})

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "8080")), debug=True)
