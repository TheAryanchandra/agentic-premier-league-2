import os

from flask import Flask, jsonify, render_template, request

from services.storage import LearningRepository
from services.learning_engine import LearningEngine
from services.otp_service import OTPService

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")
db_path = os.getenv("DATABASE_PATH", "learning.db")
repository = LearningRepository(db_path)
repository.initialize()
engine = LearningEngine(repository)
otp_service = OTPService()

@app.route("/")
def index():
    return render_template("index.html")

@app.post("/api/send-otp")
def send_otp():
    payload = request.get_json(silent=True) or {}
    mobile = payload.get("mobile")
    if not mobile or len(mobile) != 10:
        return jsonify({"error": "Valid 10-digit mobile required"}), 400
    
    code = otp_service.send_otp(mobile)
    repository.save_otp(mobile, code)
    
    return jsonify({
        "status": "sent", 
        "message": f"OTP sent to +91-{mobile}",
        "demo_code": code
    })

@app.get("/health")
def health():
    return jsonify({"status": "ok"})

@app.route("/api/profile", methods=["GET", "POST"])
def manage_profile():
    if request.method == "GET":
        # Return all learners for debugging/checking
        with repository._connect() as conn:
            rows = conn.execute("SELECT * FROM learners").fetchall()
            return jsonify({"learners": [dict(r) for r in rows]})

    payload = request.get_json(silent=True) or {}
    learner = repository.upsert_learner(
        name=payload.get("name", "Learner").strip() or "Learner",
        pace=payload.get("pace", "moderate"),
        learning_style=payload.get("learning_style", "example-based"),
        age_group=payload.get("age_group", "19-35"),
        mobile=payload.get("mobile"),
    )

    domain_levels = payload.get("domain_levels", {}) or {}
    for domain, level in domain_levels.items():
        repository.upsert_domain_profile(
            learner_id=learner["id"],
            domain=domain,
            knowledge_level=level,
        )

    return jsonify({"learner": learner})

@app.get("/api/profile/<learner_id>")
def get_profile(learner_id: str):
    learner = repository.get_learner(int(learner_id))
    if not learner:
        return jsonify({"error": "Learner not found"}), 404
    return jsonify({"learner": learner})

@app.get("/api/learn")
def learn_info():
    return jsonify({
        "message": "To generate a lesson, please use POST with learner_id and concept.",
        "example_payload": {
            "learner_id": 1,
            "concept": "REST APIs",
            "context": "daily life"
        }
    })

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
        image_data=payload.get("image_data"),
    )
    return jsonify(result)

@app.get("/api/history/<learner_id>")
def history(learner_id: str):
    return jsonify({"history": repository.get_interaction_history(learner_id)})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "8080")), debug=True)
