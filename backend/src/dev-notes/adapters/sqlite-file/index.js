/**
 * @typedef {object} DevNotesSqliteFilePersistenceConfig
 * @property {string} databasePath SQLite database path for persistent dev-notes storage.
 * @property {string} requestedJournalMode Requested SQLite journal mode.
 */

/**
 * @typedef {object} DevNotesSqliteFileAdapter
 * @property {() => import("better-sqlite3").Database} getConnection Returns the active dev-notes
 *   SQLite file connection.
 * @property {() => Readonly<object>} getHealth Returns SQLite health for the dev-notes file
 *   adapter.
 */

import { readFileSync } from "node:fs";

import { appConfig, validSqliteJournalModes } from "../../../config/appConfig.js";
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
import { seedDevNotes } from "./seed-dev.js";

let db;

const adapterId = "better-sqlite3";
const moduleName = "dev-notes sqlite-file adapter";

const minDevNoteEntries = 10;

const schemaSql = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");

/**
 * Resolves and validates configuration required by the dev-notes SQLite file adapter.
 *
 * This adapter owns validation for the persistent dev-notes database path because the value is
 * optional at app-config level but required when this concrete adapter is used.
 *
 * @returns {DevNotesSqliteFilePersistenceConfig} Validated persistence configuration.
 * @throws {MissingEnvironmentVariableError} When `DEV_NOTES_DB_PATH` or `SQLITE_JOURNAL_MODE` is
 *   missing.
 * @throws {InvalidEnvironmentVariableError} When `SQLITE_JOURNAL_MODE` is not supported.
 * @see Module README, section "sqlite-file adapter".
 */
function getPersistenceConfig() {
  const databasePath = appConfig.devNotes.storage.persistent.databasePath;
  const requestedJournalMode = appConfig.sqlite.requestedJournalMode;

  if (!databasePath) {
    throw new MissingEnvironmentVariableError("DEV_NOTES_DB_PATH", {
      moduleName,
    });
  }

  if (!requestedJournalMode) {
    throw new MissingEnvironmentVariableError("SQLITE_JOURNAL_MODE", {
      moduleName,
    });
  }

  if (!validSqliteJournalModes.has(requestedJournalMode)) {
    throw new InvalidEnvironmentVariableError(
      "SQLITE_JOURNAL_MODE",
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
 * @param {DevNotesSqliteFilePersistenceConfig} persistenceConfig Validated adapter configuration.
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
 * Opens and validates the cached dev-notes SQLite file connection.
 *
 * The connection is opened lazily and cached by this concrete adapter. Shared SQLite helpers
 * create/configure connections, but this adapter owns the connection lifecycle for its database.
 *
 * @param {DevNotesSqliteFilePersistenceConfig} persistenceConfig Validated adapter configuration.
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
 * Ensures correct table schema
 *
 * @param {import("better-sqlite3").Database} Active SQLite connection.
 */
function ensureSchema(connection) {
  connection.exec(schemaSql);
}

/**
 * Returns the active dev-notes SQLite file connection.
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
  const database = openConnection(persistenceConfig);

  ensureSchema(database);
  seedDevNotes(database, minDevNoteEntries); // Optional. Only use if you explicitly want demo rows.

  return database;
}

/**
 * Health reporter for the dev-notes SQLite file adapter.
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
  sourceModule: import.meta.url,
  databasePath: appConfig.devNotes.storage.persistent.databasePath,
  requestedJournalMode: appConfig.sqlite.requestedJournalMode,
  validJournalModes: validSqliteJournalModes,
  getConnection,
});

/**
 * SQLite file implementation of the persistent dev-notes storage adapter.
 *
 * This adapter stores disposable dev-notes data in a separate SQLite database file. It must not be
 * used for medication-domain persistence and should be accessed through the dev-notes storage
 * facade instead of imported directly by routes.
 *
 * @type {Readonly<DevNotesSqliteFileAdapter>}
 * @see Module README, section "sqlite-file adapter".
 * @see Dev-notes README, section "storage facade".
 */
export const devNotesSqliteFileAdapter = {
  getConnection,
  getHealth,
};
