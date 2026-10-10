import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "gemini_chats.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        system_instruction TEXT DEFAULT '',
        temperature REAL DEFAULT 0.7,
        top_p REAL DEFAULT 0.95,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
    )
    """)
    conn.commit()
    conn.close()

def create_session(session_id: str, title: str = "New chat", system_instruction: str = "", temperature: float = 0.7, top_p: float = 0.95):
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    cursor.execute(
        "INSERT INTO sessions (id, title, system_instruction, temperature, top_p, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (session_id, title, system_instruction, temperature, top_p, now, now)
    )
    conn.commit()
    conn.close()
    return {"id": session_id, "title": title, "created_at": now, "updated_at": now}

def list_sessions():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, created_at, updated_at FROM sessions ORDER BY updated_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_session(session_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def update_session_title(session_id: str, title: str):
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    cursor.execute("UPDATE sessions SET title = ?, updated_at = ? WHERE id = ?", (title, now, session_id))
    conn.commit()
    conn.close()

def update_session_settings(session_id: str, system_instruction: str, temperature: float, top_p: float):
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    cursor.execute(
        "UPDATE sessions SET system_instruction = ?, temperature = ?, top_p = ?, updated_at = ? WHERE id = ?",
        (system_instruction, temperature, top_p, now, session_id)
    )
    conn.commit()
    conn.close()

def delete_session(session_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
    cursor.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
    conn.commit()
    conn.close()

def add_message(session_id: str, role: str, content: str, image_url: str = ""):
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    cursor.execute(
        "INSERT INTO messages (session_id, role, content, image_url, created_at) VALUES (?, ?, ?, ?, ?)",
        (session_id, role, content, image_url, now)
    )
    cursor.execute("UPDATE sessions SET updated_at = ? WHERE id = ?", (now, session_id))
    conn.commit()
    conn.close()

def get_messages(session_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, role, content, image_url, created_at FROM messages WHERE session_id = ? ORDER BY id ASC", (session_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]
