/** SQLite implementation of the dev-notes repository port. */

import { mapSqliteRow, mapSqliteRows } from "./sqlite-mapping.js";
import {
  buildDeleteStatement,
  buildGetByIdStatement,
  buildInsertStatement,
  buildListStatement,
  buildSearchStatement,
  buildUpdateStatement,
  escapeSqlLikePattern,
} from "./sqlite-statements.js";

/**
 * @typedef {object} CreateSqliteRepositoryInput
 * @property {import("../../resource/types.js").ResourceDefinition} resource Resource contract.
 * @property {() => import("better-sqlite3").Database} getConnection Connection provider.
 * @property {() => Readonly<object>} getHealth Read-only health reporter.
 */

/**
 * @param {import("../../resource/types.js").ResourceDefinition} resource Resource contract.
 * @param {string} fieldKey Internal field key.
 * @returns {import("../../resource/types.js").ResourceFieldDefinition} Field definition.
 */
function readField(resource, fieldKey) {
  const field = resource.fields[fieldKey];

  if (!field) {
    throw new TypeError(`Missing ${resource.resourceName} contract field key: ${fieldKey}`);
  }

  return field;
}

/**
 * @param {Readonly<Record<string, import("../../resource/types.js").ResourceCommandValue>>} values
 *   Values.
 * @param {string} publicName Public name.
 * @returns {import("../../resource/types.js").ResourceCommandValue | undefined} Value.
 */
function readOptionalValue(values, publicName) {
  return Object.hasOwn(values, publicName) ? values[publicName] : undefined;
}

/**
 * @param {unknown} row SQLite row.
 * @returns {Readonly<Record<string, unknown>> | null} Record or null.
 */
function readRow(row) {
  if (typeof row !== "object" || row === null || Array.isArray(row)) {
    return null;
  }

  return /** @type {Readonly<Record<string, unknown>>} */ (row);
}

/**
 * Creates one synchronous SQLite repository.
 *
 * @param {CreateSqliteRepositoryInput} input Repository composition input.
 * @returns {Readonly<import("../../resource/types.js").DevNotesRepository>} Repository.
 */
export function createSqliteRepository(input) {
  const nameField = readField(input.resource, "name");
  const commentField = readField(input.resource, "comment");
  const interactionField = readField(input.resource, "lastConfirmedInteraction");
  const createdAtField = readField(input.resource, "createdAt");
  const updatedAtField = readField(input.resource, "updatedAt");

  const listSql = buildListStatement(input.resource);
  const getByIdSql = buildGetByIdStatement(input.resource);
  const searchSql = buildSearchStatement(input.resource);
  const deleteSql = buildDeleteStatement(input.resource);
  const createPublicNames = Object.freeze([
    nameField.publicName,
    commentField.publicName,
    createdAtField.publicName,
    updatedAtField.publicName,
  ]);
  const createSql = buildInsertStatement(input.resource, createPublicNames);
  const replacePublicNames = Object.freeze([
    nameField.publicName,
    commentField.publicName,
    interactionField.publicName,
    updatedAtField.publicName,
  ]);
  const replaceSql = buildUpdateStatement(input.resource, replacePublicNames);

  function list() {
    const rows = /** @type {Readonly<Record<string, unknown>>[]} */ (
      input.getConnection().prepare(listSql).all()
    );
    return mapSqliteRows(input.resource, rows);
  }

  /** @param {number} id */
  function getById(id) {
    const row = readRow(input.getConnection().prepare(getByIdSql).get({ id }));
    return row ? mapSqliteRow(input.resource, row) : null;
  }

  /** @param {string} text */
  function search(text) {
    const rows = /** @type {Readonly<Record<string, unknown>>[]} */ (
      input
        .getConnection()
        .prepare(searchSql)
        .all({ textPattern: `%${escapeSqlLikePattern(text)}%` })
    );
    return mapSqliteRows(input.resource, rows);
  }

  /** @param {Readonly<Record<string, import("../../resource/types.js").ResourceCommandValue>>} values */
  function create(values) {
    const now = new Date().toISOString();
    const name = readOptionalValue(values, nameField.publicName);
    const comment = readOptionalValue(values, commentField.publicName);

    if (typeof name !== "string") {
      throw new TypeError("Validated dev-note create values require a string name.");
    }

    /** @type {Record<string, import("../../resource/types.js").ResourceCommandValue>} */
    const parameters = {
      [nameField.publicName]: name,
      [commentField.publicName]: comment ?? null,
      [createdAtField.publicName]: now,
      [updatedAtField.publicName]: now,
    };
    const row = readRow(input.getConnection().prepare(createSql).get(parameters));
    return row ? mapSqliteRow(input.resource, row) : null;
  }

  /**
   * @param {number} id
   * @param {Readonly<Record<string, import("../../resource/types.js").ResourceCommandValue>>} values
   */
  function replace(id, values) {
    const name = readOptionalValue(values, nameField.publicName);
    const comment = readOptionalValue(values, commentField.publicName);

    if (typeof name !== "string") {
      throw new TypeError("Validated dev-note replacement values require a string name.");
    }

    /** @type {Record<string, import("../../resource/types.js").ResourceCommandValue>} */
    const parameters = {
      id,
      [nameField.publicName]: name,
      [commentField.publicName]: comment ?? null,
      [interactionField.publicName]: null,
      [updatedAtField.publicName]: new Date().toISOString(),
    };
    const row = readRow(input.getConnection().prepare(replaceSql).get(parameters));
    return row ? mapSqliteRow(input.resource, row) : null;
  }

  /**
   * @param {number} id
   * @param {Readonly<Record<string, import("../../resource/types.js").ResourceCommandValue>>} values
   * @param {readonly string[]} providedFields Public names supplied by the caller.
   */
  function update(id, values, providedFields) {
    if (providedFields.length === 0) {
      return null;
    }

    const updatePublicNames = Object.freeze([...providedFields, updatedAtField.publicName]);
    const updateSql = buildUpdateStatement(input.resource, updatePublicNames);
    /** @type {Record<string, import("../../resource/types.js").ResourceCommandValue>} */
    const parameters = { id, [updatedAtField.publicName]: new Date().toISOString() };

    for (const publicName of providedFields) {
      if (!Object.hasOwn(values, publicName)) {
        throw new TypeError(`Provided update field has no normalized value: ${publicName}`);
      }

      parameters[publicName] = values[publicName];
    }

    const row = readRow(input.getConnection().prepare(updateSql).get(parameters));
    return row ? mapSqliteRow(input.resource, row) : null;
  }

  /** @param {number} id */
  function remove(id) {
    const row = readRow(input.getConnection().prepare(deleteSql).get({ id }));
    return row ? mapSqliteRow(input.resource, row) : null;
  }

  return Object.freeze({
    list,
    getById,
    search,
    create,
    replace,
    update,
    delete: remove,
    getHealth: input.getHealth,
  });
}
