/** @typedef {"development" | "test" | "production"} RuntimeEnvironment */

/** @typedef {"delete" | "truncate" | "persist" | "memory" | "wal" | "off"} SqliteJournalMode */

/**
 * @typedef {object} AppConfig
 * @property {RuntimeEnvironment} environment App runtime environment
 * @property {Readonly<{ path: string | null }>} database Database configuration
 * @property {Readonly<{ requestedJournalMode: SqliteJournalMode | null }>} sqlite SQLite
 * @property {Readonly<DevNotesConfig>} devNotes Settings configuration.
 */

/**
 * @typedef {object} DevNotesStorageConfig
 * @property {boolean | true} enabled Whether this dev-notes storage target is enabled
 * @property {string | null} databasePath SQLite database path for this storage target
 */

/**
 * @typedef {object} DevNotesConfig
 * @property {Readonly<boolean | false>} enabled Whether dev-notes routes may be mounted
 * @property {Readonly<{
 *   temp: Readonly<DevNotesStorageConfig>;
 *   persistent: Readonly<DevNoteStorage>;
 * }>} storage
 *   Dev-notes storage target configuration
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

function readOptionalBoolean(name) {
  const rawValue = process.env[name];

  if (rawValue === undefined || rawValue === "") {
    return null;
  }

  if (rawValue === true || rawValue === "true" || rawValue === 1) {
    return true;
  }

  if (rawValue === false || rawValue === "false" || rawValue === 0) {
    return false;
  }

  throw new Error(`${name} must be one of: true, false, 1, 0`);
}

function readOptionalString(name) {
  const rawValue = process.env[name];

  if (rawValue === undefined || rawValue === "") {
    return null;
  }

  return rawValue;
}

/**
 * Resolves dev-notes configuration from environment variables.
 *
 * Defaults are applied here because dev-notes route mounting and storage availability are runtime
 * configuration decisions.
 *
 * @returns {Readonly<DevNotesConfig>} Dev-notes configuration
 * @see Module README, section "DevNotesConfig"
 */

function getDevNotesConfig() {
  return {
    enabled: readOptionalBoolean("ENABLE_DEV_NOTES") ?? false,

    storage: Object.freeze({
      temp: Object.freeze({
        enabled: readOptionalBoolean("ENABLE_DEV_NOTES_TEMP") ?? true,
        databasePath: ":memory:",
      }),

      persistent: Object.freeze({
        enabled: readOptionalBoolean("ENABLE_DEV_NOTES_PERSISTENT") ?? true,
        databasePath: readOptionalString("DEV_NOTES_DB_PATH"),
      }),
    }),
  };
}

/**
 * Application configuration resolved from environment variables.
 *
 * @type {Readonly<AppConfig>}
 * @see Module README, section "appConfig"
 */
export const appConfig = Object.freeze({
  environment: readRequiredEnum("NODE_ENV", validEnvironments),

  database: Object.freeze({
    path: readOptionalString("DB_PATH"),
  }),

  sqlite: Object.freeze({
    requestedJournalMode: readOptionalString("SQLITE_JOURNAL_MODE"),
  }),

  devNotes: Object.freeze(getDevNotesConfig()),
});
