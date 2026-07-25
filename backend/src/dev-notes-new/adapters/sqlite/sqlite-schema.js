/** SQLite schema generation and read-only schema validation derived from a resource contract. */

/**
 * Safely quotes a trusted SQLite identifier.
 *
 * Dynamic identifiers must come from the resource contract, never directly from request input.
 * Quoting still prevents accidental syntax breakage and keeps the SQL helper generic.
 *
 * @param {string} identifier Identifier.
 * @returns {string} Quoted identifier.
 */
export function quoteSqliteIdentifier(identifier) {
  if (typeof identifier !== "string" || identifier.trim() === "" || identifier.includes("\0")) {
    throw new TypeError("SQLite identifier must be a non-empty string without null bytes.");
  }

  return `"${identifier.replaceAll('"', '""')}"`;
}

/**
 * @param {import("../../resource/types.js").ResourceDefinition} resource Resource contract.
 * @returns {import("../../resource/types.js").SqliteTableSchema} Normalized schema.
 */
export function buildSqliteTableSchema(resource) {
  const columns = Object.values(resource.fields).map((field) =>
    Object.freeze({
      name: field.columnName,
      type: field.sqliteType.trim().toUpperCase(),
      notNull: !field.nullable && !field.primaryKey,
      primaryKey: Boolean(field.primaryKey),
      autoIncrement: Boolean(field.autoIncrement),
    }),
  );

  return Object.freeze({
    tableName: resource.tableName,
    columns: Object.freeze(columns),
  });
}

/**
 * @param {import("../../resource/types.js").ResourceDefinition} resource Resource contract.
 * @returns {string} CREATE TABLE statement.
 */
export function createSqliteTableStatement(resource) {
  const schema = buildSqliteTableSchema(resource);
  const columnSql = schema.columns.map((column) => {
    const parts = [quoteSqliteIdentifier(column.name), column.type];

    if (column.primaryKey) {
      parts.push("PRIMARY KEY");
    }

    if (column.autoIncrement) {
      if (!column.primaryKey || column.type !== "INTEGER") {
        throw new TypeError("SQLite AUTOINCREMENT requires an INTEGER PRIMARY KEY field.");
      }

      parts.push("AUTOINCREMENT");
    }

    if (column.notNull) {
      parts.push("NOT NULL");
    }

    return `  ${parts.join(" ")}`;
  });

  return `CREATE TABLE IF NOT EXISTS ${quoteSqliteIdentifier(schema.tableName)} (\n${columnSql.join(",\n")}\n);`;
}

/**
 * Creates the table when it does not exist.
 *
 * @param {import("better-sqlite3").Database} connection SQLite connection.
 * @param {import("../../resource/types.js").ResourceDefinition} resource Resource contract.
 * @returns {void}
 */
export function ensureSqliteSchema(connection, resource) {
  connection.exec(createSqliteTableStatement(resource));
}

/**
 * @typedef {object} SqliteTableInfoRow
 * @property {number} cid Column index.
 * @property {string} name Column name.
 * @property {string} type Column type.
 * @property {number} notnull NOT NULL flag.
 * @property {unknown} dflt_value Default value.
 * @property {number} pk Primary-key flag.
 */

/**
 * @param {import("better-sqlite3").Database} connection SQLite connection.
 * @param {string} tableName Table name.
 * @returns {readonly SqliteTableInfoRow[]} Table info.
 */
export function readSqliteTableInfo(connection, tableName) {
  return Object.freeze(
    /** @type {SqliteTableInfoRow[]} */ (
      connection.prepare(`PRAGMA table_info(${quoteSqliteIdentifier(tableName)})`).all()
    ).map((row) => Object.freeze({ ...row })),
  );
}

/**
 * @param {import("better-sqlite3").Database} connection SQLite connection.
 * @param {string} tableName Table name.
 * @returns {string | null} Stored CREATE TABLE SQL.
 */
function readStoredCreateTableSql(connection, tableName) {
  const row = /** @type {{sql?: unknown} | undefined} */ (
    connection
      .prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = @tableName")
      .get({ tableName })
  );

  return row && typeof row.sql === "string" ? row.sql : null;
}

/**
 * Performs an exact, read-only schema comparison against the resource contract.
 *
 * @param {import("better-sqlite3").Database} connection SQLite connection.
 * @param {import("../../resource/types.js").ResourceDefinition} resource Resource contract.
 * @returns {Readonly<{
 *   ok: boolean;
 *   tableName: string;
 *   expectedColumns: readonly import("../../resource/types.js").SqliteSchemaColumn[];
 *   actualColumns: readonly Readonly<{name: string; type: string; notNull: boolean; primaryKey: boolean}>[];
 *   problems: readonly string[];
 * }>} Schema validation result.
 */
export function validateSqliteSchema(connection, resource) {
  const expected = buildSqliteTableSchema(resource);
  const tableInfo = readSqliteTableInfo(connection, resource.tableName);
  const actualColumns = Object.freeze(
    tableInfo.map((row) =>
      Object.freeze({
        name: row.name,
        type: row.type.trim().toUpperCase(),
        notNull: Boolean(row.notnull),
        primaryKey: Boolean(row.pk),
      }),
    ),
  );
  /** @type {string[]} */
  const problems = [];

  if (actualColumns.length !== expected.columns.length) {
    problems.push(
      `Expected ${expected.columns.length} columns but SQLite reported ${actualColumns.length}.`,
    );
  }

  const columnCount = Math.max(actualColumns.length, expected.columns.length);

  for (let index = 0; index < columnCount; index += 1) {
    const expectedColumn = expected.columns[index];
    const actualColumn = actualColumns[index];

    if (!expectedColumn) {
      problems.push(`Unexpected SQLite column at index ${index}: ${actualColumn?.name ?? "unknown"}.`);
      continue;
    }

    if (!actualColumn) {
      problems.push(`Missing SQLite column at index ${index}: ${expectedColumn.name}.`);
      continue;
    }

    if (actualColumn.name !== expectedColumn.name) {
      problems.push(
        `Column ${index} name mismatch: expected ${expectedColumn.name}, got ${actualColumn.name}.`,
      );
    }

    if (actualColumn.type !== expectedColumn.type) {
      problems.push(
        `Column ${expectedColumn.name} type mismatch: expected ${expectedColumn.type}, got ${actualColumn.type}.`,
      );
    }

    if (actualColumn.notNull !== expectedColumn.notNull) {
      problems.push(
        `Column ${expectedColumn.name} NOT NULL mismatch: expected ${expectedColumn.notNull}, got ${actualColumn.notNull}.`,
      );
    }

    if (actualColumn.primaryKey !== expectedColumn.primaryKey) {
      problems.push(
        `Column ${expectedColumn.name} primary-key mismatch: expected ${expectedColumn.primaryKey}, got ${actualColumn.primaryKey}.`,
      );
    }
  }

  if (expected.columns.some((column) => column.autoIncrement)) {
    const createSql = readStoredCreateTableSql(connection, resource.tableName);

    if (!createSql || !/\bAUTOINCREMENT\b/i.test(createSql)) {
      problems.push("Expected AUTOINCREMENT in the stored CREATE TABLE statement.");
    }
  }

  return Object.freeze({
    ok: problems.length === 0,
    tableName: expected.tableName,
    expectedColumns: expected.columns,
    actualColumns,
    problems: Object.freeze(problems),
  });
}
