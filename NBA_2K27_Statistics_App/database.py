import sqlite3
from flask import current_app, g
from werkzeug.security import generate_password_hash

DEFAULT_USER = 'AlphaCyclops'
DEFAULT_PASSWORD = '2kApp!'

SCHEMA = '''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS player_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT NOT NULL,
    game_date TEXT NOT NULL,
    position TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    rebounds INTEGER NOT NULL DEFAULT 0,
    assists INTEGER NOT NULL DEFAULT 0,
    steals INTEGER NOT NULL DEFAULT 0,
    blocks INTEGER NOT NULL DEFAULT 0,
    turnovers INTEGER NOT NULL DEFAULT 0,
    fouls INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    in_game_username TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS user_builds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL,
    build_name TEXT NOT NULL,
    height TEXT NOT NULL,
    position TEXT NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES user_profiles(id)
);

CREATE TABLE IF NOT EXISTS friends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    friend_name TEXT NOT NULL,
    friend_handle TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
'''


def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(
            current_app.config['DATABASE'],
            timeout=30,
            detect_types=sqlite3.PARSE_DECLTYPES,
        )
        g.db.row_factory = sqlite3.Row
        g.db.execute('PRAGMA journal_mode=WAL;')
    return g.db


def close_db(exception=None):
    db = g.pop('db', None)

    if db is not None:
        db.close()


def init_db(app):
    with app.app_context():
        db = get_db()
        db.executescript(SCHEMA)
        db.commit()
        db.execute('PRAGMA journal_mode=WAL;')
        db.commit()

        # Seed a default user if none exists.
        existing = db.execute(
            'SELECT id FROM users WHERE username = ?',
            (DEFAULT_USER,),
        ).fetchone()

        if existing is None:
            db.execute(
                'INSERT INTO users (username, password_hash) VALUES (?, ?)',
                (DEFAULT_USER, generate_password_hash(DEFAULT_PASSWORD)),
            )
            db.commit()


def execute_write(sql, params=None):
    """Run a write (INSERT/UPDATE/DELETE) using a short-lived connection.

    This avoids holding the global `g` connection open during commits and
    reduces the chance of "database is locked" errors by using a dedicated
    connection with a longer timeout and WAL enabled.
    """
    params = params or ()
    conn = sqlite3.connect(
        current_app.config['DATABASE'], timeout=30, detect_types=sqlite3.PARSE_DECLTYPES
    )
    try:
        conn.row_factory = sqlite3.Row
        conn.execute('PRAGMA journal_mode=WAL;')
        cur = conn.execute(sql, params)
        conn.commit()
        return cur
    finally:
        conn.close()
