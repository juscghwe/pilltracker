/** Read-only SQLite repository health, including exact resource-schema validation. */

import { createSqliteHealthReporter } from "../../../sqlite/health.js";
import { validateSqliteSchema } from "./sqlite-schema.js";

/**
 * @typedef {object} CreateDevNotesSqliteHealthReporterInput
 * @property {string} adapterId Stable adapter id.
 * @property {string} sourceModule Source module URL.
 * @property {string | null} databasePath Configured database path.
 * @property {string | null} requestedJournalMode Requested journal mode.
 * @property {Set<string>} validJournalModes Valid journal modes.
 * @property {() => import("better-sqlite3").Database} getConnection Connection provider.
 * @property {import("../../resource/types.js").ResourceDefinition} resource Resource contract.
 */

/**
 * @param {CreateDevNotesSqliteHealthReporterInput} input Health configuration.
 * @returns {() => Readonly<object>} Health reporter.
 */
export function createDevNotesSqliteHealthReporter(input) {
  const getBaseHealth = createSqliteHealthReporter({
    adapterId: input.adapterId,
    sourceModule: input.sourceModule,
    databasePath: input.databasePath,
    requestedJournalMode: input.requestedJournalMode,
    validJournalModes: input.validJournalModes,
    getConnection: input.getConnection,
  });

  return function getDevNotesSqliteHealth() {
    const baseHealth = getBaseHealth();

    if (baseHealth.status !== "healthy") {
      return Object.freeze({ ...baseHealth, schema: null });
    }

    try {
      const schema = validateSqliteSchema(input.getConnection(), input.resource);

      return Object.freeze({
        ...baseHealth,
        status: schema.ok ? "healthy" : "unhealthy",
        schema,
      });
    } catch (error) {
      return Object.freeze({
        ...baseHealth,
        status: "unhealthy",
        schema: null,
        schemaError: Object.freeze({
          name: error instanceof Error ? error.name : "NonErrorThrown",
          message: error instanceof Error ? error.message : String(error),
        }),
      });
    }
  };
}
