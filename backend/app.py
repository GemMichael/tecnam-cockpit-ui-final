import hashlib
import hmac
import json
import os
import re
import secrets
import sqlite3
import uuid
import shutil
import subprocess
import tempfile

from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field




# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

DEFAULT_DB = (
    BASE_DIR
    / "data"
    / "training.db"
)

DB_PATH = Path(
    os.getenv(
        "TRAINING_DB_PATH",
        str(DEFAULT_DB),
    )
).expanduser().resolve()

DB_PATH.parent.mkdir(
    parents=True,
    exist_ok=True,
)


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title="Tecnam Cockpit Training API",
    version="3.0.0",
)


# ============================================================
# CORS
# ============================================================

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "TRAINING_ALLOWED_ORIGINS",
        (
            "http://localhost,"
            "http://127.0.0.1,"
            "http://localhost:5173,"
            "http://127.0.0.1:5173,"
            "http://localhost:4173,"
            "http://127.0.0.1:4173"
        ),
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


class AtcSpeechRequest(BaseModel):

    text: str = Field(
        min_length=1,
        max_length=1000,
    )

# ============================================================
# ATC TEXT-TO-SPEECH
# ============================================================

ATC_TTS_VOICE = os.getenv(
    "ATC_TTS_VOICE",
    "en-us",
)

ATC_TTS_SPEED = int(
    os.getenv(
        "ATC_TTS_SPEED",
        "175",
    )
)

ATC_TTS_PITCH = int(
    os.getenv(
        "ATC_TTS_PITCH",
        "38",
    )
)

# ============================================================
# ATC TEXT-TO-SPEECH
# ============================================================

@app.post(
    "/api/tts/atc"
)
def generate_atc_voice(
    payload: AtcSpeechRequest
):

    text = payload.text.strip()

    if not text:
        raise HTTPException(
            status_code=400,
            detail="ATC speech text is required.",
        )


    # ========================================================
    # CHECK ESPEAK-NG
    # ========================================================

    espeak_path = shutil.which(
        "espeak-ng"
    )

    if not espeak_path:
        raise HTTPException(
            status_code=503,
            detail=(
                "espeak-ng is not installed "
                "on this system."
            ),
        )


    # ========================================================
    # TEMPORARY WAV FILE
    # ========================================================

    temporary_file = (
        tempfile.NamedTemporaryFile(
            suffix=".wav",
            delete=False,
        )
    )

    wav_path = Path(
        temporary_file.name
    )

    temporary_file.close()


    try:

        # ====================================================
        # GENERATE SPEECH
        # ====================================================

        result = subprocess.run(
            [
                espeak_path,

                "-v",
                ATC_TTS_VOICE,

                "-s",
                str(
                    ATC_TTS_SPEED
                ),

                "-p",
                str(
                    ATC_TTS_PITCH
                ),

                "-w",
                str(
                    wav_path
                ),

                text,
            ],

            capture_output=True,
            text=True,

            timeout=20,

            check=False,
        )


        if result.returncode != 0:

            raise HTTPException(
                status_code=500,

                detail=(
                    result.stderr.strip()
                    or
                    "ATC speech generation failed."
                ),
            )


        if (
            not wav_path.exists()
            or
            wav_path.stat().st_size == 0
        ):

            raise HTTPException(
                status_code=500,
                detail=(
                    "ATC speech generated "
                    "an empty audio file."
                ),
            )


        wav_data = (
            wav_path.read_bytes()
        )


        return Response(
            content=wav_data,

            media_type="audio/wav",

            headers={
                "Cache-Control":
                    "no-store",
            },
        )


    except subprocess.TimeoutExpired:

        raise HTTPException(
            status_code=504,
            detail=(
                "ATC speech generation "
                "timed out."
            ),
        )


    finally:

        try:
            wav_path.unlink(
                missing_ok=True
            )

        except OSError:
            pass
# ============================================================
# HELPERS
# ============================================================

def now_iso() -> str:
    return datetime.now(
        timezone.utc
    ).isoformat()


