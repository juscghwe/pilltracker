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
import { seedDevNotes } from "./seed-dev.js";

let db;

const adapterId = "better-sqlite3-memory";
const moduleName = "dev-notes sqlite-memory adapter";
const sourceModule = import.meta.url;
const configuredStorage = appConfig.devNotes.storage.temp;
const tempEnvKeys = environmentKeys.devNotes.storage.temp;

const expectedDatabasePath = ":memory:";
const minDevNoteEntries = 10;
let warnedAboutFileBackendTempStorageAlready = false;

const schemaSql = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");

function warnIfTempStorageIsFileBacked(databasePath) {
  if (databasePath === expectedDatabasePath || warnedAboutFileBackendTempStorageAlready) {
    return;
  }

  console.warn(
    `[${moduleName}] ${tempEnvKeys.databasePath} is set to "${databasePath}". ` +
      `Temp dev-notes storage will be file-backed and may survive backend restarts. ` +
      `Use ":memory:" for process-lifetime-only storage.`,
  );

  warnedAboutFileBackendTempStorageAlready = true;
}

/**
 * Resolves and validates configuration required by the dev-notes SQLite temp adapter.
 *
 * The temp adapter defaults to SQLite `:memory:` storage. If a file path is configured instead, the
 * adapter still starts but logs a warning because data may survive backend restarts.
 *
 * @returns {DevNotesSqliteMemoryPersistenceConfig} Validated temp persistence configuration.
 * @throws {MissingEnvironmentVariableError} When `DEV_NOTES_IN_MEMORY_PATH` or
 *   `DEV_NOTES_IN_MEMORY_JOURNAL_MODE` is missing.
 * @throws {InvalidEnvironmentVariableError} When `DEV_NOTES_IN_MEMORY_JOURNAL_MODE` is not
 *   supported.
 */
function getPersistenceConfig() {
  const databasePath = configuredStorage.databasePath;
  const requestedJournalMode = configuredStorage.journalMode;

  if (!databasePath) {
    throw new MissingEnvironmentVariableError(tempEnvKeys.databasePath, {
      moduleName,
    });
  }

  warnIfTempStorageIsFileBacked(databasePath);

  if (!requestedJournalMode) {
    throw new MissingEnvironmentVariableError(tempEnvKeys.journalMode, {
      moduleName,
    });
  }

  if (!validSqliteJournalModes.has(requestedJournalMode)) {
    throw new InvalidEnvironmentVariableError(
      tempEnvKeys.journalMode,
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
 * SQLite implementation of the temp dev-notes storage adapter.
 *
 * This adapter defaults to an in-memory SQLite database. A custom path may be configured for
 * development experiments, but file-backed temp storage may survive backend restarts.
 *
 * @type {Readonly<DevNotesSqliteMemoryAdapter>}
 * @see Module README, section "sqlite-memory adapter".
 * @see Dev-notes README, section "storage facade".
 */
export const devNotesSqliteMemoryAdapter = {
  getConnection,
  getHealth,
};
