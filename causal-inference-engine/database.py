import os
import json
import uuid
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def get_db_connection():
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable is missing. Please add your PostgreSQL connection string to the .env file.")
    return psycopg2.connect(DATABASE_URL)

def init_db():
    if not DATABASE_URL:
        print("Warning: DATABASE_URL not set. Skipping PostgreSQL initialization. Server will crash on API calls until configured.")
        return
        
    conn = get_db_connection()
    c = conn.cursor()
    # Create users table
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            password_hash TEXT,
            created_at TEXT
        )
    ''')
    # Experiments table with user_id and PostgreSQL native JSONB
    c.execute('''
        CREATE TABLE IF NOT EXISTS experiments (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            name TEXT,
            timestamp TEXT,
            ate REAL,
            significant INTEGER,
            full_results JSONB,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    conn.commit()
    conn.close()

def create_user(email: str, password_hash: str) -> str:
    conn = get_db_connection()
    c = conn.cursor()
    user_id = str(uuid.uuid4())
    try:
        # Note the %s placeholder for Postgres (instead of ? for SQLite)
        c.execute("INSERT INTO users (id, email, password_hash, created_at) VALUES (%s, %s, %s, %s)",
                  (user_id, email, password_hash, datetime.utcnow().isoformat() + "Z"))
        conn.commit()
    except psycopg2.IntegrityError:
        conn.rollback()
        conn.close()
        return None  # Email already exists
    conn.close()
    return user_id

def get_user_by_email(email: str):
    conn = get_db_connection()
    c = conn.cursor(cursor_factory=RealDictCursor)
    c.execute("SELECT id, email, password_hash FROM users WHERE email=%s", (email,))
    row = c.fetchone()
    conn.close()
    if row:
        return {"id": row["id"], "email": row["email"], "password_hash": row["password_hash"]}
    return None

def save_experiment(user_id: str, exp_id: str, name: str, ate: float, significant: bool, results: dict):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute(
        "INSERT INTO experiments (id, user_id, name, timestamp, ate, significant, full_results) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (exp_id, user_id, name, datetime.utcnow().isoformat() + "Z", float(ate), int(significant), json.dumps(results))
    )
    conn.commit()
    conn.close()

def get_history(user_id: str):
    conn = get_db_connection()
    c = conn.cursor(cursor_factory=RealDictCursor)
    c.execute("SELECT id, name, timestamp, ate, significant, full_results FROM experiments WHERE user_id=%s ORDER BY timestamp DESC", (user_id,))
    rows = c.fetchall()
    conn.close()
    
    history = []
    for row in rows:
        history.append({
            "id": row["id"],
            "name": row["name"],
            "timestamp": row["timestamp"] if row["timestamp"].endswith("Z") else row["timestamp"] + "Z",
            "ate": row["ate"],
            "sig": bool(row["significant"]),
            "results": row["full_results"]
        })
    return history
