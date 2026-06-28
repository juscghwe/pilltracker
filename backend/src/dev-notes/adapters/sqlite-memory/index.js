import { readFileSync } from "node:fs";

import { appConfig, validSqliteJournalModes } from "../../../config/appConfig.js";
import { openConfiguredSqliteConnection } from "../../../sqlite/connection.js";
import { createSqliteHealthReporter } from "../../../sqlite/health.js";
import { seedDevNotes } from "./seed-dev.js";

let db;

const adapterId = "better-sqlite3-memory";
const databasePath = appConfig.devNotes.storage.temp.databasePath ?? ":memory:";
const requestedJournalMode = "memory";
const minDevNoteEntries = 10;

const schemaSql = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");

/**
 * Opens and validates the cached dev-notes SQLite in-memory connection.
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
 * @throws {Error} When SQLite cannot open or configure the database connection.
 * @see Module README, section "public entrypoints".
 */
function getConnection() {
  return openConnection();
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
  sourceModule: import.meta.url,
  databasePath,
  requestedJournalMode,
  validJournalModes: validSqliteJournalModes,
  getConnection,
});

/**
 * SQLite in-memory implementation of the temp dev-notes storage adapter.
 *
 * This adapter stores disposable dev-notes data in a separate SQLite database in-memory. It must
 * not be used for medication-domain persistence and should be accessed through the dev-notes
 * storage facade instead of imported directly by routes.
 *
 * @type {Readonly<DevNotesSqliteMemoryAdapter>}
 * @see Module README, section "sqlite-memory adapter".
 * @see Dev-notes README, section "storage facade".
 */
export const devNotesSqliteMemoryAdapter = {
  getConnection,
  getHealth,
};
