/** @typedef {"development" | "test" | "production"} RuntimeEnvironment */

/** @typedef {"delete" | "truncate" | "persist" | "memory" | "wal" | "off"} SqliteJournalMode */

/**
 * @typedef {object} AppPersistenceSqliteConfig
 * @property {SqliteJournalMode | null} requestedJournalMode Requested SQLite journal mode.
 */

/**
 * @typedef {object} AppPersistenceConfig
 * @property {string | null} path Main application database path.
 * @property {Readonly<AppPersistenceSqliteConfig>} sqlite Main application SQLite configuration.
 */

/**
 * @typedef {object} AppRuntimeConfig
 * @property {Readonly<AppPersistenceConfig>} persistence Main application persistence
 *   configuration.
 */

/**
 * @typedef {object} DevNotesStorageConfig
 * @property {boolean} enabled Whether this dev-notes storage target is enabled.
 * @property {string | null} databasePath SQLite database path for this storage target.
 * @property {SqliteJournalMode | null} journalMode Requested SQLite journal mode for this storage
 *   target.
 */

/**
 * @typedef {object} DevNotesConfig
 * @property {boolean} enabled Whether dev-notes routes may be mounted.
 * @property {Readonly<{
 *   temp: Readonly<DevNotesStorageConfig>;
 *   persistent: Readonly<DevNotesStorageConfig>;
 * }>} storage
 *   Dev-notes storage target configuration.
 */

/**
 * @typedef {object} AppConfig
 * @property {RuntimeEnvironment} environment App runtime environment.
 * @property {Readonly<AppRuntimeConfig>} app Main application configuration.
 * @property {Readonly<DevNotesConfig>} devNotes Dev-notes configuration.
 */

import {
  InvalidEnvironmentVariableError,
  MissingEnvironmentVariableError,
} from "../errors/index.js";

const moduleName = "backend config appConfig";

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
    throw new MissingEnvironmentVariableError(name, {
      moduleName: moduleName,
    });
  }

  return rawValue;
}

function readRequiredEnum(name, allowedValues) {
  const rawValue = readRequiredString(name);

  if (!allowedValues.has(rawValue)) {
    throw new InvalidEnvironmentVariableError(name, rawValue, allowedValues, {
      moduleName: moduleName,
    });
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

  throw new InvalidEnvironmentVariableError(name, rawValue, ["true", "false", "1", "0"], {
    moduleName: moduleName,
  });
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
    enabled: readOptionalBoolean("DEV_NOTES_ENABLE") ?? false,

    storage: Object.freeze({
      temp: Object.freeze({
        enabled: readOptionalBoolean("DEV_NOTES_ENABLE_IN_MEMORY") ?? true,
        databasePath: readOptionalString("DEV_NOTES_IN_MEMORY_PATH") ?? ":memory:",
        journalMode: readOptionalString("DEV_NOTES_IN_MEMORY_JOURNAL_MODE") ?? "memory",
      }),

      persistent: Object.freeze({
        enabled: readOptionalBoolean("DEV_NOTES_ENABLE_PERSISTENT") ?? true,
        databasePath: readOptionalString("DEV_NOTES_DB_PATH"),
        journalMode:
          readOptionalString("DEV_NOTES_PERSISTENT_JOURNAL_MODE") ??
          readOptionalString("APP_SQLITE_JOURNAL_MODE"),
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

  app: Object.freeze({
    persistence: Object.freeze({
      path: readOptionalString("APP_DB_PATH"),
      sqlite: Object.freeze({
        requestedJournalMode: readOptionalString("APP_SQLITE_JOURNAL_MODE"),
      }),
    }),
  }),

  devNotes: Object.freeze(getDevNotesConfig()),
});
