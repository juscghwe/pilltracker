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

import { envKeys } from "./envKeys.js";
import {
  InvalidEnvironmentVariableError,
  MissingEnvironmentVariableError,
} from "../errors/index.js";

const moduleName = "backend config appConfig";

/**
 * Environment variable names used by app configuration and adapter validation.
 *
 * Keep these names centralized so config parsing and adapter error messages cannot drift apart.
 *
 * @type {Readonly<EnvKeys>}
 * @see backend/src/config/envKeys.js
 */
export const environmentKeys = envKeys;

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
    enabled: readOptionalBoolean(envKeys.devNotes.enabled) ?? false,

    storage: Object.freeze({
      temp: Object.freeze({
        enabled: readOptionalBoolean(envKeys.devNotes.storage.temp.enabled) ?? true,
        databasePath: readOptionalString(envKeys.devNotes.storage.temp.databasePath) ?? ":memory:",
        journalMode: readOptionalString(envKeys.devNotes.storage.temp.journalMode) ?? "memory",
      }),

      persistent: Object.freeze({
        enabled: readOptionalBoolean(envKeys.devNotes.storage.persistent.enabled) ?? true,
        databasePath: readOptionalString(envKeys.devNotes.storage.persistent.databasePath),
        journalMode:
          readOptionalString(envKeys.devNotes.storage.persistent.journalMode) ??
          readOptionalString(envKeys.app.persistence.sqliteJournalMode),
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
  environment: readRequiredEnum(envKeys.nodeEnv, validEnvironments),

  app: Object.freeze({
    persistence: Object.freeze({
      path: readOptionalString(envKeys.app.persistence.databasePath),
      sqlite: Object.freeze({
        requestedJournalMode: readOptionalString(envKeys.app.persistence.sqliteJournalMode),
      }),
    }),
  }),

  devNotes: Object.freeze(getDevNotesConfig()),
});
