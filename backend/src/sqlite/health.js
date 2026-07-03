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

/** @typedef {() => Readonly<SqliteHealthResult>} SqliteHealthReporter */

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
 * @returns {Readonly<SqliteHealthResult>} SQLite health result.
 */

/** @typedef {"healthy" | "unhealthy"} SqliteHealthStatus */

/**
 * @typedef {object} SqliteEngineInfo
 * @property {"sqlite"} reportedFamily Reported database family.
 * @property {string} version SQLite version.
 * @property {"database_query"} source Source of the engine metadata.
 */

/**
 * @typedef {object} SqliteRequestedJournalModeInfo
 * @property {string | null} requested Requested SQLite journal mode.
 * @property {string | null} active Active SQLite journal mode, when a connection is available.
 * @property {boolean} isConfigured Whether a journal mode was configured.
 * @property {boolean} isValid Whether the configured journal mode is valid.
 */

/**
 * @typedef {object} SqliteHealthErrorInfo
 * @property {string} name Error name.
 * @property {string} code Stable machine-readable error code.
 * @property {string} message Error message.
 * @property {object | null} details Structured error details, when available.
 */

/**
 * @typedef {object} HealthySqliteHealth
 * @property {"healthy" | "unhealthy"} status SQLite health status.
 * @property {Readonly<SqliteEngineInfo>} engine SQLite engine metadata.
 * @property {Readonly<SqliteAdapterInfo>} adapter Adapter metadata.
 * @property {Readonly<SqliteRequestedJournalModeInfo>} journalMode Journal mode metadata.
 * @property {Readonly<SqlitePathInfo>} path Path metadata.
 */

/**
 * @typedef {object} UnhealthySqliteHealth
 * @property {"unhealthy"} status SQLite health status.
 * @property {Readonly<SqliteAdapterInfo>} adapter Adapter metadata.
 * @property {Readonly<SqliteRequestedJournalModeInfo>} journalMode Journal mode metadata.
 * @property {Readonly<SqlitePathInfo>} path Path metadata.
 * @property {Readonly<SqliteHealthErrorInfo>} error Error metadata.
 */

/** @typedef {HealthySqliteHealth | UnhealthySqliteHealth} SqliteHealthResult */

import { getActiveSqliteJournalMode } from "./connection.js";

/**
 * Builds adapter identity metadata for SQLite health results.
 *
 * @param {string} adapterId Stable adapter identifier.
 * @param {string} sourceModule Source module URL.
 * @returns {Readonly<SqliteAdapterInfo>} Adapter health metadata.
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
 * @returns {Readonly<SqlitePathInfo>} Path configuration metadata.
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
 * Builds SQLite engine metadata from a successful probe.
 *
 * @param {SqliteHealthProbe} probe SQLite proof query result.
 * @returns {Readonly<SqliteEngineInfo>} SQLite engine metadata.
 */
function createSqliteEngineInfo(probe) {
  return Object.freeze({
    reportedFamily: "sqlite",
    version: probe.sqliteVersion,
    source: "database_query",
  });
}

/**
 * Normalizes an unknown thrown value into health-safe error metadata.
 *
 * @param {unknown} error Thrown value.
 * @returns {Readonly<SqliteHealthErrorInfo>} Health-safe error metadata.
 */
function createSqliteHealthErrorInfo(error) {
  if (error instanceof Error) {
    const structuredError = /** @type {Error & { code?: string; details?: unknown }} */ (error);

    return Object.freeze({
      name: structuredError.name,
      code: structuredError.code ?? "UNKNOWN_ERROR",
      message: structuredError.message,
      details:
        typeof structuredError.details === "object" && structuredError.details !== null
          ? structuredError.details
          : null,
    });
  }

  return Object.freeze({
    name: "NonErrorThrown",
    code: "UNKNOWN_ERROR",
    message: String(error),
    details: null,
  });
}

/**
 * Runs a SQLite health proof query.
 *
 * The probe should verify that the connection can execute a query and report the SQLite engine
 * version.
 *
 * @param {import("better-sqlite3").Database} connection SQLite connection.
 * @returns {Readonly<SqliteHealthProbe>} SQLite proof query result.
 */
function runSqliteHealthProbe(connection) {
  const probe = /** @type {SqliteHealthProbe} */ (
    connection
      .prepare(
        `
        SELECT 
            1 AS ok,
            sqlite_version() AS sqliteVersion
      `,
      )
      .get()
  );
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
 * @returns {SqliteHealthReporter} SQLite health reporter.
 */
export function createSqliteHealthReporter(input) {
  const adapter = createAdapterInfo(input.adapterId, input.sourceModule);
  const path = createPathInfo(input.databasePath);

  /**
   * Returns the current SQLite health result.
   *
   * @returns {Readonly<SqliteHealthResult>} SQLite health result.
   */
  function getSqliteHealth() {
    try {
      const connection = input.getConnection();
      const probe = runSqliteHealthProbe(connection);

      return Object.freeze({
        status: probe.ok === 1 ? "healthy" : "unhealthy",
        engine: createSqliteEngineInfo(probe),
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
        error: createSqliteHealthErrorInfo(error),
      });
    }
  }

  return getSqliteHealth;
}
