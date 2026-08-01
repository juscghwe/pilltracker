/** Public-name/column-name mapping helpers derived from a resource contract. */

import { quoteSqliteIdentifier } from "./sqlite-schema.js";

/**
 * @param {import("../../resource/types.js").ResourceDefinition} resource Resource contract.
 * @param {string} publicName Public field name.
 * @returns {import("../../resource/types.js").ResourceFieldDefinition} Field definition.
 */
export function getFieldDefinitionByPublicName(resource, publicName) {
  const matches = Object.values(resource.fields).filter(
    (definition) => definition.publicName === publicName,
  );

  if (matches.length !== 1) {
    throw new TypeError(
      `Expected exactly one ${resource.resourceName} field with public name ${publicName}, found ${matches.length}.`,
    );
  }

  return matches[0];
}

/**
 * @param {import("../../resource/types.js").ResourceDefinition} resource Resource contract.
 * @returns {import("../../resource/types.js").ResourceFieldDefinition} Primary-key definition.
 */
export function getPrimaryKeyField(resource) {
  const primaryFields = Object.values(resource.fields).filter(
    (definition) => definition.primaryKey,
  );

  if (primaryFields.length !== 1) {
    throw new TypeError(
      `${resource.resourceName} requires exactly one primary-key field, found ${primaryFields.length}.`,
    );
  }

  return primaryFields[0];
}

/**
 * Builds a stable projection that aliases trusted SQLite columns to public JavaScript names.
 *
 * @param {import("../../resource/types.js").ResourceDefinition} resource Resource contract.
 * @returns {string} SELECT/RETURNING projection.
 */
export function buildSelectProjection(resource) {
  return Object.values(resource.fields)
    .map(
      (definition) =>
        `${quoteSqliteIdentifier(definition.columnName)} AS ${quoteSqliteIdentifier(definition.publicName)}`,
    )
    .join(",\n  ");
}

/**
 * Maps one aliased SQLite row to the stable public resource shape.
 *
 * @param {import("../../resource/types.js").ResourceDefinition} resource Resource contract.
 * @param {Readonly<Record<string, unknown>>} row SQLite row aliased to public names.
 * @returns {Readonly<import("../../resource/types.js").DevNote>} Public dev-note.
 */
export function mapSqliteRow(resource, row) {
  /** @type {Record<string, import("../../resource/types.js").ResourceCommandValue>} */
  const publicResource = {};

  for (const definition of Object.values(resource.fields)) {
    if (!Object.hasOwn(row, definition.publicName)) {
      throw new TypeError(`SQLite row is missing projected field: ${definition.publicName}`);
    }

    const rawValue = row[definition.publicName];

    if (rawValue === null && Object.hasOwn(definition, "outputFallback")) {
      publicResource[definition.publicName] = definition.outputFallback ?? null;
      continue;
    }

    if (
      rawValue !== null &&
      typeof rawValue !== "string" &&
      typeof rawValue !== "number" &&
      typeof rawValue !== "boolean"
    ) {
      throw new TypeError(
        `SQLite row field ${definition.publicName} has unsupported value type: ${typeof rawValue}`,
      );
    }

    publicResource[definition.publicName] = rawValue;
  }

  return /** @type {Readonly<import("../../resource/types.js").DevNote>} */ (
    Object.freeze(publicResource)
  );
}

/**
 * @param {import("../../resource/types.js").ResourceDefinition} resource Resource contract.
 * @param {readonly Readonly<Record<string, unknown>>[]} rows SQLite rows.
 * @returns {readonly Readonly<import("../../resource/types.js").DevNote>[]} Public notes.
 */
export function mapSqliteRows(resource, rows) {
  return Object.freeze(rows.map((row) => mapSqliteRow(resource, row)));
}
