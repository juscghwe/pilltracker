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
 * @typedef {object} RequestedJournalModeInfoInput
 * @property {import("better-sqlite3").Database} connection SQLite connection.
 * @property {string | null} requestedJournalMode Requested SQLite journal mode.
 * @property {Set<string>} validJournalModes Allowed SQLite journal modes.
 */

/**
 * @typedef {object} SqliteHealthProbe
 * @property {number} ok SQLite proof query result. Expected to be `1` when healthy.
 * @property {string} sqliteVersion SQLite version reported by the database engine.
 */

/**
 * @typedef {object} CreateSqliteHealthReporterInput
 * @property {string} adapterId Stable adapter identifier.
 * @property {string} sourceModule Source module URL, usually `import.meta.url`.
 * @property {string | null} databasePath Configured database path.
 * @property {string | null} requestedJournalMode Requested SQLite journal mode.
 * @property {Set<string>} validJournalModes Allowed SQLite journal modes.
 * @property {() => import("better-sqlite3").Database} getConnection Returns the active SQLite
 *   connection.
 */

/**
 * @callback GetSqliteHealth
 * @param {import("better-sqlite3").Database} connection SQLite connection.
 * @returns {Readonly<HealthySqliteHealth | UnhealthySqliteHealth>} SQLite health result.
 */

import { getActiveSqliteJournalMode, runSqliteStatements } from "./connection.js";

/**
 * Builds adapter identity metadata for SQLite health results.
 *
 * @param {string} adapterId Stable adapter identifier.
 * @param {string} sourceModule Source module URL.
 * @returns {readonly<SqliteAdapterInfo>} Adapter health metadata.
 */
function createAdapterInfo(adapterId, sourceModule) {
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
function createPathInfo(databasePath) {
  return Object.freeze({
    isConfigured: Boolean(databasePath),
  });
}

/**
 * Builds requested SQLite journal mode metadata for health results.
 *
 * @param {RequestedJournalModeInfoInput} input Journal mode metadata input.
 * @returns {Readonly<SqliteRequestedJournalModeInfo>} Journal mode metadata.
 */
function createRequestedJournalModeInfo(input) {
  return Object.freeze({
    requested: input.requestedJournalMode,
    active: getActiveSqliteJournalMode(input.connection),
    isConfigured: Boolean(input.requestedJournalMode),
    isValid: input.requestedJournalMode
      ? input.validJournalModes.has(input.requestedJournalMode)
      : false,
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
function runSqliteHealthProbe(connection) {
  const probe = connection
    .prepare(
      `
        SELECT 
            1 AS ok,
            sqlite_version() AS sqliteVersion
      `,
    )
    .get();
  return Object.freeze(probe);
}

/**
 * Builds requested SQLite journal mode metadata without an active connection.
 *
 * @param {object} input Journal mode metadata input.
 * @param {string | null} input.requestedJournalMode Requested SQLite journal mode.
 * @param {Set<string>} input.validJournalModes Allowed SQLite journal modes.
 * @returns {Readonly<SqliteRequestedJournalModeInfo>} Journal mode metadata.
 */
function createRequestedJournalModeInfoWithoutConnection(input) {
  return Object.freeze({
    requested: input.requestedJournalMode,
    active: null,
    isConfigured: Boolean(input.requestedJournalMode),
    isValid: input.requestedJournalMode
      ? input.validJournalModes.has(input.requestedJournalMode)
      : false,
  });
}

/**
 * Creates a complete SQLite health reporter for one adapter.
 *
 * The returned function opens/reuses the adapter connection through `getConnection`, runs the
 * SQLite proof query, and formats a health result.
 *
 * @param {CreateSqliteHealthReporterInput} input Health reporter configuration.
 * @returns {() => Readonly<HealthySqliteHealth | UnhealthySqliteHealth>} SQLite health reporter.
 */
export function createSqliteHealthReporter(input) {
  const adapter = createAdapterInfo(input.adapterId, input.sourceModule);
  const path = createPathInfo(input.databasePath);

  return function getSqliteHealth(connection) {
    try {
      const connection = input.getConnection();
      const probe = runSqliteHealthProbe(connection);

      return Object.freeze({
        status: probe.ok === 1 ? "healthy" : "unhealthy",
        engine: {
          reportedFamily: "sqlite",
          version: probe.sqliteVersion,
          source: "database_query",
        },
        adapter,
        journalMode: createRequestedJournalModeInfo({
          connection,
          requestedJournalMode: input.requestedJournalMode,
          validJournalModes: input.validJournalModes,
        }),
        path,
      });
    } catch (error) {
      return Object.freeze({
        status: "unhealthy",
        adapter,
        path,
        journalMode: createRequestedJournalModeInfoWithoutConnection({
          requestedJournalMode: input.requestedJournalMode,
          validJournalModes: input.validJournalModes,
        }),
        error: {
          name: error.name,
          message: error.message,
        },
      });
    }
  };
}
