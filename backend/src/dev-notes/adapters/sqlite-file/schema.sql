CREATE TABLE IF NOT EXISTS dev_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  comment TEXT,
  last_confirmed_interaction TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
