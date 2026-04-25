# 🧠 Concept Learning Engine

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-green.svg)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A state-of-the-art **Multi-Domain Adaptive Learning Platform** designed to transform how you master new concepts. Whether it's Quantum Physics, REST APIs, or World War II, the Concept Learning Engine personalizes every lesson to your pace, knowledge level, and learning style.

---

## ✨ Key Features

### 🚀 Smart Discovery
- **Debounced Autocomplete**: Real-time concept suggestions as you type.
- **Adaptive Recommendations**: Context-aware topics suggested based on your specific age group and domain interests.

### 🎭 Personalization Engine
- **Granular Profiles**: 10+ age group categories from "Pre-school" to "Senior Professional."
- **Learning Styles**: Choose between example-based, theory-first, or balanced approaches.
- **Progressive Memory**: Remembers your learning journey across sessions.

### 📖 Premium Lesson Experience
- **Ultra-Premium UI**: Sophisticated glassmorphism design with mesh-gradient backgrounds and smooth animations.
- **Deep Dive Mode**: Expandable detailed breakdowns for when you need to go beyond the basics.
- **Live Source Context**: Real-time context pulled from Wikipedia, GitHub, and major repositories.
- **Knowledge Checks**: Instant quizzes to verify your understanding.

---

## 🛠️ Technology Stack

- **Backend**: Python 3.11, Flask
- **Database**: SQLite (Local) / Firestore (Cloud ready)
- **Frontend**: Vanilla JS (ES6+), Modern CSS3 (HSL-based design system)
- **AI/LLM**: Integrated with Gemini/Vertex AI for dynamic lesson generation
- **Deployment**: Docker, Google Cloud Run

---

## 📂 Project Structure

```text
├── app.py              # Main Flask application & API routes
├── services/
│   ├── learning_engine.py  # Core orchestration logic
│   ├── llm.py              # AI Personalization service
│   ├── storage.py          # Data persistence layer (SQLite/Firestore)
│   └── sources.py          # Real-time data aggregation (Wiki/GitHub)
├── static/
│   ├── style.css           # Ultra-Premium HSL design system
│   └── script.js           # Frontend logic & Autocomplete engine
├── templates/
│   └── index.html          # Responsive learning interface
└── Dockerfile              # Production-ready container config
```

---

## 🚦 Getting Started

### 1. Prerequisites
- Python 3.11+
- [Optional] Google Cloud Credentials for Vertex AI

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/concept-learning-engine.git
cd concept-learning-engine

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Setup
Copy `.env.example` to `.env` and configure your keys:
```bash
cp .env.example .env
```
*Note: If no API key is provided, the engine operates in a high-quality "Deterministic Tutor" mode for local testing.*

### 4. Run Locally
```bash
python app.py
```
Open [http://localhost:8080](http://localhost:8080) to start learning!

---

## 🚢 Production Deployment

The platform is optimized for **Google Cloud Run**.

### Build & Push
```bash
gcloud builds submit --tag gcr.io/[PROJECT_ID]/concept-learning-engine
```

### Deploy
```bash
gcloud run deploy concept-learning-engine \
  --image gcr.io/[PROJECT_ID]/concept-learning-engine \
  --platform managed \
  --allow-unauthenticated \
  --port 8080
```

---

## 🛡️ Security & Privacy
- **Environment Isolation**: Sensitive keys are managed via `.env` (excluded from Git).
- **Session Privacy**: Local history is persisted per-learner ID.
- **No-Key Fallback**: Ensures functionality even in restricted environments.

---

## 🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or new features.

