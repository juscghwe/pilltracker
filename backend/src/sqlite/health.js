/**
 * @typedef {object} SqliteAdapterInfo
 * @property {string} id Stable adapter identifier.
 * @property {string} sourceModule Source module URL.
 */

/**
 * @typedef {object} SqlitePathInfo
 * @property {boolean} isConfigured Whether a database path was configured.
 */

/**
 * @typedef {object} SqliteRequestedJournalModeInfo
 * @property {string | null} requested Requested SQLite journal mode.
 * @property {string} set Queried SQLite journal mode.
 * @property {boolean} isConfigured Whether a journal mode was configured.
 * @property {boolean} isValid Whether the requested journal mode is allowed.
 */

/**
 * @typedef {object} SqliteHealthProbe
 * @property {number} ok SQLite proof query result. Expected to be `1` when healthy.
 * @property {string} sqliteVersion SQLite version reported by the database engine.
 */

/**
 * @typedef {object} HealthySqliteHealth
 * @property {"healthy" | "unhealthy"} status SQLite health status.
 * @property {{
 *   reportedFamily: "sqlite";
 *   version: string;
 *   source: "database_query";
 * }} engine
 *   SQLite engine metadata.
 * @property {SqliteAdapterInfo} adapter Adapter metadata.
 * @property {{
 *   requested: string;
 *   active: string;
 * }} journalMode SQLite journal mode metadata.
 * @property {SqlitePathInfo} path Database path metadata.
 */

/**
 * @typedef {object} UnhealthySqliteHealth
 * @property {"unhealthy"} status SQLite health status.
 * @property {SqliteAdapterInfo} adapter Adapter metadata.
 * @property {SqlitePathInfo} path Database path metadata.
 * @property {SqliteRequestedJournalModeInfo} journalMode Requested journal mode metadata.
 * @property {{
 *   name: string;
 *   message: string;
 * }} error Error metadata.
 */

import { getActiveSqliteJournalMode, runSqliteStatements } from "./connection.js";
import { requestedJournalMode, validSqliteJournalModes } from "../config/appConfig";

/**
 * Builds adapter identity metadata for SQLite health results.
 *
 * @param {string} adapterId Stable adapter identifier.
 * @param {string} sourceModule Source module URL.
 * @returns {readonly<SqliteAdapterInfo>} Adapter health metadata.
 */
export function createAdapterInfo(adapterId, sourceModule) {
  return Object.freeze({
    id: adapterId,
    sourceModule,
  });
}

/**
 * Builds database path configuration metadata for SQLite health results.
 *
 * @param {string | null} databasePath Configured database path.
 * @returns {readonly<SqlitePathInfo>} Path configuration metadata.
 */
export function createPathInfo(databasePath) {
  return Object.freeze({
    isConfigured: Boolean(databasePath),
  });
}

/**
 * Builds requested SQLite journal mode metadata for health results.
 *
 * @param {import("better-sqlite3").Database} connection SQLite connection.
 * @returns {readonly<SqliteRequestedJournalModeInfo>} Journal mode metadata.
 */
export function createRequestedJournalModeInfo(connection) {
  return Object.freeze({
    requested: requestedJournalMode,
    set: getActiveSqliteJournalMode(connection),
    isConfigured: Boolean(requestedJournalMode),
    isValid: requestedJournalMode ? validSqliteJournalModes.has(requestedJournalMode) : false,
  });
}

/**
 * Runs a SQLite health proof query.
 *
 * The probe should verify that the connection can execute a query and report the SQLite engine
 * version.
 *
 * @param {import("better-sqlite3").Database} connection SQLite connection.
 * @returns {readonly<SqliteHealthProbe>} SQLite proof query result.
 */
export function runSqliteHealthProbe(connection) {
  const probe = runSqliteStatements(
    connection,
    `
        SELECT 
            1 AS ok,
            sqlite_version() AS sqliteVersion
    `,
  );
  return Object.freeze(probe);
}

/**
 * Generate SQLite health report.
 *
 * @param {import("better-sqlite3").Database} connection SQLite connection.
 * @returns {readonly <HealthySqliteHealth | HealthySqliteHealth>} SQLite proof query result.
 */
export function createSQLHealth(connection, adapterID, sourceModule, dbPath) {
  try {
    const probe = runSqliteHealthProbe(connection);

    return Object.freeze({
      status: probe.ok === 1 ? "healthy" : "unhealthy",
      engine: {
        reportedFamily: "sqlite",
        version: probe.sqliteVersion,
        source: "database_query",
      },
      adapter: createAdapterInfo(adapterID, sourceModule),
      journalMode: createRequestedJournalModeInfo(connection),
      path: createPathInfo(dbPath),
    });
  } catch (error) {
    return Object.freeze({
      status: "unhealthy",
      adapter: createAdapterInfo(adapterID, sourceModule),
      path: createPathInfo(dbPath),
      journalMode: createRequestedJournalModeInfo(connection),
      error: {
        name: error.name,
        message: error.message,
      },
    });
  }
}
