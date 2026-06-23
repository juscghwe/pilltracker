import Database from "better-sqlite3";

const appDatabasePath = process.env.DB_PATH;

if (!appDatabasePath) {
  throw new Error("DB_PATH environment variable is not configured");
}

const appDatabase = new Database(appDatabasePath);

// Use Write-Ahead Logging for better concurrency and performance
const journalMode = "WAL";

// Remove if DB is intended outside volume, but this is a good default for local development
appDatabase.pragma(`journal_mode = ${journalMode}`, { simple: true });

export const appDatabaseInfo = {
  kind: "persistent",
  engine: "sqlite",
  driver: "better-sqlite3",
  pathConfigured: Boolean(appDatabasePath),
  journalMode: journalMode,
};

export default appDatabase;