def new_id(prefix: str) -> str:
    return (
        f"{prefix}-"
        f"{uuid.uuid4()}"
    )


# ============================================================
# PIN SECURITY
# ============================================================

PIN_ITERATIONS = 200_000


def hash_pin(
    pin: str,
    salt: Optional[str] = None,
) -> tuple[str, str]:

    if salt is None:
        salt = secrets.token_hex(16)

    derived = hashlib.pbkdf2_hmac(
        "sha256",
        pin.encode("utf-8"),
        bytes.fromhex(salt),
        PIN_ITERATIONS,
    )

    return (
        salt,
        derived.hex(),
    )


def verify_pin(
    pin: str,
    salt: str,
    expected_hash: str,
) -> bool:

    _, calculated_hash = hash_pin(
        pin,
        salt,
    )

    return hmac.compare_digest(
        calculated_hash,
        expected_hash,
    )


# ============================================================
# USERNAME VALIDATION
# ============================================================

USERNAME_PATTERN = re.compile(
    r"^[A-Za-z0-9_]{3,30}$"
)


def normalize_username(
    username: str
) -> str:

    return (
        username
        .strip()
        .lower()
    )


# ============================================================
# DATABASE
# ============================================================

def connect_db() -> sqlite3.Connection:

    connection = sqlite3.connect(
        DB_PATH
    )

    connection.row_factory = (
        sqlite3.Row
    )

    connection.execute(
        "PRAGMA foreign_keys = ON"
    )

    return connection


def ensure_column(
    connection: sqlite3.Connection,
    table: str,
    column: str,
    definition: str,
) -> None:

    columns = connection.execute(
        f"PRAGMA table_info({table})"
    ).fetchall()

    existing = {
        row["name"]
        for row in columns
    }

    if column not in existing:

        connection.execute(
            f"""
            ALTER TABLE {table}
            ADD COLUMN {column}
            {definition}
            """
        )


