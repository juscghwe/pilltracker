/** Lightweight SQLite readiness reporting for compact health endpoints. */

/**
 * @typedef {object} CreateSqlitePartialHealthReporterInput
 * @property {string} adapterId Stable adapter identifier.
 * @property {string | null} databasePath Configured database path.
 * @property {() => import("better-sqlite3").Database} getConnection Connection provider.
 */

/**
 * Creates a compact SQLite reporter that performs only a minimal connection query.
 *
 * It deliberately avoids journal-mode lookup, source-module metadata and structured diagnostic
 * collection. Detailed endpoints continue to use `createSqliteHealthReporter`.
 *
 * @param {CreateSqlitePartialHealthReporterInput} input Reporter configuration.
 * @returns {() => Readonly<{
 *   status: "healthy" | "unhealthy";
 *   adapter: Readonly<{ id: string }>;
 *   engine?: Readonly<{ reportedFamily: "sqlite"; version: string }>;
 *   path: Readonly<{ isConfigured: boolean }>;
 * }>} Compact reporter.
 */
export function createSqlitePartialHealthReporter(input) {
  const adapter = Object.freeze({ id: input.adapterId });
  const path = Object.freeze({ isConfigured: Boolean(input.databasePath) });

  return function getSqliteHealthPartial() {
    try {
      const probe = /** @type {{ ok: number; sqliteVersion: string }} */ (
        input
          .getConnection()
          .prepare("SELECT 1 AS ok, sqlite_version() AS sqliteVersion")
          .get()
      );

      return Object.freeze({
        status: probe.ok === 1 ? "healthy" : "unhealthy",
        adapter,
        engine: Object.freeze({
          reportedFamily: "sqlite",
          version: probe.sqliteVersion,
        }),
        path,
      });
    } catch {
      return Object.freeze({ status: "unhealthy", adapter, path });
    }
  };
}
