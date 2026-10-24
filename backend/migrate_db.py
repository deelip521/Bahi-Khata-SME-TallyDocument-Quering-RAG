import sqlite3
from pathlib import Path

db_path = Path(__file__).parent / "bahi_khata.db"

with sqlite3.connect(db_path) as connection:
    columns = connection.execute(
        "PRAGMA table_info(documents)"
    ).fetchall()

    column_names = [column[1] for column in columns]

    if not columns:
        print("ERROR: The documents table was not found.")
    elif "extracted_text" in column_names:
        print("SUCCESS: extracted_text already exists.")
    else:
        connection.execute(
            "ALTER TABLE documents "
            "ADD COLUMN extracted_text TEXT NOT NULL DEFAULT ''"
        )
        print("SUCCESS: extracted_text column added.")

    connection.commit()