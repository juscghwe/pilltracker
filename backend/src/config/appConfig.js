const validEnvironments = new Set(["development", "test", "production"]);

function readEnvironment() {
  const rawEnvironment = process.env.NODE_ENV ?? "development";

  if (!validEnvironments.has(rawEnvironment)) {
    throw new Error(`Invalid NODE_ENV: ${rawEnvironment}`);
  }

  return rawEnvironment;
}

export const appConfig = Object.freeze({
  environment: readEnvironment(),
  databasePath: process.env.DB_PATH,
  sqlite: {
    requestedJournalMode: process.env.SQLITE_JOURNAL_MODE ?? "wal",
  },
});
