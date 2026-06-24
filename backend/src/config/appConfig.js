const validEnvironments = new Set(["development", "test", "production"]);
const validSqliteJournalModes = new Set(["delete", "truncate", "persist", "memory", "wal", "off"]);

function readEnum(name, allowedValues, defaultValue) {
  const rawValue = process.env[name] ?? defaultValue;

  if (!allowedValues.has(rawValue)) {
    throw new Error(
      `Invalid ${name}: ${rawValue}. Expected one of: ${[...allowedValues].join(", ")}`,
    );
  }

  return rawValue;
}

function readOptionalString(name) {
  const rawValue = process.env[name];

  if (rawValue === undefined || rawValue === "") {
    return null;
  }

  return rawValue;
}

function readEnvironment() {
  const rawEnvironment = process.env.NODE_ENV ?? "development";

  if (!validEnvironments.has(rawEnvironment)) {
    throw new Error(`Invalid NODE_ENV: ${rawEnvironment}`);
  }

  return rawEnvironment;
}

export const appConfig = Object.freeze({
  environment: readEnvironment(),

  database: Object.freeze({
    path: readOptionalString("DB_PATH"),
  }),

  sqlite: Object.freeze({
    requestedJournalMode: readEnum("SQLITE_JOURNAL_MODE", validSqliteJournalModes, "wal"),
  }),
});
