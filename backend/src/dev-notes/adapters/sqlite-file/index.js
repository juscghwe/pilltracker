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

let db;

const adapterId = "better-sqlite3";
const moduleName = "dev-notes sqlite-file adapter";

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

function getConnection() {
  const persistenceConfig = getPersistenceConfig();

  return openConnection(persistenceConfig);
}

const getHealth = createSqliteHealthReporter({
  adapterId,
  sourceModule: import.meta.url,
  databasePath: appConfig.devNotes.storage.persistent.databasePath,
  requestedJournalMode: appConfig.sqlite.requestedJournalMode,
  validJournalModes: validSqliteJournalModes,
  getConnection,
});

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
 * @throws {SqliteJournalModeMismatchError} When `SQLITE_JOURNAL_MODE` of existing DB and config
 *   differ.
 * @see Module README, section "sqlite-file adapter".
 */
export const devNotesSqliteFileAdapter = {
  getConnection,
  getHealth,
};
