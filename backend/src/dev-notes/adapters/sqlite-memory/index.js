/**
 * @typedef {object} DevNotesSqliteMemoryPersistenceConfig
 * @property {string} databasePath SQLite in-memory database path.
 * @property {string} requestedJournalMode Requested SQLite journal mode.
 */

/**
 * @typedef {object} DevNotesSqliteMemoryAdapter
 * @property {() => import("better-sqlite3").Database} getConnection Returns the active dev-notes
 *   SQLite in-memory connection.
 * @property {() => Readonly<object>} getHealth Returns SQLite health for the dev-notes in-memory
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

const adapterId = "better-sqlite3-memory";
const moduleName = "dev-notes sqlite-memory adapter";
const sourceModule = import.meta.url;
const configuredStorage = appConfig.devNotes.storage.temp;

const expectedDatabasePath = ":memory:";
const minDevNoteEntries = 10;

const schemaSql = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");

/**
 * Resolves and validates configuration required by the dev-notes SQLite in-memory adapter.
 *
 * This adapter owns validation for the temp dev-notes storage target because the values are optional
 * at app-config level but required when this concrete adapter is used. The temp adapter must use the
 * SQLite `:memory:` database path so its data remains process-lifetime only.
 *
 * @returns {DevNotesSqliteMemoryPersistenceConfig} Validated in-memory persistence configuration.
 * @throws {MissingEnvironmentVariableError} When `DEV_NOTES_IN_MEMORY_PATH` or
 *   `DEV_NOTES_IN_MEMORY_JOURNAL_MODE` is missing.
 * @throws {InvalidEnvironmentVariableError} When `DEV_NOTES_IN_MEMORY_PATH` is not `:memory:` or
 *   `DEV_NOTES_IN_MEMORY_JOURNAL_MODE` is not supported.
 * @see Module README, section "sqlite-memory adapter".
 */
function getPersistenceConfig() {
  const databasePath = configuredStorage.databasePath;
  const requestedJournalMode = configuredStorage.journalMode;

  if (!databasePath) {
    throw new MissingEnvironmentVariableError("DEV_NOTES_IN_MEMORY_PATH", {
      moduleName,
    });
  }

  if (databasePath !== expectedDatabasePath) {
    throw new InvalidEnvironmentVariableError(
      "DEV_NOTES_IN_MEMORY_PATH",
      databasePath,
      [expectedDatabasePath],
      { moduleName },
    );
  }

  if (!requestedJournalMode) {
    throw new MissingEnvironmentVariableError("DEV_NOTES_IN_MEMORY_JOURNAL_MODE", {
      moduleName,
    });
  }

  if (!validSqliteJournalModes.has(requestedJournalMode)) {
    throw new InvalidEnvironmentVariableError(
      "DEV_NOTES_IN_MEMORY_JOURNAL_MODE",
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
 * @param {DevNotesSqliteMemoryPersistenceConfig} persistenceConfig Validated adapter configuration.
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
 * Opens and validates the cached dev-notes SQLite in-memory connection.
 *
 * The connection is opened lazily and cached by this concrete adapter. For SQLite `:memory:`, the
 * cached connection is the lifetime of the database, not only a performance optimization.
 *
 * @param {DevNotesSqliteMemoryPersistenceConfig} persistenceConfig Validated adapter configuration.
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

    db.exec(schemaSql);

    seedDevNotes(db, {
      count: minDevNoteEntries,
      mode: "when-empty",
    });
  }

  assertJournalMode(db, persistenceConfig);

  return db;
}

/**
 * Returns the active dev-notes SQLite in-memory connection.
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
 * Health reporter for the dev-notes SQLite in-memory adapter.
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
  sourceModule,
  databasePath: configuredStorage.databasePath,
  requestedJournalMode: configuredStorage.journalMode,
  validJournalModes: validSqliteJournalModes,
  getConnection,
});

/**
 * SQLite in-memory implementation of the temp dev-notes storage adapter.
 *
 * This adapter stores disposable dev-notes data in an in-memory SQLite database. Data is tied to
 * the backend process and is lost when the process exits. It must not be used for medication-domain
 * persistence and should be accessed through the dev-notes storage facade instead of imported
 * directly by routes.
 *
 * @type {Readonly<DevNotesSqliteMemoryAdapter>}
 * @see Module README, section "sqlite-memory adapter".
 * @see Dev-notes README, section "storage facade".
 */
export const devNotesSqliteMemoryAdapter = {
  getConnection,
  getHealth,
};
