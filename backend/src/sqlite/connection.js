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

import Database from "better-sqlite3";

/**
 * Opens a SQLite connection.
 *
 * This function should only create the database connection. It should not validate app config,
 * apply journal mode, create schema, or cache the connection.
 *
 * @param {OpenSqliteConnectionInput} input SQLite connection input.
 * @returns {import("better-sqlite3").Database} SQLite connection.
 */
export function openSqliteConnection(input) {
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
 */
export function getActiveSqliteJournalMode(connection) {
  return connection.pragma("journal_mode", { simple: true });
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
  let connection = openSqliteConnection(input.databasePath);
  applySqliteJournalMode(input.requestedJournalMode);
  return connection;
}

/**
 * Runs SQLite schema or setup statements sequentially.
 *
 * This helper is intended for adapter-owned schema setup such as `CREATE TABLE IF NOT EXISTS ...`.
 *
 * @param {import("better-sqlite3").Database} connection SQLite connection.
 * @param {RunSqliteStatementsInput} input SQL statement input.
 * @returns {void}
 */
export function runSqliteStatements(connection, input) {
  try {
    return connection.prepare(input);
  } catch (error) {
    return error;
  }
}
