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
 * @type {Readonly<import("./envKeys.js").EnvKeys>}
 * @see backend/src/config/envKeys.js
 */
export const environmentKeys = envKeys;

/**
 * Runtime environments accepted by app-level configuration.
 *
 * @type {Set<import("./types.js").RuntimeEnvironment>}
 */
export const validEnvironments = new Set(["development", "test", "production"]);

/**
 * SQLite journal modes accepted by persistence configuration.
 *
 * @type {Set<import("./types.js").SqliteJournalMode>}
 */
export const validSqliteJournalModes = new Set([
  "delete",
  "truncate",
  "persist",
  "memory",
  "wal",
  "off",
]);

/**
 * Reads a required environment variable.
 *
 * @param {string} name Environment variable name.
 * @returns {string} Environment variable value.
 * @throws {MissingEnvironmentVariableError} When the variable is missing or empty.
 */
function readRequiredString(name) {
  const rawValue = process.env[name];

  if (rawValue === undefined || rawValue === "") {
    throw new MissingEnvironmentVariableError(name, {
      moduleName: moduleName,
    });
  }

  return rawValue;
}

/**
 * Reads a required enum-like environment variable.
 *
 * @template {string} T
 * @param {string} name Environment variable name.
 * @param {ReadonlySet<T>} allowedValues Allowed values.
 * @returns {T} Validated environment variable value.
 * @throws {MissingEnvironmentVariableError} When the variable is missing or empty.
 * @throws {InvalidEnvironmentVariableError} When the value is not allowed.
 */
function readRequiredEnum(name, allowedValues) {
  const rawValue = readRequiredString(name);

  if (!allowedValues.has(/** @type {T} */ (rawValue))) {
    throw new InvalidEnvironmentVariableError(name, rawValue, allowedValues, {
      moduleName: moduleName,
    });
  }

  return /** @type {T} */ (rawValue);
}

/**
 * Reads an optional enum-like environment variable.
 *
 * @template {string} T
 * @param {string} name Environment variable name.
 * @param {ReadonlySet<T>} allowedValues Allowed values.
 * @returns {T | null} Validated environment variable value, or null when unset.
 * @throws {InvalidEnvironmentVariableError} When the value is not allowed.
 */
function readOptionalEnum(name, allowedValues) {
  const rawValue = readOptionalString(name);

  if (rawValue === null) {
    return null;
  }

  if (!allowedValues.has(/** @type {T} */ (rawValue))) {
    throw new InvalidEnvironmentVariableError(name, rawValue, allowedValues, {
      moduleName: moduleName,
    });
  }

  return /** @type {T} */ (rawValue);
}

/**
 * Reads an optional boolean-like environment variable.
 *
 * @param {string} name Environment variable name.
 * @returns {boolean | null} Parsed boolean, or null when unset.
 * @throws {InvalidEnvironmentVariableError} When the value is not boolean-like.
 */
function readOptionalBoolean(name) {
  const rawValue = process.env[name]?.trim().toLowerCase();

  if (rawValue === undefined || rawValue === "") {
    return null;
  }

  if (rawValue === "true" || rawValue === "1") {
    return true;
  }

  if (rawValue === "false" || rawValue === "0") {
    return false;
  }

  throw new InvalidEnvironmentVariableError(name, rawValue, ["true", "false", "1", "0"], {
    moduleName: moduleName,
  });
}

/**
 * Reads an optional environment variable string.
 *
 * @param {string} name Environment variable name.
 * @returns {string | null} Environment variable value, or null when unset.
 */
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
 * @returns {Readonly<import("./types.js").DevNotesConfig>} Dev-notes configuration
 * @see Module README, section "DevNotesConfig"
 */

function getDevNotesConfig() {
  return {
    enabled: readOptionalBoolean(envKeys.devNotes.enabled) ?? false,

    storage: Object.freeze({
      temp: Object.freeze({
        enabled: readOptionalBoolean(envKeys.devNotes.storage.temp.enabled) ?? true,
        databasePath: readOptionalString(envKeys.devNotes.storage.temp.databasePath) ?? ":memory:",
        journalMode:
          readOptionalEnum(envKeys.devNotes.storage.temp.journalMode, validSqliteJournalModes) ??
          "memory",
      }),

      persistent: Object.freeze({
        enabled: readOptionalBoolean(envKeys.devNotes.storage.persistent.enabled) ?? true,
        databasePath: readOptionalString(envKeys.devNotes.storage.persistent.databasePath),
        journalMode:
          readOptionalEnum(
            envKeys.devNotes.storage.persistent.journalMode,
            validSqliteJournalModes,
          ) ?? readOptionalEnum(envKeys.app.persistence.sqliteJournalMode, validSqliteJournalModes),
      }),
    }),
  };
}

/**
 * Application configuration resolved from environment variables.
 *
 * @type {Readonly<import("./types.js").AppConfig>}
 * @see Module README, section "appConfig"
 */
export const appConfig = Object.freeze({
  environment: readRequiredEnum(envKeys.nodeEnv, validEnvironments),

  app: Object.freeze({
    persistence: Object.freeze({
      path: readOptionalString(envKeys.app.persistence.databasePath),
      sqlite: Object.freeze({
        requestedJournalMode: readOptionalEnum(
          envKeys.app.persistence.sqliteJournalMode,
          validSqliteJournalModes,
        ),
      }),
    }),
  }),

  devNotes: Object.freeze(getDevNotesConfig()),
});
