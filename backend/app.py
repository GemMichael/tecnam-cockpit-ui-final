import json
import os
import sqlite3
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent
DEFAULT_DB = BASE_DIR / "data" / "training.db"
DB_PATH = Path(
    os.getenv("TRAINING_DB_PATH", str(DEFAULT_DB))
).expanduser().resolve()
DB_PATH.parent.mkdir(parents=True, exist_ok=True)


app = FastAPI(
    title="Tecnam Cockpit Training API",
    version="1.0.0",
)


allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "TRAINING_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,"
        "http://localhost:4173,http://127.0.0.1:4173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TrainingSessionPayload(BaseModel):
    id: str
    startedAt: str
    updatedAt: str
    endedAt: Optional[str] = None
    status: str = "in_progress"
    metadata: Dict[str, Any] = Field(default_factory=dict)
    checklistEvents: List[Dict[str, Any]] = Field(default_factory=list)
    commsAttempts: List[Dict[str, Any]] = Field(default_factory=list)
    summary: Dict[str, Any] = Field(default_factory=dict)


def connect_db() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with connect_db() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS training_sessions (
                id TEXT PRIMARY KEY,
                started_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                ended_at TEXT,
                status TEXT NOT NULL,
                overall_score REAL NOT NULL DEFAULT 0,
                safety_status TEXT NOT NULL DEFAULT 'CLEAR',
                payload_json TEXT NOT NULL
            )
            """
        )

        connection.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_training_sessions_updated_at
            ON training_sessions(updated_at DESC)
            """
        )


@app.on_event("startup")
def startup_event() -> None:
    init_db()


@app.get("/api/health")
def health() -> Dict[str, Any]:
    return {
        "ok": True,
        "database": str(DB_PATH),
    }


@app.post("/api/training/sessions")
def save_training_session(
    payload: TrainingSessionPayload,
) -> Dict[str, Any]:
    data = payload.model_dump()
    summary = data.get("summary") or {}

    overall = float(summary.get("overall") or 0)
    safety_status = str(
        summary.get("safetyStatus") or "CLEAR"
    )

    serialized = json.dumps(
        data,
        ensure_ascii=False,
        separators=(",", ":"),
    )

    with connect_db() as connection:
        connection.execute(
            """
            INSERT INTO training_sessions (
                id,
                started_at,
                updated_at,
                ended_at,
                status,
                overall_score,
                safety_status,
                payload_json
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                started_at = excluded.started_at,
                updated_at = excluded.updated_at,
                ended_at = excluded.ended_at,
                status = excluded.status,
                overall_score = excluded.overall_score,
                safety_status = excluded.safety_status,
                payload_json = excluded.payload_json
            """,
            (
                data["id"],
                data["startedAt"],
                data["updatedAt"],
                data.get("endedAt"),
                data.get("status", "in_progress"),
                overall,
                safety_status,
                serialized,
            ),
        )

    return {
        "ok": True,
        "id": data["id"],
        "overall": overall,
        "safetyStatus": safety_status,
    }


@app.get("/api/training/sessions")
def list_training_sessions(
    limit: int = 50,
) -> List[Dict[str, Any]]:
    safe_limit = max(1, min(limit, 200))

    with connect_db() as connection:
        rows = connection.execute(
            """
            SELECT payload_json
            FROM training_sessions
            ORDER BY updated_at DESC
            LIMIT ?
            """,
            (safe_limit,),
        ).fetchall()

    return [
        json.loads(row["payload_json"])
        for row in rows
    ]


@app.get("/api/training/sessions/{session_id}")
def get_training_session(
    session_id: str,
) -> Dict[str, Any]:
    with connect_db() as connection:
        row = connection.execute(
            """
            SELECT payload_json
            FROM training_sessions
            WHERE id = ?
            """,
            (session_id,),
        ).fetchone()

    if row is None:
        raise HTTPException(
            status_code=404,
            detail="Training session not found",
        )

    return json.loads(row["payload_json"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host=os.getenv("TRAINING_API_HOST", "127.0.0.1"),
        port=int(os.getenv("TRAINING_API_PORT", "8000")),
    )