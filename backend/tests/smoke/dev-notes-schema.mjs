import { getPersistentConnection } from "../../src/dev-notes/adapters/sqlite/persistent/connection.js";
import {
  buildSqliteTableSchema,
  readSqliteTableInfo,
} from "../../src/dev-notes/adapters/sqlite/sqlite-schema.js";
import { getTempConnection } from "../../src/dev-notes/adapters/sqlite/temp/connection.js";
import { devNotesResource } from "../../src/dev-notes/index.js";

/**
 * Fails the smoke test when a condition is false.
 *
 * @param {unknown} condition Assertion condition.
 * @param {string} message Failure message.
 * @returns {asserts condition}
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * Asserts that one storage connection matches the resource contract.
 *
 * @param {object} input Assertion input.
 * @param {string} input.storageName Human-readable storage name.
 * @param {import("better-sqlite3").Database} input.connection SQLite connection.
 * @returns {void}
 */
function assertStorageSchema({ storageName, connection }) {
  const expected = buildSqliteTableSchema(devNotesResource);
  const actual = readSqliteTableInfo(connection, expected.tableName);

  assert(
    actual.length === expected.columns.length,
    `${storageName}: expected ${expected.columns.length} columns, got ${actual.length}.`,
  );

  for (const [index, expectedColumn] of expected.columns.entries()) {
    const actualColumn = actual[index];

    assert(actualColumn, `${storageName}: missing column at index ${index}.`);
    assert(
      actualColumn.name === expectedColumn.name,
      `${storageName}: expected column ${index} to be ${expectedColumn.name}, got ${actualColumn.name}.`,
    );
    assert(
      actualColumn.type.trim().toUpperCase() === expectedColumn.type,
      `${storageName}: expected ${expectedColumn.name} type ${expectedColumn.type}, got ${actualColumn.type}.`,
    );
    assert(
      Boolean(actualColumn.notnull) === expectedColumn.notNull,
      `${storageName}: expected ${expectedColumn.name} notNull=${expectedColumn.notNull}, got ${Boolean(
        actualColumn.notnull,
      )}.`,
    );
    assert(
      Boolean(actualColumn.pk) === expectedColumn.primaryKey,
      `${storageName}: expected ${expectedColumn.name} primaryKey=${expectedColumn.primaryKey}, got ${Boolean(
        actualColumn.pk,
      )}.`,
    );
  }

  console.log(`Dev-notes schema smoke passed for storage: ${storageName}`);
}

assertStorageSchema({
  storageName: "persistent",
  connection: getPersistentConnection(),
});

assertStorageSchema({
  storageName: "temp",
  connection: getTempConnection(),
});
