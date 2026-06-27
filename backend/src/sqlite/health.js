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

/**
 * Builds adapter identity metadata for SQLite health results.
 *
 * @param {string} adapterId Stable adapter identifier.
 * @param {string} sourceModule Source module URL.
 * @returns {SqliteAdapterInfo} Adapter health metadata.
 */
export function createAdapterInfo(adapterId, sourceModule) {
  return {
    id: adapterId,
    sourceModule,
  };
}

/**
 * Builds database path configuration metadata for SQLite health results.
 *
 * @param {string | null} databasePath Configured database path.
 * @returns {SqlitePathInfo} Path configuration metadata.
 */
export function createPathInfo(databasePath) {
  return {
    isConfigured: Boolean(databasePath),
  };
}

/**
 * Builds requested SQLite journal mode metadata for health results.
 *
 * @param {string | null} requestedJournalMode Requested SQLite journal mode.
 * @param {Set<string>} validJournalModes Allowed SQLite journal modes.
 * @returns {SqliteRequestedJournalModeInfo} Journal mode metadata.
 */
export function createRequestedJournalModeInfo(requestedJournalMode, validJournalModes) {
  return {
    requested: requestedJournalMode,
    isConfigured: Boolean(requestedJournalMode),
    isValid: requestedJournalMode ? validJournalModes.has(requestedJournalMode) : false,
  };
}

/**
 * Runs a SQLite health proof query.
 *
 * The probe should verify that the connection can execute a query and report the SQLite engine
 * version.
 *
 * @param {import("better-sqlite3").Database} connection SQLite connection.
 * @returns {SqliteHealthProbe} SQLite proof query result.
 */
export function runSqliteHealthProbe(connection) {
  try {
    const probe = connection
      .prepare(
        `
                SELECT 
                    1 AS ok,
                    sqlite_version() AS sqliteVersion
                `,
      )
      .get();

    const activeJournalMode = connection.pragma("journal_mode", {
      simple: true,
    });

    return createHealthySqliteHealth({
      probe,
      activeJournalMode,
    });
  } catch (error) {
    return createUnhealthySqliteHealth(error);
  }
}

/**
 * @param {HealthySqliteHealthInput} input Health result input.
 * @returns {HealthySqliteHealth} SQLite adapter health result.
 */
export function createHealthySqliteHealth(input) {
  return {
    status: input.probe.ok === 1 ? "healthy" : "unhealthy",
    engine: {
      reportedFamily: "sqlite",
      version: input.probe.sqliteVersion,
      source: "database_query",
    },
    adapter: createAdapterInfo(input.adapter),
    journalMode: createRequestedJournalModeInfo(input.journalMode),
    path: createPathInfo(input.path),
  };
}

/**
 * @param {UnhealthySqliteHealthInput} input Health result input.
 * @returns {UnhealthySqliteHealth} SQLite adapter health result.
 */
export function createUnhealthySqliteHealth(input) {
  return {
    status: "unhealthy",
    adapter: createAdapterInfo(input.adapter),
    path: createPathInfo(input.path),
    journalMode: createRequestedJournalModeInfo(input.journalMode),
    error: {
      name: input.error.name,
      message: input.error.message,
    },
  };
}
