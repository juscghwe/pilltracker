/** Lightweight dev-notes SQLite readiness reporting. */

import {
  buildSqliteTableSchema,
  quoteSqliteIdentifier,
  readSqliteTableInfo,
} from "./sqlite-schema.js";

/**
 * Checks the resource schema without constructing detailed comparison metadata.
 *
 * @param {import("better-sqlite3").Database} connection SQLite connection.
 * @param {import("../../resource/types.js").ResourceDefinition} resource Resource contract.
 * @returns {boolean} Whether the required schema matches.
 */
function hasExpectedSchema(connection, resource) {
  const expected = buildSqliteTableSchema(resource);
  const actual = readSqliteTableInfo(connection, resource.tableName);

  if (actual.length !== expected.columns.length) {
    return false;
  }

  for (let index = 0; index < expected.columns.length; index += 1) {
    const expectedColumn = expected.columns[index];
    const actualColumn = actual[index];

    if (
      !actualColumn ||
      actualColumn.name !== expectedColumn.name ||
      actualColumn.type.trim().toUpperCase() !== expectedColumn.type ||
      Boolean(actualColumn.notnull) !== expectedColumn.notNull ||
      Boolean(actualColumn.pk) !== expectedColumn.primaryKey
    ) {
      return false;
    }
  }

  if (expected.columns.some((column) => column.autoIncrement)) {
    const row = /** @type {{ sql?: unknown } | undefined} */ (
      connection
        .prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = @tableName")
        .get({ tableName: resource.tableName })
    );

    if (!row || typeof row.sql !== "string" || !/\bAUTOINCREMENT\b/i.test(row.sql)) {
      return false;
    }
  }

  connection
    .prepare(`SELECT 1 AS ok FROM ${quoteSqliteIdentifier(resource.tableName)} LIMIT 1`)
    .get();

  return true;
}

/**
 * @param {object} input Reporter configuration.
 * @param {() => import("better-sqlite3").Database} input.getConnection Connection provider.
 * @param {import("../../resource/types.js").ResourceDefinition} input.resource Resource contract.
 * @returns {() => Readonly<{ status: "healthy" | "unhealthy" }>} Compact reporter.
 */
export function createDevNotesSqlitePartialHealthReporter(input) {
  return function getDevNotesSqliteHealthPartial() {
    try {
      return Object.freeze({
        status: hasExpectedSchema(input.getConnection(), input.resource) ? "healthy" : "unhealthy",
      });
    } catch {
      return Object.freeze({ status: "unhealthy" });
    }
  };
}
