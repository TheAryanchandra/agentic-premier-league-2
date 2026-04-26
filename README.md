

---

````markdown
# 🧠 Concept Learning Engine

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-green.svg)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🚀 Problem Statement

Create an intelligent assistant that helps users learn new concepts effectively.  
The system should personalize content and adapt dynamically to the user’s pace, understanding, and learning style.

---

## 💡 Solution

**Concept Learning Engine** is a multi-domain adaptive learning platform that transforms how users understand complex topics.

From **Quantum Physics → System Design → History**, the engine dynamically personalizes explanations based on:

- Age group  
- Learning pace  
- Understanding level  
- Preferred learning style  

Delivering a deeply tailored and effective learning experience.

---

## 🌐 Live Demo

🚀 Try it here:  
👉 https://concept-learning-engine-551694156067.asia-south1.run.app/

---

## ✨ Key Features

### 🚀 Smart Discovery
- **Debounced Autocomplete**  
  Real-time intelligent suggestions while typing  
- **Adaptive Recommendations**  
  Context-aware topic suggestions based on user profile  

---

### 🎭 Personalization Engine
- **Granular Age Profiles**  
  Covers 10+ categories (Pre-school → Senior Professional)  

- **Learning Style Modes**
  - Example-based  
  - Theory-first  
  - Balanced  

- **Progressive Memory**
  - Tracks user learning journey across sessions  

---

### 📖 Premium Learning Experience
- **Modern UI/UX**
  - Glassmorphism design  
  - Mesh gradients  
  - Smooth micro-interactions  

- **Deep Dive Mode**
  - Expandable concept breakdowns  

- **Live Source Context**
  - Wikipedia  
  - GitHub  
  - External knowledge sources  

- **Knowledge Checks**
  - Instant quizzes for reinforcement  

---

## 🛠️ Tech Stack

| Layer        | Technology |
|-------------|-----------|
| Backend     | Python 3.11, Flask |
| Frontend    | Vanilla JS (ES6+), Modern CSS3 |
| Database    | SQLite (Local), Firestore (Cloud-ready) |
| AI Engine   | Gemini / Vertex AI |
| Deployment  | Docker, Google Cloud Run |

---

## 📂 Project Structure

```text
├── app.py                  # Flask app & API routes
├── services/
│   ├── learning_engine.py # Core orchestration logic
│   ├── llm.py             # AI personalization layer
│   ├── storage.py         # Persistence (SQLite / Firestore)
│   └── sources.py         # External data aggregation
├── static/
│   ├── style.css          # Design system (HSL-based)
│   └── script.js          # Frontend logic
├── templates/
│   └── index.html         # UI entry point
└── Dockerfile             # Production container config
````

---

## 🚦 Getting Started

### 1. Prerequisites

* Python 3.11+
* (Optional) Google Cloud credentials for AI features

---

### 2. Installation

```bash
git clone https://github.com/TheAryanchandra/agentic-premier-league-2.git
cd agentic-premier-league-2

pip install -r requirements.txt
```

---

### 3. Environment Setup

```bash
cp .env.example .env
```

Add your API keys if needed.

> 💡 If no API key is provided, the app runs in **Deterministic Tutor Mode** (offline-friendly).

---

### 4. Run Locally

```bash
python app.py
```

Open:
👉 [http://localhost:8080](http://localhost:8080)

---



## 🛡️ Security & Privacy

* 🔐 Environment variables managed via `.env`
* 👤 Session-based learning persistence
* ⚙️ Fully functional without external API keys
* ☁️ Cloud-ready architecture

---

## 💡 Use Cases

* 📚 Students learning complex subjects
* 👨‍💻 Developers exploring new technologies
* 🎯 Self-learners building structured knowledge
* 🧑‍🏫 Educators creating adaptive teaching flows

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---
