/**
 * @typedef {object} SqliteConnectionConfig
 * @property {string} databasePath SQLite database path or `:memory:`.
 * @property {string} requestedJournalMode Requested SQLite journal mode.
 */

/**
 * @typedef {object} OpenSqliteConnectionInput
 * @property {string} databasePath SQLite database path or `:memory:`.
 */

/**
 * @typedef {object} ApplySqliteJournalModeInput
 * @property {import("better-sqlite3").Database} connection SQLite connection.
 * @property {string} requestedJournalMode Requested SQLite journal mode.
 */

/**
 * @typedef {object} OpenConfiguredSqliteConnectionInput
 * @property {string} databasePath SQLite database path or `:memory:`.
 * @property {string} requestedJournalMode Requested SQLite journal mode.
 */

/**
 * @typedef {object} RunSqliteStatementsInput
 * @property {import("better-sqlite3").Database} connection SQLite connection.
 * @property {string[]} statements SQL statements to run sequentially.
 */

import { dirname } from "node:path";
import { mkdirSync } from "node:fs";

import Database from "better-sqlite3";

/**
 * Ensures the parent directory for a file-backed SQLite database path exists.
 *
 * In-memory SQLite paths do not need filesystem preparation.
 *
 * @param {string} databasePath SQLite database path or `:memory:`.
 * @returns {void}
 */
function ensureSqliteParentDirectory(databasePath) {
  if (databasePath === ":memory:") {
    return;
  }

  mkdirSync(dirname(databasePath), { recursive: true });
}

/**
 * Opens a SQLite connection.
 *
 * File-backed SQLite databases have their parent directory created before opening. This function
 * should not validate app config, apply journal mode, create schema, or cache the connection.
 *
 * @param {OpenSqliteConnectionInput} input SQLite connection input.
 * @returns {import("better-sqlite3").Database} SQLite connection.
 */
export function openSqliteConnection(input) {
  ensureSqliteParentDirectory(input.databasePath);

  return new Database(input.databasePath);
}

/**
 * Applies the requested SQLite journal mode to an existing connection.
 *
 * This function should return the active journal mode reported by SQLite after the `PRAGMA
 * journal_mode` call.
 *
 * @param {ApplySqliteJournalModeInput} input Journal mode input.
 * @returns {string} Active SQLite journal mode.
 */
export function applySqliteJournalMode(input) {
  input.connection.pragma(`journal_mode = ${input.requestedJournalMode}`, { simple: true });
  return getActiveSqliteJournalMode(input.connection);
}

/**
 * Reads the active SQLite journal mode from an existing connection.
 *
 * @param {import("better-sqlite3").Database} connection SQLite connection.
 * @returns {string} Active SQLite journal mode.
 * @throws {TypeError} When SQLite reports a non-string journal mode.
 */
export function getActiveSqliteJournalMode(connection) {
  const journalMode = connection.pragma("journal_mode", { simple: true });

  if (typeof journalMode !== "string") {
    throw new TypeError("SQLite journal_mode PRAGMA returned a non-string value.");
  }

  return journalMode;
}

/**
 * Opens a SQLite connection and applies the requested journal mode.
 *
 * This function combines low-level SQLite setup steps. It should not validate app config, create
 * schema, or cache the connection.
 *
 * @param {OpenConfiguredSqliteConnectionInput} input Configured SQLite connection input.
 * @returns {import("better-sqlite3").Database} Configured SQLite connection.
 */
export function openConfiguredSqliteConnection(input) {
  const connection = openSqliteConnection({
    databasePath: input.databasePath,
  });

  applySqliteJournalMode({
    connection,
    requestedJournalMode: input.requestedJournalMode,
  });

  return connection;
}