def init_db() -> None:

    with connect_db() as connection:

        # ====================================================
        # USERS
        # ====================================================

        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                pin_salt TEXT NOT NULL,
                pin_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'student',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )


        # ====================================================
        # STUDENTS
        # ====================================================

        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS students (
                student_id TEXT PRIMARY KEY,
                user_id TEXT,
                student_number TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                course TEXT NOT NULL,
                year_level TEXT NOT NULL,
                flight_progress TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,

                FOREIGN KEY(user_id)
                    REFERENCES users(user_id)
                    ON DELETE CASCADE
            )
            """
        )


        # Existing database migration

        ensure_column(
            connection,
            "students",
            "user_id",
            "TEXT"
        )


        # ====================================================
        # FLIGHT RECORDS
        # ====================================================

        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS flight_records (
                flight_record_id TEXT PRIMARY KEY,
                student_id TEXT NOT NULL,
                progress TEXT NOT NULL,
                remarks TEXT,
                recorded_at TEXT NOT NULL,

                FOREIGN KEY(student_id)
                    REFERENCES students(student_id)
                    ON DELETE CASCADE
            )
            """
        )


        # ====================================================
        # TRAINING SESSIONS
        # ====================================================

        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS training_sessions (
                id TEXT PRIMARY KEY,
                student_id TEXT,
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


        ensure_column(
            connection,
            "training_sessions",
            "student_id",
            "TEXT"
        )


        # ====================================================
        # INDEXES
        # ====================================================

        connection.execute(
            """
            CREATE UNIQUE INDEX IF NOT EXISTS
            idx_users_username
            ON users(username)
            """
        )


        connection.execute(
            """
            CREATE UNIQUE INDEX IF NOT EXISTS
            idx_students_user
            ON students(user_id)
            WHERE user_id IS NOT NULL
            """
        )


        connection.execute(
            """
            CREATE INDEX IF NOT EXISTS
            idx_students_name
            ON students(name)
            """
        )


        connection.execute(
            """
            CREATE INDEX IF NOT EXISTS
            idx_flight_records_student
            ON flight_records(student_id)
            """
        )


        connection.execute(
            """
            CREATE INDEX IF NOT EXISTS
            idx_training_student
            ON training_sessions(student_id)
            """
        )


        connection.execute(
            """
            CREATE INDEX IF NOT EXISTS
            idx_training_updated
            ON training_sessions(updated_at DESC)
            """
        )


# ============================================================
# MODELS
# ============================================================

class StudentCreate(BaseModel):

    name: str

    course: str

    yearLevel: str

    flightProgress: str

    username: str

    pin: str


class LoginRequest(BaseModel):

    identifier: str

    pin: str


class FlightProgressCreate(BaseModel):

    progress: str

    remarks: Optional[str] = None


class TrainingSessionPayload(BaseModel):

    id: str

    startedAt: str

    updatedAt: str

    endedAt: Optional[str] = None

    status: str = "in_progress"

    metadata: Dict[
        str,
        Any
    ] = Field(
        default_factory=dict
    )

    checklistEvents: List[
        Dict[str, Any]
    ] = Field(
        default_factory=list
    )

    commsAttempts: List[
        Dict[str, Any]
    ] = Field(
        default_factory=list
    )

    summary: Dict[
        str,
        Any
    ] = Field(
        default_factory=dict
    )


# ============================================================
# STUDENT SERIALIZER
# ============================================================

def student_from_row(
    row: sqlite3.Row
) -> Dict[str, Any]:

    return {

        "studentId":
            row["student_id"],

        "userId":
            row["user_id"],

        "studentNumber":
            row["student_number"],

        "name":
            row["name"],

        "course":
            row["course"],

        "yearLevel":
            row["year_level"],

        "flightProgress":
            row["flight_progress"],

        "createdAt":
            row["created_at"],

        "updatedAt":
            row["updated_at"],
    }


# ============================================================
# GENERATE WCC STUDENT NUMBER
# ============================================================

def generate_student_number(
    connection: sqlite3.Connection
) -> str:

    rows = connection.execute(
        """
        SELECT student_number
        FROM students
        WHERE student_number LIKE 'WCC-%'
        """
    ).fetchall()


    highest = 0


    for row in rows:

        value = (
            row["student_number"]
            or ""
        )

        try:

            number = int(
                value.replace(
                    "WCC-",
                    ""
                )
            )

            highest = max(
                highest,
                number
            )

        except ValueError:

            continue


    return (
        f"WCC-{highest + 1:04d}"
    )


# ============================================================
# STARTUP
# ============================================================

@app.on_event(
    "startup"
)
def startup_event():

    init_db()


# ============================================================
# HEALTH
# ============================================================

@app.get(
    "/api/health"
)
def health():

    with connect_db() as connection:

        user_count = connection.execute(
            """
            SELECT COUNT(*) AS count
            FROM users
            """
        ).fetchone()["count"]


        student_count = connection.execute(
            """
            SELECT COUNT(*) AS count
            FROM students
            """
        ).fetchone()["count"]


        session_count = connection.execute(
            """
            SELECT COUNT(*) AS count
            FROM training_sessions
            """
        ).fetchone()["count"]


    return {

        "ok": True,

        "database":
            str(DB_PATH),

        "users":
            user_count,

        "students":
            student_count,

        "trainingSessions":
            session_count,
    }


# ============================================================
# REGISTER STUDENT
# ============================================================

@app.post(
    "/api/students"
)
def register_student(
    payload: StudentCreate
):

    name = (
        payload.name
        .strip()
    )

    course = (
        payload.course
        .strip()
    )

    year_level = (
        payload.yearLevel
        .strip()
    )

    flight_progress = (
        payload.flightProgress
        .strip()
    )

    username = normalize_username(
        payload.username
    )

    pin = (
        payload.pin
        .strip()
    )


    # ========================================================
    # VALIDATE PROFILE
    # ========================================================

    if not name:

        raise HTTPException(
            status_code=400,
            detail="Student name is required."
        )


    if not course:

        raise HTTPException(
            status_code=400,
            detail="Course is required."
        )


    if not year_level:

        raise HTTPException(
            status_code=400,
            detail="Year level is required."
        )


    if not flight_progress:

        raise HTTPException(
            status_code=400,
            detail="Flight progress is required."
        )


    # ========================================================
    # VALIDATE USERNAME
    # ========================================================

    if not USERNAME_PATTERN.fullmatch(
        username
    ):

        raise HTTPException(
            status_code=400,

            detail=(
                "Username must contain 3 to 30 "
                "letters, numbers, or underscores only."
            )
        )


    # ========================================================
    # VALIDATE PIN
    # ========================================================

    if (
        len(pin) != 6
        or
        not pin.isdigit()
    ):

        raise HTTPException(
            status_code=400,

            detail=(
                "PIN must contain exactly 6 digits."
            )
        )


    user_id = new_id(
        "user"
    )

    student_id = new_id(
        "student"
    )

    flight_record_id = new_id(
        "flight"
    )

    timestamp = now_iso()


    pin_salt, pin_hash = hash_pin(
        pin
    )


    with connect_db() as connection:

        # ====================================================
        # CHECK USERNAME DUPLICATE
        # ====================================================

        existing_user = connection.execute(
            """
            SELECT user_id
            FROM users
            WHERE username = ?
            """,
            (
                username,
            ),
        ).fetchone()


        if existing_user:

            raise HTTPException(
                status_code=409,

                detail=(
                    "That username is already in use."
                )
            )


        # ====================================================
        # GENERATE STUDENT NUMBER
        # ====================================================

        student_number = (
            generate_student_number(
                connection
            )
        )


        # ====================================================
        # CREATE USER
        # ====================================================

        connection.execute(
            """
            INSERT INTO users (
                user_id,
                username,
                pin_salt,
                pin_hash,
                role,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                username,
                pin_salt,
                pin_hash,
                "student",
                timestamp,
                timestamp,
            ),
        )


        # ====================================================
        # CREATE STUDENT
        # ====================================================

        connection.execute(
            """
            INSERT INTO students (
                student_id,
                user_id,
                student_number,
                name,
                course,
                year_level,
                flight_progress,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                student_id,
                user_id,
                student_number,
                name,
                course,
                year_level,
                flight_progress,
                timestamp,
                timestamp,
            ),
        )


        # ====================================================
        # INITIAL FLIGHT RECORD
        # ====================================================

        connection.execute(
            """
            INSERT INTO flight_records (
                flight_record_id,
                student_id,
                progress,
                remarks,
                recorded_at
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                flight_record_id,
                student_id,
                flight_progress,
                (
                    "Initial registration "
                    "flight progress."
                ),
                timestamp,
            ),
        )


        row = connection.execute(
            """
            SELECT *
            FROM students
            WHERE student_id = ?
            """,
            (
                student_id,
            ),
        ).fetchone()


    return {

        "ok":
            True,

        "message":
            "Student registration successful.",

        "username":
            username,

        "student":
            student_from_row(
                row
            ),
    }


# ============================================================
# LOGIN
# ============================================================

@app.post(
    "/api/auth/login"
)
def login(
    payload: LoginRequest
):

    identifier = (
        payload.identifier
        .strip()
    )

    pin = (
        payload.pin
        .strip()
    )


    if not identifier:

        raise HTTPException(
            status_code=400,
            detail="Username or Student ID is required."
        )


    if not pin:

        raise HTTPException(
            status_code=400,
            detail="PIN is required."
        )


    with connect_db() as connection:

        # ====================================================
        # LOGIN WITH USERNAME OR WCC STUDENT NUMBER
        # ====================================================

        row = connection.execute(
            """
            SELECT
                u.user_id,
                u.username,
                u.pin_salt,
                u.pin_hash,
                u.role,

                s.student_id,
                s.student_number,
                s.name,
                s.course,
                s.year_level,
                s.flight_progress,
                s.created_at,
                s.updated_at

            FROM users u

            JOIN students s
                ON s.user_id = u.user_id

            WHERE
                u.username = ?
                OR
                UPPER(s.student_number) = UPPER(?)

            LIMIT 1
            """,
            (
                normalize_username(
                    identifier
                ),
                identifier,
            ),
        ).fetchone()


    # Do not reveal whether username or PIN was wrong.

    if row is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid username, Student ID, or PIN."
        )


    if not verify_pin(
        pin,
        row["pin_salt"],
        row["pin_hash"],
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid username, Student ID, or PIN."
        )


    student = {

        "studentId":
            row["student_id"],

        "userId":
            row["user_id"],

        "studentNumber":
            row["student_number"],

        "name":
            row["name"],

        "course":
            row["course"],

        "yearLevel":
            row["year_level"],

        "flightProgress":
            row["flight_progress"],

        "createdAt":
            row["created_at"],

        "updatedAt":
            row["updated_at"],
    }


    return {

        "ok":
            True,

        "user": {

            "userId":
                row["user_id"],

            "username":
                row["username"],

            "role":
                row["role"],
        },

        "student":
            student,
    }


# ============================================================
# GET STUDENTS
# ============================================================

@app.get(
    "/api/students"
)
def list_students():

    with connect_db() as connection:

        rows = connection.execute(
            """
            SELECT *
            FROM students
            ORDER BY name ASC
            """
        ).fetchall()


    return [
        student_from_row(
            row
        )
        for row in rows
    ]


# ============================================================
# GET ONE STUDENT
# ============================================================

@app.get(
    "/api/students/{student_id}"
)
def get_student(
    student_id: str
):

    with connect_db() as connection:

        row = connection.execute(
            """
            SELECT *
            FROM students
            WHERE student_id = ?
            """,
            (
                student_id,
            ),
        ).fetchone()


    if row is None:

        raise HTTPException(
            status_code=404,
            detail="Student not found."
        )


    return student_from_row(
        row
    )


# ============================================================
# GET FLIGHT RECORDS
# ============================================================

@app.get(
    "/api/students/{student_id}/flight-records"
)
def get_student_flight_records(
    student_id: str
):

    with connect_db() as connection:

        student = connection.execute(
            """
            SELECT student_id
            FROM students
            WHERE student_id = ?
            """,
            (
                student_id,
            ),
        ).fetchone()


        if student is None:

            raise HTTPException(
                status_code=404,
                detail="Student not found."
            )


        rows = connection.execute(
            """
            SELECT *
            FROM flight_records
            WHERE student_id = ?
            ORDER BY recorded_at DESC
            """,
            (
                student_id,
            ),
        ).fetchall()


    return [

        {

            "flightRecordId":
                row["flight_record_id"],

            "studentId":
                row["student_id"],

            "progress":
                row["progress"],

            "remarks":
                row["remarks"],

            "recordedAt":
                row["recorded_at"],
        }

        for row in rows
    ]


# ============================================================
# ADD FLIGHT PROGRESS
# ============================================================

@app.post(
    "/api/students/{student_id}/flight-records"
)
def add_flight_progress(
    student_id: str,
    payload: FlightProgressCreate,
):

    progress = (
        payload.progress
        .strip()
    )


    if not progress:

        raise HTTPException(
            status_code=400,
            detail="Flight progress is required."
        )


    timestamp = now_iso()

    flight_record_id = new_id(
        "flight"
    )


    with connect_db() as connection:

        student = connection.execute(
            """
            SELECT student_id
            FROM students
            WHERE student_id = ?
            """,
            (
                student_id,
            ),
        ).fetchone()


        if student is None:

            raise HTTPException(
                status_code=404,
                detail="Student not found."
            )


        connection.execute(
            """
            INSERT INTO flight_records (
                flight_record_id,
                student_id,
                progress,
                remarks,
                recorded_at
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                flight_record_id,
                student_id,
                progress,
                payload.remarks,
                timestamp,
            ),
        )


        connection.execute(
            """
            UPDATE students

            SET
                flight_progress = ?,
                updated_at = ?

            WHERE student_id = ?
            """,
            (
                progress,
                timestamp,
                student_id,
            ),
        )


    return {

        "ok":
            True,

        "flightRecordId":
            flight_record_id,

        "studentId":
            student_id,

        "progress":
            progress,

        "recordedAt":
            timestamp,
    }


# ============================================================
# SAVE TRAINING SESSION
# ============================================================

@app.post(
    "/api/training/sessions"
)
def save_training_session(
    payload: TrainingSessionPayload,
):

    data = payload.model_dump()

    summary = (
        data.get(
            "summary"
        )
        or {}
    )

    metadata = (
        data.get(
            "metadata"
        )
        or {}
    )


    student_id = metadata.get(
        "studentId"
    )


    overall = float(
        summary.get(
            "overall"
        )
        or 0
    )


    safety_status = str(
        summary.get(
            "safetyStatus"
        )
        or "CLEAR"
    )


    with connect_db() as connection:

        # ====================================================
        # VERIFY STUDENT
        # ====================================================

        if student_id:

            student = connection.execute(
                """
                SELECT student_id
                FROM students
                WHERE student_id = ?
                """,
                (
                    student_id,
                ),
            ).fetchone()


            if student is None:

                raise HTTPException(
                    status_code=400,

                    detail=(
                        "Training session contains "
                        "an invalid student ID."
                    )
                )


        serialized = json.dumps(
            data,
            ensure_ascii=False,
            separators=(
                ",",
                ":",
            ),
        )


        connection.execute(
            """
            INSERT INTO training_sessions (
                id,
                student_id,
                started_at,
                updated_at,
                ended_at,
                status,
                overall_score,
                safety_status,
                payload_json
            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)

            ON CONFLICT(id)
            DO UPDATE SET

                student_id =
                    excluded.student_id,

                started_at =
                    excluded.started_at,

                updated_at =
                    excluded.updated_at,

                ended_at =
                    excluded.ended_at,

                status =
                    excluded.status,

                overall_score =
                    excluded.overall_score,

                safety_status =
                    excluded.safety_status,

                payload_json =
                    excluded.payload_json
            """,
            (
                data["id"],
                student_id,
                data["startedAt"],
                data["updatedAt"],
                data.get(
                    "endedAt"
                ),
                data.get(
                    "status",
                    "in_progress"
                ),
                overall,
                safety_status,
                serialized,
            ),
        )


    return {

        "ok":
            True,

        "id":
            data["id"],

        "studentId":
            student_id,

        "overall":
            overall,

        "safetyStatus":
            safety_status,
    }


# ============================================================
# LIST TRAINING SESSIONS
# ============================================================

@app.get(
    "/api/training/sessions"
)
def list_training_sessions(
    limit: int = 50,
    student_id: Optional[str] = None,
):

    safe_limit = max(
        1,
        min(
            limit,
            200
        )
    )


    with connect_db() as connection:

        if student_id:

            rows = connection.execute(
                """
                SELECT payload_json
                FROM training_sessions
                WHERE student_id = ?
                ORDER BY updated_at DESC
                LIMIT ?
                """,
                (
                    student_id,
                    safe_limit,
                ),
            ).fetchall()

        else:

            rows = connection.execute(
                """
                SELECT payload_json
                FROM training_sessions
                ORDER BY updated_at DESC
                LIMIT ?
                """,
                (
                    safe_limit,
                ),
            ).fetchall()


    return [

        json.loads(
            row["payload_json"]
        )

        for row in rows
    ]


# ============================================================
# GET TRAINING SESSION
# ============================================================

@app.get(
    "/api/training/sessions/{session_id}"
)
def get_training_session(
    session_id: str
):

    with connect_db() as connection:

        row = connection.execute(
            """
            SELECT payload_json
            FROM training_sessions
            WHERE id = ?
            """,
            (
                session_id,
            ),
        ).fetchone()


    if row is None:

        raise HTTPException(
            status_code=404,
            detail="Training session not found."
        )


    return json.loads(
        row["payload_json"]
    )


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    import uvicorn


    uvicorn.run(
        app,

        host=os.getenv(
            "TRAINING_API_HOST",
            "127.0.0.1"
        ),

        port=int(
            os.getenv(
                "TRAINING_API_PORT",
                "8000"
            )
        ),
    )