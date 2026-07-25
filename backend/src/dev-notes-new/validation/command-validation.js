/**
 * Generic resource command validation.
 *
 * This layer knows resource contracts and operation policies. It does not know Express, service
 * result semantics, repositories, or SQLite.
 */

import {
  createInvalidCommandResult,
  createValidationProblem,
  findMissingRequiredFields,
  findUnexpectedFields,
  hasOwnField,
  isPlainObject,
  normalizeInputFieldValue,
  normalizeResourceFieldValue,
  readObjectOrEmpty,
  readRequiredResourceId,
} from "./field-validation.js";

/**
 * @param {import("../resource/types.js").ResourceCommand} command Normalized command.
 * @returns {import("../resource/types.js").ResourceCommandValidResult} Successful result.
 */
export function createValidCommandResult(command) {
  const frozenCommand = Object.freeze({
    operation: command.operation,
    id: command.id,
    values: Object.freeze({ ...command.values }),
    providedFields: Object.freeze([...command.providedFields]),
  });

  return Object.freeze({ ok: true, value: frozenCommand });
}

/**
 * @param {import("../resource/types.js").ResourceDefinition} resource Resource contract.
 * @param {string} fieldKey Internal contract field key.
 * @returns {import("../resource/types.js").ResourceFieldDefinition} Field definition.
 */
function readResourceFieldDefinition(resource, fieldKey) {
  const definition = resource.fields[fieldKey];

  if (!definition) {
    throw new TypeError(
      `Operation policy references unknown ${resource.resourceName} field key: ${fieldKey}`,
    );
  }

  return definition;
}

/**
 * @param {import("../resource/types.js").ResourceDefinition} resource Resource contract.
 * @param {import("../resource/types.js").ResourceOperationPolicy} operation Operation policy.
 * @returns {readonly import("../resource/types.js").ResourceFieldDefinition[]} Accepted definitions.
 */
function readAcceptedResourceDefinitions(resource, operation) {
  const acceptedKeys = operation.acceptedFields ?? [];
  const writableKeys = new Set(operation.writableFields ?? []);

  return Object.freeze(
    acceptedKeys.map((fieldKey) => {
      const definition = readResourceFieldDefinition(resource, fieldKey);

      if (!writableKeys.has(fieldKey) || !definition.clientWritable) {
        throw new TypeError(
          `Operation ${operation.operation} accepts non-writable resource field key: ${fieldKey}`,
        );
      }

      return definition;
    }),
  );
}

/**
 * @param {import("../resource/types.js").ResourceDefinition} resource Resource contract.
 * @param {readonly string[]} fieldKeys Internal field keys.
 * @returns {readonly string[]} Public field names.
 */
function readPublicNames(resource, fieldKeys) {
  return Object.freeze(
    fieldKeys.map((fieldKey) => readResourceFieldDefinition(resource, fieldKey).publicName),
  );
}

/**
 * Reads an operation id when required.
 *
 * @param {import("../resource/types.js").ResourceOperationPolicy} operation Operation policy.
 * @param {import("../resource/types.js").RawResourceCommandInput} rawInput Raw command input.
 * @returns {{ok: true; value: number | null} | {ok: false; problems: readonly import("../resource/types.js").ResourceValidationProblem[]}} Result.
 */
export function readCommandId(operation, rawInput) {
  if (!operation.requiresId) {
    return Object.freeze({ ok: true, value: null });
  }

  return readRequiredResourceId(rawInput.id);
}

/**
 * Reads and validates resource values from a request body.
 *
 * @param {object} input Function input.
 * @param {import("../resource/types.js").ResourceDefinition} input.resource Resource contract.
 * @param {import("../resource/types.js").ResourceOperationPolicy} input.operation Operation policy.
 * @param {Readonly<Record<string, unknown>>} input.body Raw body object.
 * @returns {{ok: true; values: Readonly<Record<string, import("../resource/types.js").ResourceCommandValue>>; providedFields: readonly string[]} | {ok: false; problems: readonly import("../resource/types.js").ResourceValidationProblem[]}} Result.
 */
