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

const adapterId = "better-sqlite3";
const moduleName = "dev-notes sqlite-memory adapter";
const sourceModule = import.meta.url;
const configuredMemory = appConfig.devNotes.storage.temp;
const memoryEnvKeys = environmentKeys.devNotes.storage.temp;

const minDevNoteEntries = 10;

const schemaSql = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");

/**
 * Resolves and validates configuration required by the dev-notes SQLite memory adapter.
 *
 * This adapter owns validation for the memory dev-notes database path because the value is optional
 * at app-config level but required when this concrete adapter is used.
 *
 * @returns {import("../../types.js").DevNotesSqliteMemoryPersistenceConfig} Validated memory
 *   configuration.
 * @throws {MissingEnvironmentVariableError} When `DEV_NOTES_DB_PATH` is missing or neither
 *   `DEV_NOTES_MEMORY_JOURNAL_MODE` nor `APP_SQLITE_JOURNAL_MODE` is configured.
 * @throws {InvalidEnvironmentVariableError} When `DEV_NOTES_MEMORY_JOURNAL_MODE` is not supported.
 * @see Module README, section "sqlite-memory adapter".
 */
function getMemoryConfig() {
  const databasePath = configuredMemory.databasePath;
  const requestedJournalMode = configuredMemory.journalMode;
  const journalModeEnvName = `${memoryEnvKeys.journalMode} or ${environmentKeys.app.memory.sqliteJournalMode}`;

  if (!databasePath) {
    throw new MissingEnvironmentVariableError(memoryEnvKeys.databasePath, {
      moduleName,
    });
  }

  if (!requestedJournalMode) {
    throw new MissingEnvironmentVariableError(journalModeEnvName, {
      moduleName,
    });
  }

  if (!validSqliteJournalModes.has(requestedJournalMode)) {
    throw new InvalidEnvironmentVariableError(
      journalModeEnvName,
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
 * @param {import("../../types.js").DevNotesSqliteMemoryPersistenceConfig} memoryConfig
 *   MemoryConfig Validated adapter configuration.
 * @returns {void}
 * @throws {SqliteJournalModeMismatchError} When the active SQLite journal mode differs from the
 *   requested mode.
 * @see Module README, section "journal mode validation".
 */
function assertJournalMode(connection, memoryConfig) {
  const activeJournalMode = getActiveSqliteJournalMode(connection);

  if (activeJournalMode !== memoryConfig.requestedJournalMode) {
    throw new SqliteJournalModeMismatchError({
      requestedJournalMode: memoryConfig.requestedJournalMode,
      activeJournalMode,
      moduleName,
    });
  }
}

/**
 * Opens and validates the cached dev-notes SQLite memory connection.
 *
 * The connection is opened lazily and cached by this concrete adapter. Shared SQLite helpers
 * create/configure connections, but this adapter owns the connection lifecycle for its database.
 *
 * @param {import("../../types.js").DevNotesSqliteMemoryPersistenceConfig} memoryConfig
 *   MemoryConfig Validated adapter configuration.
 * @returns {import("better-sqlite3").Database} Active SQLite connection.
 * @throws {SqliteJournalModeMismatchError} When the active SQLite journal mode differs from the
 *   requested mode.
 * @throws {Error} When SQLite cannot open or configure the database connection.
 * @see Module README, section "connection lifecycle".
 */
function openConnection(memoryConfig) {
  if (!db) {
    db = openConfiguredSqliteConnection({
      databasePath: memoryConfig.databasePath,
      requestedJournalMode: memoryConfig.requestedJournalMode,
    });

    db.exec(schemaSql);

    // Optional. Only use if you explicitly want demo rows.
    seedDevNotes(db, {
      count: minDevNoteEntries,
      mode: "when-empty",
    });
  }

  assertJournalMode(db, memoryConfig);

  return db;
}

/**
 * Returns the active dev-notes SQLite memory connection.
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
export function getConnection() {
  const memoryConfig = getMemoryConfig();

  return openConnection(memoryConfig);
}

/**
 * Health reporter for the dev-notes SQLite memory adapter.
 *
 * The reporter captures adapter metadata once and calls `getConnection` when health is requested,
 * so configuration and connection failures are represented as unhealthy adapter results instead of
 * escaping the health endpoint.
 *
 * @type {() => Readonly<object>}
 * @see Module README, section "health reporting".
 */
export const getHealth = createSqliteHealthReporter({
  adapterId,
  sourceModule: sourceModule,
  databasePath: configuredMemory.databasePath,
  requestedJournalMode: configuredMemory.journalMode,
  validJournalModes: validSqliteJournalModes,
  getConnection,
});
