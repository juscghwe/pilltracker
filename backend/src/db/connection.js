import Database from "better-sqlite3";

const dbPath = process.env.DB_PATH;

if (!dbPath) {
  throw new Error("DB_PATH environment variable is not configured");
}

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

export default db;
