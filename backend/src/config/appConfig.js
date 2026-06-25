export const validEnvironments = new Set(["development", "test", "production"]);
export const validSqliteJournalModes = new Set([
  "delete",
  "truncate",
  "persist",
  "memory",
  "wal",
  "off",
]);

function readRequiredString(name) {
  const rawValue = process.env[name];

  if (rawValue === undefined || rawValue === "") {
    throw new Error(`${name} environment variable is not configured`);
  }

  return rawValue;
}

function readRequiredEnum(name, allowedValues) {
  const rawValue = readRequiredString(name);

  if (!allowedValues.has(rawValue)) {
    throw new Error(
      `Invalid ${name}: ${rawValue}. Expected one of: ${[...allowedValues].join(", ")}`,
    );
  }

  return rawValue;
}

/*
function readOptionalEnum(name, allowedValues, defaultValue) {
  const rawValue = process.env[name] ?? defaultValue;

  if (!allowedValues.has(rawValue)) {
    throw new Error(
      `Invalid ${name}: ${rawValue}. Expected one of: ${[...allowedValues].join(", ")}`,
    );
  }

  return rawValue;
}
  */

function readOptionalString(name) {
  const rawValue = process.env[name];

  if (rawValue === undefined || rawValue === "") {
    return null;
  }

  return rawValue;
}

export const appConfig = Object.freeze({
  environment: readRequiredEnum("NODE_ENV", validEnvironments),

  database: Object.freeze({
    path: readOptionalString("DB_PATH"),
  }),

  sqlite: Object.freeze({
    requestedJournalMode: readOptionalString("SQLITE_JOURNAL_MODE"),
  }),
});
