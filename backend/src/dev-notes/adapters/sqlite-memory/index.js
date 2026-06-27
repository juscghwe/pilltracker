import { readFileSync } from "node:fs";

import { appConfig, validSqliteJournalModes } from "../../../config/appConfig.js";
import { SqliteJournalModeMismatchError } from "../../../errors/index.js";
import {
  getActiveSqliteJournalMode,
  openConfiguredSqliteConnection,
} from "../../../sqlite/connection.js";
import { createSqliteHealthReporter } from "../../../sqlite/health.js";
import { seedDevNotes } from "./seed-dev.js";

let db;

const adapterId = "better-sqlite3-memory";
const moduleName = "dev-notes sqlite-memory adapter";
const databasePath = appConfig.devNotes.storage.temp.databasePath ?? ":memory:";
const requestedJournalMode = "memory";
const minDevNoteEntries = 10;

const schemaSql = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");

/**
 * Resolves and validates configuration required by the dev-notes SQLite file adapter.
 *
 * This adapter owns validation for the temp dev-notes database path because the value is optional
 * at app-config level but required when this concrete adapter is used.
 *
 * @throws {InvalidEnvironmentVariableError} When `SQLITE_JOURNAL_MODE` is not supported.
 */
function assertJournalMode(connection) {
  const activeJournalMode = getActiveSqliteJournalMode(connection);

  if (activeJournalMode !== requestedJournalMode) {
    throw new SqliteJournalModeMismatchError({
      requestedJournalMode,
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
 * @returns {import("better-sqlite3").Database} Active SQLite connection.
 * @throws {Error} When SQLite cannot open or configure the database connection.
 * @see Module README, section "connection lifecycle".
 */
function openConnection() {
  if (!db) {
    db = openConfiguredSqliteConnection({
      databasePath,
      requestedJournalMode,
    });

    db.exec(schemaSql);

    seedDevNotes(db, {
      count: minDevNoteEntries,
      mode: "when-empty",
    });
  }

  assertJournalMode(db);

  return db;
}

/**
 * Returns the active dev-notes SQLite file connection.
 *
 * This is the public connection entrypoint for the concrete adapter. It resolves adapter
 * configuration, opens the connection if needed, and verifies the active SQLite journal mode before
 * returning.
 *
 * @returns {import("better-sqlite3").Database} Active SQLite connection.
 * @throws {Error} When SQLite cannot open or configure the database connection.
 * @see Module README, section "public entrypoints".
 */
function getConnection() {
  return openConnection();
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
  databasePath,
  requestedJournalMode,
  validJournalModes: validSqliteJournalModes,
  getConnection,
});

/**
 * SQLite file implementation of the temp dev-notes storage adapter.
 *
 * This adapter stores disposable dev-notes data in a separate SQLite database file. It must not be
 * used for medication-domain persistence and should be accessed through the dev-notes storage
 * facade instead of imported directly by routes.
 *
 * @type {Readonly<DevNotesSqliteFileAdapter>}
 * @see Module README, section "sqlite-file adapter".
 * @see Dev-notes README, section "storage facade".
 */
export const devNotesSqliteMemoryAdapter = {
  getConnection,
  getHealth,
};
