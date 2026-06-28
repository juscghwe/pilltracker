/**
 * @typedef {object} SqliteFilePersistenceConfig
 * @property {string} databasePath SQLite database path for persistent storage.
 * @property {string} requestedJournalMode Requested SQLite journal mode.
 */

/**
 * @typedef {object} SqliteFileAdapter
 * @property {() => import("better-sqlite3").Database} getConnection Returns the active SQLite file
 *   connection.
 * @property {() => Readonly<object>} getHealth Returns SQLite health for the file adapter.
 */

import { appConfig, validSqliteJournalModes, environmentKeys } from "../../../config/appConfig.js";
import {
  InvalidEnvironmentVariableError,
  MissingEnvironmentVariableError,
  SqliteJournalModeMismatchError,
} from "../../../errors/index.js";
import {
  getActiveSqliteJournalMode,
  openConfiguredSqliteConnection,
} from "../../../sqlite/connection.js";
import { createSqliteHealthReporter } from "../../../sqlite/health.js";
let db;

const adapterId = "better-sqlite3";
const moduleName = "sqlite-file adapter persistency";
const sourceModule = import.meta.url;
const configuredPersistence = appConfig.app.persistence;
const persistenceEnvKeys = environmentKeys.app.persistence;

/**
 * Resolves and validates configuration required by the SQLite file adapter.
 *
 * This adapter owns validation for the persistent database path because the value is optional at
 * app-config level but required when this concrete adapter is used.
 *
 * @returns {SqliteFilePersistenceConfig} Validated persistence configuration.
 * @throws {MissingEnvironmentVariableError} When `DB_PATH` or `SQLITE_JOURNAL_MODE` is missing.
 * @throws {InvalidEnvironmentVariableError} When `SQLITE_JOURNAL_MODE` is not supported.
 * @see Module README, section "sqlite-file adapter".
 */
function getPersistenceConfig() {
  const databasePath = configuredPersistence.path;
  const requestedJournalMode = configuredPersistence.sqlite.requestedJournalMode;

  if (!databasePath) {
    throw new MissingEnvironmentVariableError(persistenceEnvKeys.databasePath, {
      moduleName,
    });
  }

  if (!requestedJournalMode) {
    throw new MissingEnvironmentVariableError(persistenceEnvKeys.sqliteJournalMode, {
      moduleName,
    });
  }

  if (!validSqliteJournalModes.has(requestedJournalMode)) {
    throw new InvalidEnvironmentVariableError(
      persistenceEnvKeys.sqliteJournalMode,
      requestedJournalMode,
      validSqliteJournalModes,
      { moduleName },
    );
  }

  return {
    databasePath,
    requestedJournalMode,
  };
}

/**
 * Verifies that SQLite applied the requested journal mode.
 *
 * SQLite may report a different active journal mode than the requested one. This guard turns that
 * mismatch into a structured adapter error instead of silently continuing with unexpected database
 * behavior.
 *
 * @param {import("better-sqlite3").Database} connection SQLite connection.
 * @param {SqliteFilePersistenceConfig} persistenceConfig Validated adapter configuration.
 * @returns {void}
 * @throws {SqliteJournalModeMismatchError} When the active SQLite journal mode differs from the
 *   requested mode.
 * @see Module README, section "journal mode validation".
 */
function assertJournalMode(connection, persistenceConfig) {
  const activeJournalMode = getActiveSqliteJournalMode(connection);

  if (activeJournalMode !== persistenceConfig.requestedJournalMode) {
    throw new SqliteJournalModeMismatchError({
      requestedJournalMode: persistenceConfig.requestedJournalMode,
      activeJournalMode,
      moduleName,
    });
  }
}

/**
 * Opens and validates the cached SQLite file connection.
 *
 * The connection is opened lazily and cached by this concrete adapter. Shared SQLite helpers
 * create/configure connections, but this adapter owns the connection lifecycle for its database.
 *
 * @param {SqliteFilePersistenceConfig} persistenceConfig Validated adapter configuration.
 * @returns {import("better-sqlite3").Database} Active SQLite connection.
 * @throws {SqliteJournalModeMismatchError} When the active SQLite journal mode differs from the
 *   requested mode.
 * @throws {Error} When SQLite cannot open or configure the database connection.
 * @see Module README, section "connection lifecycle".
 */
function openConnection(persistenceConfig) {
  if (!db) {
    db = openConfiguredSqliteConnection({
      databasePath: persistenceConfig.databasePath,
      requestedJournalMode: persistenceConfig.requestedJournalMode,
    });
  }

  assertJournalMode(db, persistenceConfig);

  return db;
}

/**
 * Returns the active SQLite file connection.
 *
 * This is the public connection entrypoint for the concrete adapter. It resolves adapter
 * configuration, opens the connection if needed, and verifies the active SQLite journal mode before
 * returning.
 *
 * @returns {import("better-sqlite3").Database} Active SQLite connection.
 * @throws {MissingEnvironmentVariableError} When required adapter configuration is missing.
 * @throws {InvalidEnvironmentVariableError} When configured adapter values are invalid.
 * @throws {SqliteJournalModeMismatchError} When SQLite reports an unexpected active journal mode.
 * @throws {Error} When SQLite cannot open or configure the database connection.
 * @see Module README, section "public entrypoints".
 */
function getConnection() {
  const persistenceConfig = getPersistenceConfig();

  return openConnection(persistenceConfig);
}

/**
 * Health reporter for the SQLite file adapter.
 *
 * The reporter captures adapter metadata once and calls `getConnection` when health is requested,
 * so configuration and connection failures are represented as unhealthy adapter results instead of
 * escaping the health endpoint.
 *
 * @type {() => Readonly<object>}
 * @see Module README, section "health reporting".
 */
const getHealth = createSqliteHealthReporter({
  adapterId,
  sourceModule: sourceModule,
  databasePath: configuredPersistence.path,
  requestedJournalMode: configuredPersistence.sqlite.requestedJournalMode,
  validJournalModes: validSqliteJournalModes,
  getConnection,
});

/**
 * SQLite file implementation of the persistent storage adapter.
 *
 * This adapter stores data in a separate SQLite database file. This is the concrete SQLite adapter.
 * Application consumers should import the active adapter from the persistence seam instead of
 * importing this module directly.
 *
 * @type {Readonly<SqliteFileAdapter>}
 * @see Module README, section "better-sqlite3 adapter".
 * @see Persistence seam README, section "Public entrypoints".
 */
export const sqliteFileAdapter = {
  getConnection,
  getHealth,
};
