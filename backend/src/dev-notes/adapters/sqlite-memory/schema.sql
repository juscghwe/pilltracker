CREATE TABLE IF NOT EXISTS dev_notes_temp (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_temp TEXT NOT NULL,
  comment_temp TEXT,
  last_confirmed_interaction TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
