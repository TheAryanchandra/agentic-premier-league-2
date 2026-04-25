import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class LearningRepository:
    def __init__(self, database_path: str):
        self.database_path = Path(database_path)

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        return connection

    def initialize(self) -> None:
        with self._connect() as connection:
            connection.executescript(
                """
                CREATE TABLE IF NOT EXISTS learners (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    pace TEXT NOT NULL,
                    learning_style TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS domain_profiles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    learner_id INTEGER NOT NULL,
                    domain TEXT NOT NULL,
                    knowledge_level TEXT NOT NULL,
                    mastered_concepts TEXT NOT NULL DEFAULT '[]',
                    struggle_notes TEXT NOT NULL DEFAULT '[]',
                    last_score REAL,
                    updated_at TEXT NOT NULL,
                    UNIQUE(learner_id, domain),
                    FOREIGN KEY (learner_id) REFERENCES learners(id)
                );

                CREATE TABLE IF NOT EXISTS interactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    learner_id INTEGER NOT NULL,
                    concept TEXT NOT NULL,
                    domain TEXT NOT NULL,
                    objective TEXT,
                    response_payload TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY (learner_id) REFERENCES learners(id)
                );
                """
            )

    def upsert_learner(self, name: str, pace: str, learning_style: str) -> dict[str, Any]:
        now = utc_now()
        with self._connect() as connection:
            cursor = connection.execute(
                """
                INSERT INTO learners (name, pace, learning_style, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (name, pace, learning_style, now, now),
            )
            learner_id = cursor.lastrowid

        learner = self.get_learner(learner_id)
        if learner is None:
            raise RuntimeError("Learner creation failed.")
        return learner

    def get_learner(self, learner_id: int) -> dict[str, Any] | None:
        with self._connect() as connection:
            row = connection.execute(
                "SELECT * FROM learners WHERE id = ?",
                (learner_id,),
            ).fetchone()
        return dict(row) if row else None

    def upsert_domain_profile(
        self,
        learner_id: int,
        domain: str,
        knowledge_level: str,
        mastered_concepts: list[str] | None = None,
        struggle_notes: list[str] | None = None,
        last_score: float | None = None,
    ) -> None:
        now = utc_now()
        with self._connect() as connection:
            existing = connection.execute(
                """
                SELECT id, mastered_concepts, struggle_notes, last_score
                FROM domain_profiles
                WHERE learner_id = ? AND domain = ?
                """,
                (learner_id, domain),
            ).fetchone()

            mastered = mastered_concepts
            struggles = struggle_notes
            score = last_score

            if existing:
                if mastered is None:
                    mastered = json.loads(existing["mastered_concepts"])
                if struggles is None:
                    struggles = json.loads(existing["struggle_notes"])
                if score is None:
                    score = existing["last_score"]
                connection.execute(
                    """
                    UPDATE domain_profiles
                    SET knowledge_level = ?, mastered_concepts = ?, struggle_notes = ?,
                        last_score = ?, updated_at = ?
                    WHERE learner_id = ? AND domain = ?
                    """,
                    (
                        knowledge_level,
                        json.dumps(mastered or []),
                        json.dumps(struggles or []),
                        score,
                        now,
                        learner_id,
                        domain,
                    ),
                )
            else:
                connection.execute(
                    """
                    INSERT INTO domain_profiles (
                        learner_id, domain, knowledge_level, mastered_concepts,
                        struggle_notes, last_score, updated_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        learner_id,
                        domain,
                        knowledge_level,
                        json.dumps(mastered or []),
                        json.dumps(struggles or []),
                        score,
                        now,
                    ),
                )

    def get_domain_profile(self, learner_id: int, domain: str) -> dict[str, Any] | None:
        with self._connect() as connection:
            row = connection.execute(
                """
                SELECT * FROM domain_profiles
                WHERE learner_id = ? AND domain = ?
                """,
                (learner_id, domain),
            ).fetchone()
        if not row:
            return None

        result = dict(row)
        result["mastered_concepts"] = json.loads(result["mastered_concepts"])
        result["struggle_notes"] = json.loads(result["struggle_notes"])
        return result

    def save_interaction(
        self,
        learner_id: int,
        concept: str,
        domain: str,
        objective: str,
        response_payload: dict[str, Any],
    ) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                INSERT INTO interactions (
                    learner_id, concept, domain, objective, response_payload, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    learner_id,
                    concept,
                    domain,
                    objective,
                    json.dumps(response_payload),
                    utc_now(),
                ),
            )

    def get_interaction_history(self, learner_id: int) -> list[dict[str, Any]]:
        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT concept, domain, objective, response_payload, created_at
                FROM interactions
                WHERE learner_id = ?
                ORDER BY id DESC
                LIMIT 20
                """,
                (learner_id,),
            ).fetchall()

        history: list[dict[str, Any]] = []
        for row in rows:
            item = dict(row)
            item["response_payload"] = json.loads(item["response_payload"])
            history.append(item)
        return history


class FirestoreRepository:
    def __init__(self):
        try:
            from google.cloud import firestore
            self.db = firestore.Client()
        except Exception:
            self.db = None

    def initialize(self) -> None:
        # Firestore doesn't need explicit initialization like SQL
        pass

    def upsert_learner(self, name: str, pace: str, learning_style: str) -> dict[str, Any]:
        doc_ref = self.db.collection("learners").document()
        data = {
            "name": name,
            "pace": pace,
            "learning_style": learning_style,
            "created_at": utc_now(),
            "updated_at": utc_now(),
        }
        doc_ref.set(data)
        data["id"] = doc_ref.id
        return data

    def get_learner(self, learner_id: Any) -> dict[str, Any] | None:
        doc = self.db.collection("learners").document(str(learner_id)).get()
        if doc.exists:
            data = doc.to_dict()
            data["id"] = doc.id
            return data
        return None

    def upsert_domain_profile(
        self,
        learner_id: Any,
        domain: str,
        knowledge_level: str,
        mastered_concepts: list[str] | None = None,
        struggle_notes: list[str] | None = None,
        last_score: float | None = None,
    ) -> None:
        profile_id = f"{learner_id}_{domain}"
        doc_ref = self.db.collection("domain_profiles").document(profile_id)
        
        data = {
            "learner_id": str(learner_id),
            "domain": domain,
            "knowledge_level": knowledge_level,
            "updated_at": utc_now(),
        }
        if mastered_concepts is not None:
            data["mastered_concepts"] = mastered_concepts
        if struggle_notes is not None:
            data["struggle_notes"] = struggle_notes
        if last_score is not None:
            data["last_score"] = last_score
            
        doc_ref.set(data, merge=True)

    def get_domain_profile(self, learner_id: Any, domain: str) -> dict[str, Any] | None:
        profile_id = f"{learner_id}_{domain}"
        doc = self.db.collection("domain_profiles").document(profile_id).get()
        if doc.exists:
            return doc.to_dict()
        return None

    def save_interaction(
        self,
        learner_id: Any,
        concept: str,
        domain: str,
        objective: str,
        response_payload: dict[str, Any],
    ) -> None:
        self.db.collection("interactions").add({
            "learner_id": str(learner_id),
            "concept": concept,
            "domain": domain,
            "objective": objective,
            "response_payload": response_payload,
            "created_at": utc_now(),
        })

    def get_interaction_history(self, learner_id: Any) -> list[dict[str, Any]]:
        docs = (
            self.db.collection("interactions")
            .where("learner_id", "==", str(learner_id))
            .order_by("created_at", direction="DESCENDING")
            .limit(20)
            .stream()
        )
        return [doc.to_dict() for doc in docs]