export function readCommandBodyValues({ resource, operation, body }) {
  const definitions = operation.acceptsBody
    ? readAcceptedResourceDefinitions(resource, operation)
    : Object.freeze([]);
  const acceptedPublicNames = Object.freeze(definitions.map((definition) => definition.publicName));
  const requiredPublicNames = operation.acceptsBody
    ? readPublicNames(resource, operation.requiredFields ?? [])
    : Object.freeze([]);

  /** @type {import("../resource/types.js").ResourceValidationProblem[]} */
  const problems = [
    ...findUnexpectedFields(body, acceptedPublicNames, "body"),
    ...findMissingRequiredFields(body, requiredPublicNames, "body"),
  ];
  /** @type {Record<string, import("../resource/types.js").ResourceCommandValue>} */
  const values = {};
  /** @type {string[]} */
  const providedFields = [];

  for (const definition of definitions) {
    if (!hasOwnField(body, definition.publicName)) {
      continue;
    }

    const result = normalizeResourceFieldValue(definition, body[definition.publicName]);

    if (!result.ok) {
      problems.push(...result.problems);
      continue;
    }

    values[definition.publicName] = result.value;
    providedFields.push(definition.publicName);
  }

  if (problems.length > 0) {
    return Object.freeze({ ok: false, problems: Object.freeze(problems) });
  }

  return Object.freeze({
    ok: true,
    values: Object.freeze(values),
    providedFields: Object.freeze(providedFields),
  });
}

/**
 * Reads and validates operation-only values from a query object.
 *
 * @param {object} input Function input.
 * @param {import("../resource/types.js").ResourceOperationPolicy} input.operation Operation policy.
 * @param {Readonly<Record<string, unknown>>} input.query Raw query object.
 * @returns {{ok: true; values: Readonly<Record<string, import("../resource/types.js").ResourceCommandValue>>; providedFields: readonly string[]} | {ok: false; problems: readonly import("../resource/types.js").ResourceValidationProblem[]}} Result.
 */
export function readCommandQueryValues({ operation, query }) {
  const inputFields = operation.acceptsQuery ? (operation.inputFields ?? {}) : {};
  const definitions = Object.freeze(Object.values(inputFields));
  const acceptedPublicNames = Object.freeze(definitions.map((definition) => definition.publicName));
  const requiredPublicNames = Object.freeze(
    definitions.filter((definition) => definition.required).map((definition) => definition.publicName),
  );

  /** @type {import("../resource/types.js").ResourceValidationProblem[]} */
  const problems = [
    ...findUnexpectedFields(query, acceptedPublicNames, "query"),
    ...findMissingRequiredFields(query, requiredPublicNames, "query"),
  ];
  /** @type {Record<string, import("../resource/types.js").ResourceCommandValue>} */
  const values = {};
  /** @type {string[]} */
  const providedFields = [];

  for (const definition of definitions) {
    if (!hasOwnField(query, definition.publicName)) {
      continue;
    }

    const result = normalizeInputFieldValue(definition, query[definition.publicName]);

    if (!result.ok) {
      problems.push(...result.problems);
      continue;
    }

    values[definition.publicName] = result.value;
    providedFields.push(definition.publicName);
  }

  if (problems.length > 0) {
    return Object.freeze({ ok: false, problems: Object.freeze(problems) });
  }

  return Object.freeze({
    ok: true,
    values: Object.freeze(values),
    providedFields: Object.freeze(providedFields),
  });
}

/**
 * @param {import("../resource/types.js").ResourceOperationPolicy} operation Operation policy.
 * @param {readonly string[]} providedFields Accepted public names provided by the caller.
 * @returns {readonly import("../resource/types.js").ResourceValidationProblem[]} Problems.
 */
