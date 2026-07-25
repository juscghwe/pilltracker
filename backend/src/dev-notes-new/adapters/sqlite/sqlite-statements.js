/** Safe SQLite statement generation from trusted resource definitions. */

import {
  buildSelectProjection,
  getFieldDefinitionByPublicName,
  getPrimaryKeyField,
} from "./sqlite-mapping.js";
import { quoteSqliteIdentifier } from "./sqlite-schema.js";

/**
 * Escapes a literal fragment for a LIKE pattern using backslash as the escape character.
 *
 * @param {string} value Search fragment.
 * @returns {string} Escaped fragment.
 */
export function escapeSqlLikePattern(value) {
  return value.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");
}

/**
 * @param {import("../../resource/types.js").ResourceDefinition} resource Resource contract.
 * @returns {string} List statement.
 */
export function buildListStatement(resource) {
  const primaryKey = getPrimaryKeyField(resource);
  return `SELECT\n  ${buildSelectProjection(resource)}\nFROM ${quoteSqliteIdentifier(resource.tableName)}\nORDER BY ${quoteSqliteIdentifier(primaryKey.columnName)} ASC`;
}

/**
 * @param {import("../../resource/types.js").ResourceDefinition} resource Resource contract.
 * @returns {string} Get-by-id statement.
 */
export function buildGetByIdStatement(resource) {
  const primaryKey = getPrimaryKeyField(resource);
  return `SELECT\n  ${buildSelectProjection(resource)}\nFROM ${quoteSqliteIdentifier(resource.tableName)}\nWHERE ${quoteSqliteIdentifier(primaryKey.columnName)} = @id`;
}

/**
 * @param {import("../../resource/types.js").ResourceDefinition} resource Resource contract.
 * @returns {string} Text-search statement.
 */
export function buildSearchStatement(resource) {
  const primaryKey = getPrimaryKeyField(resource);
  const searchableFields = Object.values(resource.fields).filter((definition) => definition.searchable);

  if (searchableFields.length === 0) {
    throw new TypeError(`${resource.resourceName} has no searchable fields.`);
  }

  const whereClause = searchableFields
    .map(
      (definition) =>
        `${quoteSqliteIdentifier(definition.columnName)} COLLATE NOCASE LIKE @textPattern ESCAPE char(92)`,
    )
    .join("\n   OR ");

  return `SELECT\n  ${buildSelectProjection(resource)}\nFROM ${quoteSqliteIdentifier(resource.tableName)}\nWHERE ${whereClause}\nORDER BY ${quoteSqliteIdentifier(primaryKey.columnName)} ASC`;
}

/**
 * @param {import("../../resource/types.js").ResourceDefinition} resource Resource contract.
 * @param {readonly string[]} publicNames Public field names to insert.
 * @returns {string} INSERT ... RETURNING statement.
 */
export function buildInsertStatement(resource, publicNames) {
  if (publicNames.length === 0) {
    throw new TypeError("Insert requires at least one resource field.");
  }

  const definitions = publicNames.map((name) => getFieldDefinitionByPublicName(resource, name));
  const columns = definitions.map((definition) => quoteSqliteIdentifier(definition.columnName));
  const parameters = definitions.map((definition) => `@${definition.publicName}`);

  return `INSERT INTO ${quoteSqliteIdentifier(resource.tableName)} (\n  ${columns.join(",\n  ")}\n)\nVALUES (\n  ${parameters.join(",\n  ")}\n)\nRETURNING\n  ${buildSelectProjection(resource)}`;
}

/**
 * @param {import("../../resource/types.js").ResourceDefinition} resource Resource contract.
 * @param {readonly string[]} publicNames Public fields to update.
 * @returns {string} UPDATE ... RETURNING statement.
 */
export function buildUpdateStatement(resource, publicNames) {
  if (publicNames.length === 0) {
    throw new TypeError("Update requires at least one resource field.");
  }

  const primaryKey = getPrimaryKeyField(resource);
  const assignments = publicNames.map((publicName) => {
    const definition = getFieldDefinitionByPublicName(resource, publicName);

    if (definition.primaryKey) {
      throw new TypeError(`Primary-key field cannot be updated: ${publicName}`);
    }

    return `${quoteSqliteIdentifier(definition.columnName)} = @${definition.publicName}`;
  });

  return `UPDATE ${quoteSqliteIdentifier(resource.tableName)}\nSET\n  ${assignments.join(",\n  ")}\nWHERE ${quoteSqliteIdentifier(primaryKey.columnName)} = @id\nRETURNING\n  ${buildSelectProjection(resource)}`;
}

/**
 * @param {import("../../resource/types.js").ResourceDefinition} resource Resource contract.
 * @returns {string} DELETE ... RETURNING statement.
 */
export function buildDeleteStatement(resource) {
  const primaryKey = getPrimaryKeyField(resource);
  return `DELETE FROM ${quoteSqliteIdentifier(resource.tableName)}\nWHERE ${quoteSqliteIdentifier(primaryKey.columnName)} = @id\nRETURNING\n  ${buildSelectProjection(resource)}`;
}
