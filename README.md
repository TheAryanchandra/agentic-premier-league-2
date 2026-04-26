# Concept Learning Engine

An intelligent assistant that helps users learn new concepts effectively. The system personalizes content and adapts to user's pace and understanding.

---

## Problem Statement

**Create an intelligent assistant that helps users learn new concepts effectively. The system should personalize content and adapt to user's pace and understanding.**

---


---

## Live Demo

Try it here: https://concept-learning-engine-551694156067.asia-south1.run.app/

---


## How It Works

The Concept Learning Engine adapts learning content based on:

- **User's Pace** - Learn faster or slower as needed
- **Understanding Level** - Content adjusts to your comprehension
- **Learning Style** - Personalized explanations tailored to you

---

## Features

### Adaptive Learning
- Content adjusts in real-time to your learning speed
- System tracks your understanding level
- Personalized explanations based on your learning style

### Smart Content
- Real-time intelligent suggestions
- Topic recommendations based on your profile
- Multi-domain concept coverage

### Progress Tracking
- Sessions automatically saved
- Tracks your learning journey
- Resume from where you left off

### Knowledge Verification
- Built-in quizzes for reinforcement
- Instant feedback on understanding

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | Python 3.11, Flask |
| Frontend | Vanilla JavaScript, CSS3 |
| Database | SQLite / Firestore |
| AI Engine | Google Gemini / Vertex AI |
| Deployment | Docker, Google Cloud Run |

---

## Project Structure

```
├── app.py                  # Flask application
├── services/
│   ├── learning_engine.py # Core learning logic
│   ├── llm.py             # AI personalization
│   ├── storage.py         # Data persistence
│   └── sources.py         # External data
├── static/
│   ├── style.css          # Styling
│   └── script.js          # Frontend logic
├── templates/
│   └── index.html         # Main UI
└── Dockerfile             # Container config
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- pip (Python package manager)
- (Optional) Google Cloud credentials

### Installation

1. Clone the repository
```bash
git clone https://github.com/TheAryanchandra/agentic-premier-league-2.git
cd agentic-premier-league-2
```

2. Install dependencies
```bash
pip install -r requirements.txt
```

3. Setup environment
```bash
cp .env.example .env
```

4. Run locally
```bash
python app.py
```

Open: **http://localhost:8080**


## Use Cases

- **Students** - Learn complex subjects at your own pace
- **Developers** - Explore new technologies tailored to your level
- **Self-Learners** - Build structured knowledge independently
- **Educators** - Create adaptive learning flows for diverse classrooms

---

## Security & Privacy

- Environment variables protected via `.env`
- Session-based learning persistence
- Works without external API keys
- Cloud-ready architecture

---

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---