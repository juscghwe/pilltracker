/**
 * @typedef {"development" | "test" | "production"} RuntimeEnvironment
 */

/**
 * @typedef {"delete" | "truncate" | "persist" | "memory" | "wal" | "off"} SqliteJournalMode
 */

/**
 * @typedef {object} AppConfig
 * @property {RuntimeEnvironment} environment App runtime environment.
 * @property {Readonly<{ path: string | null }>} database Database configuration.
 * @property {Readonly<{ requestedJournalMode: SqliteJournalMode | null }>} sqlite SQLite configuration.
 */

/**
 * Runtime environments accepted by app-level configuration.
 *
 * @type {Set<RuntimeEnvironment>}
 */
export const validEnvironments = new Set(["development", "test", "production"]);

/**
 * SQLite journal modes accepted by persistence configuration.
 *
 * @type {Set<SqliteJournalMode>}
 */
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

function readOptionalString(name) {
  const rawValue = process.env[name];

  if (rawValue === undefined || rawValue === "") {
    return null;
  }

  return rawValue;
}

/**
 * Application configuration resolved from environment variables.
 *
 * @type {Readonly<AppConfig>}
 * @see ./README.md#appconfig
 */
export const appConfig = Object.freeze({
  environment: readRequiredEnum("NODE_ENV", validEnvironments),

  database: Object.freeze({
    path: readOptionalString("DB_PATH"),
  }),

  sqlite: Object.freeze({
    requestedJournalMode: readOptionalString("SQLITE_JOURNAL_MODE"),
  }),
});
