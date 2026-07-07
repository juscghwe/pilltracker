import { devNotesSqliteFileAdapter } from "../../src/dev-notes/adapters/sqlite-file/index.js";
import { devNotesSqliteMemoryAdapter } from "../../src/dev-notes/adapters/sqlite-memory/index.js";

/**
 * @typedef {object} ExpectedColumn
 * @property {string} name Column name.
 * @property {string} type SQLite column type.
 * @property {boolean} notNull Whether SQLite marks the column as NOT NULL.
 * @property {boolean} primaryKey Whether SQLite marks the column as part of the primary key.
 */

/**
 * @typedef {object} SqliteTableInfoRow
 * @property {number} cid Column index.
 * @property {string} name Column name.
 * @property {string} type Column type.
 * @property {number} notnull SQLite not-null flag.
 * @property {unknown} dflt_value Default value.
 * @property {number} pk Primary-key flag.
 */

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
 * Normalizes a SQLite type string.
 *
 * @param {string} value SQLite type value.
 * @returns {string} Normalized type.
 */
function normalizeSqliteType(value) {
  return value.trim().toUpperCase();
}

/**
 * Reads SQLite table info.
 *
 * @param {import("better-sqlite3").Database} db SQLite connection.
 * @param {string} tableName Table name.
 * @returns {SqliteTableInfoRow[]} Table info rows.
 */
function readTableInfo(db, tableName) {
  return /** @type {SqliteTableInfoRow[]} */ (db.prepare(`PRAGMA table_info(${tableName})`).all());
}

/**
 * Asserts that a SQLite table has exactly the expected columns in the expected order.
 *
 * @param {object} input Assertion input.
 * @param {string} input.storageName Human-readable storage name.
 * @param {import("better-sqlite3").Database} input.db SQLite connection.
 * @param {string} input.tableName SQLite table name.
 * @param {ExpectedColumn[]} input.expectedColumns Expected columns.
 * @returns {void}
 */
function assertTableSchema({ storageName, db, tableName, expectedColumns }) {
  const actualColumns = readTableInfo(db, tableName);

  assert(
    actualColumns.length > 0,
    `${storageName}: expected table ${tableName} to exist, but PRAGMA table_info returned no rows.`,
  );

  assert(
    actualColumns.length === expectedColumns.length,
    `${storageName}: expected ${expectedColumns.length} columns, got ${
      actualColumns.length
    }: ${JSON.stringify(actualColumns)}`,
  );

  for (const [index, expected] of expectedColumns.entries()) {
    const actual = actualColumns[index];

    assert(actual, `${storageName}: missing column at index ${index}.`);

    assert(
      actual.name === expected.name,
      `${storageName}: expected column ${index} to be ${expected.name}, got ${actual.name}.`,
    );

    assert(
      normalizeSqliteType(actual.type) === expected.type,
      `${storageName}: expected ${expected.name} type ${expected.type}, got ${actual.type}.`,
    );

    assert(
      Boolean(actual.notnull) === expected.notNull,
      `${storageName}: expected ${expected.name} notNull=${expected.notNull}, got ${Boolean(
        actual.notnull,
      )}.`,
    );

    assert(
      Boolean(actual.pk) === expected.primaryKey,
      `${storageName}: expected ${expected.name} primaryKey=${expected.primaryKey}, got ${Boolean(
        actual.pk,
      )}.`,
    );
  }

  console.log(`Dev-notes schema smoke passed for storage: ${storageName}`);
}

assertTableSchema({
  storageName: "persistent",
  db: devNotesSqliteFileAdapter.getConnection(),
  tableName: "dev_notes",
  expectedColumns: [
    {
      name: "id",
      type: "INTEGER",
      notNull: false,
      primaryKey: true,
    },
    {
      name: "name",
      type: "TEXT",
      notNull: true,
      primaryKey: false,
    },
    {
      name: "comment",
      type: "TEXT",
      notNull: false,
      primaryKey: false,
    },
    {
      name: "last_confirmed_interaction",
      type: "TEXT",
      notNull: false,
      primaryKey: false,
    },
    {
      name: "created_at",
      type: "TEXT",
      notNull: true,
      primaryKey: false,
    },
    {
      name: "updated_at",
      type: "TEXT",
      notNull: true,
      primaryKey: false,
    },
  ],
});

assertTableSchema({
  storageName: "temp",
  db: devNotesSqliteMemoryAdapter.getConnection(),
  tableName: "dev_notes_temp",
  expectedColumns: [
    {
      name: "id",
      type: "INTEGER",
      notNull: false,
      primaryKey: true,
    },
    {
      name: "name_temp",
      type: "TEXT",
      notNull: true,
      primaryKey: false,
    },
    {
      name: "comment_temp",
      type: "TEXT",
      notNull: false,
      primaryKey: false,
    },
    {
      name: "last_confirmed_interaction",
      type: "TEXT",
      notNull: false,
      primaryKey: false,
    },
    {
      name: "created_at",
      type: "TEXT",
      notNull: true,
      primaryKey: false,
    },
    {
      name: "updated_at",
      type: "TEXT",
      notNull: true,
      primaryKey: false,
    },
  ],
});
