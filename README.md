# Concept Learning Engine

A multi-domain adaptive learning platform built with Flask. It helps learners understand new concepts across sports, technology, business, science, history, and general knowledge by personalizing explanations to pace, knowledge level, and preferred learning style.

## What It Does

- Learner profiles store pace, preferred explanation style, and per-domain knowledge levels.
- Domain detection routes questions like `DLS method`, `REST APIs`, or `photosynthesis` into the right learning context.
- Source aggregation pulls live context from real services such as Wikipedia, GitHub, and optionally NewsAPI.
- Response generation supports an LLM-backed mode or a no-key fallback so the app still works during demos.
- A simple web UI makes it easy to create a learner profile and request personalized lessons.

## Architecture

```text
Browser UI
  -> Flask API
    -> SQLite learner memory
    -> Domain detector
    -> Source aggregator
    -> LLM personalizer or fallback response builder
```

## Project Structure

```text
app.py
services/
  domain.py
  learning_engine.py
  llm.py
  personalization.py
  sources.py
  storage.py
templates/index.html
static/style.css
static/script.js
Dockerfile
requirements.txt
```

## Local Run

1. Create and activate a virtual environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Copy `.env.example` values into your environment if you want live LLM or NewsAPI support.
4. Start the app:

```bash
python app.py
```

5. Open `http://localhost:8080`.

## API Endpoints

### `POST /api/profile`

```json
{
  "name": "Aryan",
  "pace": "moderate",
  "learning_style": "example-based",
  "domain_levels": {
    "technology": "beginner",
    "sports": "intermediate",
    "business": "beginner"
  }
}
```

### `POST /api/learn`

```json
{
  "learner_id": 1,
  "concept": "REST APIs",
  "domain": "technology",
  "objective": "Explain it for interview prep"
}
```

## Deployment

The app is ready for container deployment.

```bash
docker build -t concept-learning-engine .
docker run -p 8080:8080 --env-file .env concept-learning-engine
```

For Cloud Run:

```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/concept-learning-engine
gcloud run deploy concept-learning-engine \
  --image gcr.io/PROJECT_ID/concept-learning-engine \
  --platform managed \
  --allow-unauthenticated \
  --port 8080
```

## Notes

- Without `LLM_API_KEY`, the app uses a deterministic fallback tutor so you can test the full product flow.
- `learning.db` is local SQLite by default. For production, mount durable storage or swap the repository layer for a managed database.
- Wikipedia and GitHub lookups are best-effort and fail gracefully if the network is unavailable.