export function validateAtLeastOneField(operation, providedFields) {
  if (!operation.requireAtLeastOneField || providedFields.length > 0) {
    return Object.freeze([]);
  }

  const location = operation.acceptsBody ? "body" : operation.acceptsQuery ? "query" : "input";

  return Object.freeze([
    createValidationProblem(location, "at-least-one-field-required", {
      expected: "at least one accepted field",
      actual: 0,
    }),
  ]);
}

/**
 * @param {object} input Function input.
 * @param {import("../resource/types.js").ResourceOperationPolicy} input.operation Operation policy.
 * @param {number | null} input.id Normalized id.
 * @param {Readonly<Record<string, import("../resource/types.js").ResourceCommandValue>>} input.bodyValues Body values.
 * @param {Readonly<Record<string, import("../resource/types.js").ResourceCommandValue>>} input.queryValues Query values.
 * @param {readonly string[]} input.bodyFields Provided body fields.
 * @param {readonly string[]} input.queryFields Provided query fields.
 * @returns {import("../resource/types.js").ResourceCommand} Normalized command.
 */
export function buildResourceCommand({
  operation,
  id,
  bodyValues,
  queryValues,
  bodyFields,
  queryFields,
}) {
  const duplicateField = bodyFields.find((field) => queryFields.includes(field));

  if (duplicateField) {
    throw new TypeError(`Body and query normalize to the same command field: ${duplicateField}`);
  }

  return Object.freeze({
    operation: operation.operation,
    id,
    values: Object.freeze({ ...bodyValues, ...queryValues }),
    providedFields: Object.freeze([...bodyFields, ...queryFields]),
  });
}

/**
 * Main generic command-validation entrypoint.
 *
 * @param {object} input Validator input.
 * @param {import("../resource/types.js").ResourceDefinition} input.resource Resource contract.
 * @param {import("../resource/types.js").ResourceOperationPolicy} input.operation Operation policy.
 * @param {import("../resource/types.js").RawResourceCommandInput} input.rawInput Raw input.
 * @returns {import("../resource/types.js").ResourceCommandValidationResult} Validation result.
 */
export function readResourceCommand({ resource, operation, rawInput }) {
  const body = readObjectOrEmpty(rawInput.body);
  const query = readObjectOrEmpty(rawInput.query);

  /** @type {import("../resource/types.js").ResourceValidationProblem[]} */
  const problems = [];

  if (rawInput.body !== undefined && !isPlainObject(rawInput.body)) {
    problems.push(
      createValidationProblem("body", "invalid-type", {
        expected: "plain object",
        actual: rawInput.body === null ? "null" : typeof rawInput.body,
      }),
    );
  }

  if (rawInput.query !== undefined && !isPlainObject(rawInput.query)) {
    problems.push(
      createValidationProblem("query", "invalid-type", {
        expected: "plain object",
        actual: rawInput.query === null ? "null" : typeof rawInput.query,
      }),
    );
  }

  const idResult = readCommandId(operation, rawInput);
  const bodyResult = readCommandBodyValues({ resource, operation, body });
  const queryResult = readCommandQueryValues({ operation, query });

  if (!idResult.ok) {
    problems.push(...idResult.problems);
  }

  if (!bodyResult.ok) {
    problems.push(...bodyResult.problems);
  }

  if (!queryResult.ok) {
    problems.push(...queryResult.problems);
  }

  const providedFields = [
    ...(bodyResult.ok ? bodyResult.providedFields : []),
    ...(queryResult.ok ? queryResult.providedFields : []),
  ];
  problems.push(...validateAtLeastOneField(operation, providedFields));

  if (problems.length > 0 || !idResult.ok || !bodyResult.ok || !queryResult.ok) {
    return createInvalidCommandResult(
      `Invalid ${resource.resourceName} ${operation.operation} request.`,
      problems,
    );
  }

  const command = buildResourceCommand({
    operation,
    id: idResult.value,
    bodyValues: bodyResult.values,
    queryValues: queryResult.values,
    bodyFields: bodyResult.providedFields,
    queryFields: queryResult.providedFields,
  });

  return createValidCommandResult(command);
}
