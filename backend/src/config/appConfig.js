/** @typedef {"development" | "test" | "production"} RuntimeEnvironment */

/** @typedef {"delete" | "truncate" | "persist" | "memory" | "wal" | "off"} SqliteJournalMode */

/**
 * @typedef {object} AppConfig
 * @property {RuntimeEnvironment} environment App runtime environment
 * @property {Readonly<{ path: string | null }>} database Database configuration
 * @property {Readonly<{ requestedJournalMode: SqliteJournalMode | null }>} sqlite SQLite
 * @property {Readonly<DevNote>} devNotes Settings configuration.
 */

/**
 * @typedef {object} DevNoteConfig
 * @property {Readonly<{ enabled: boolean | false }>} enabled Dev-Notes are enbabled in
 *   configuration
 * @property {Readonly<{ temp: DevNoteStorage; persistent: DevNoteStorage }>} storage Description of
 *   individual storage objects
 */

/**
 * @typedef {object} DevNoteStorage
 * @property {Readonly<{ enabled: boolean | true }>} enabled
 * @property {Readonly<{ databasePath: string | null }>} databasePath
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

  return false;
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

/**
 * Pure Dev-Notes Application configuration resolved from environmental variables.
 *
 * Default values get set here bcs its a runtime level decision.
 *
 * @type {ReadOnly<DevNoteConfig>}
 * @see Module README, section "DevNotesConfig"
 */

function getDevNotesConfig() {
  return {
    enabled: readOptionalBoolean("ENABLE_DEV_NOTES") | false,

    storage: Object.freeze({
      temp: Object.freeze({
        enabled: readOptionalBoolean("ENABLE_DEV_NOTES_TEMP", true),
        databasePath: ":memory:",
      }),

      persistent: Object.freeze({
        enabled: readOptionalBoolean("ENABLE_DEV_NOTES_PERSISTENT", true),
        databasePath: readOptionalString("DEV_NOTES_DB_PATH"),
      }),
    }),
  };
}
