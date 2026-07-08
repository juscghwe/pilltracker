/**
 * Resource command validation.
 *
 * This file turns raw route/service input into normalized ResourceCommand objects.
 *
 * It should know about generic resource contracts and operation policies, but it should not know
 * about Express, SQLite, repositories or concrete dev-notes SQL.
 */

import {
  createInvalidCommandResult,
  createValidationProblem,
  findMissingRequiredFields,
  findUnexpectedFields,
  hasOwnField,
  normalizeInputFieldValue,
  normalizeResourceFieldValue,
  readObjectOrEmpty,
  readRequiredResourceId,
} from "./field-validation.js";

/**
 * Creates a successful resource command validation result.
 *
 * @param {import("../resource/types.js").ResourceCommand} command Normalized command.
 * @returns {import("../resource/types.js").ResourceCommandValidResult} Successful command result.
 */
export function createValidCommandResult(command) {
  void command;

  // Return { ok: true, value: frozen command }.
  throw new Error("Not implemented yet.");
}

/**
 * Reads and validates an operation id if the operation requires one.
 *
 * @param {import("../resource/types.js").ResourceOperationPolicy} operation Operation policy.
 * @param {import("../resource/types.js").RawResourceCommandInput} rawInput Raw command input.
 * @returns {{
 *       ok: true;
 *       value: number | null;
 *     }
 *   | {
 *       ok: false;
 *       problems: readonly import("../resource/types.js").ResourceValidationProblem[];
 *     }}
 *   Normalized id result.
 */
export function readCommandId(operation, rawInput) {
  void operation;
  void rawInput;
  void readRequiredResourceId;

  // If operation.requiresId is false, return ok true with value null.
  // If operation.requiresId is true, validate rawInput.id using readRequiredResourceId().
  throw new Error("Not implemented yet.");
}

/**
 * Reads and validates resource fields from a request body.
 *
 * This handles fields that are part of the resource contract, such as `name` and `comment`.
 *
 * @param {object} input Function input.
 * @param {import("../resource/types.js").ResourceDefinition} input.resource Resource contract.
 * @param {import("../resource/types.js").ResourceOperationPolicy} input.operation Operation policy.
 * @param {Readonly<Record<string, unknown>>} input.body Raw body object.
 * @returns {{
 *       ok: true;
 *       values: Readonly<Record<string, import("../resource/types.js").ResourceCommandValue>>;
 *       providedFields: readonly string[];
 *     }
 *   | {
 *       ok: false;
 *       problems: readonly import("../resource/types.js").ResourceValidationProblem[];
 *     }}
 *   Normalized body values result.
 */
export function readCommandBodyValues({ resource, operation, body }) {
  void resource;
  void operation;
  void body;
  void findUnexpectedFields;
  void findMissingRequiredFields;
  void normalizeResourceFieldValue;
  void hasOwnField;

  // If operation.acceptsBody is false:
  //   body should ideally be empty.
  //   if body has fields, return unexpected-field problems.
  //
  // If operation.acceptsBody is true:
  //   check unexpected fields against operation.acceptedFields.
  //   check required fields against operation.requiredFields.
  //   for every accepted field that is actually present:
  //     read the field definition from resource.fields.
  //     normalize the raw value with normalizeResourceFieldValue().
  //
  // Return normalized values and provided field names.
  throw new Error("Not implemented yet.");
}

/**
 * Reads and validates operation-only input fields from a query object.
 *
 * This handles fields that are not part of the resource itself, such as search query `text`.
 *
 * @param {object} input Function input.
 * @param {import("../resource/types.js").ResourceOperationPolicy} input.operation Operation policy.
 * @param {Readonly<Record<string, unknown>>} input.query Raw query object.
 * @returns {{
 *       ok: true;
 *       values: Readonly<Record<string, import("../resource/types.js").ResourceCommandValue>>;
 *       providedFields: readonly string[];
 *     }
 *   | {
 *       ok: false;
 *       problems: readonly import("../resource/types.js").ResourceValidationProblem[];
 *     }}
 *   Normalized query values result.
 */
export function readCommandQueryValues({ operation, query }) {
  void operation;
  void query;
  void findUnexpectedFields;
  void findMissingRequiredFields;
  void normalizeInputFieldValue;
  void hasOwnField;

  // If operation.acceptsQuery is false:
  //   query should ideally be empty.
  //   if query has fields, return unexpected-field problems.
  //
  // If operation.acceptsQuery is true:
  //   accepted fields come from Object.keys(operation.inputFields ?? {}).
  //   required fields come from inputFields where required === true.
  //   normalize each provided query value with normalizeInputFieldValue().
  //
  // Return normalized query values and provided query field names.
  throw new Error("Not implemented yet.");
}

/**
 * Validates that an operation has at least one accepted field when required.
 *
 * This is mainly for PATCH/update.
 *
 * @param {import("../resource/types.js").ResourceOperationPolicy} operation Operation policy.
 * @param {readonly string[]} providedFields Accepted fields provided by the caller.
 * @returns {readonly import("../resource/types.js").ResourceValidationProblem[]} Validation
 *   problems.
 */
export function validateAtLeastOneField(operation, providedFields) {
  void operation;
  void providedFields;
  void createValidationProblem;

  // If operation.requireAtLeastOneField is true and providedFields.length === 0:
  //   return one problem for field "body" or "query".
  // Otherwise return an empty frozen array.
  throw new Error("Not implemented yet.");
}

/**
 * Combines normalized command parts into a ResourceCommand.
 *
 * @param {object} input Function input.
 * @param {import("../resource/types.js").ResourceOperationPolicy} input.operation Operation policy.
 * @param {number | null} input.id Normalized id.
 * @param {Readonly<Record<string, import("../resource/types.js").ResourceCommandValue>>} input.bodyValues
 *   Normalized body values.
 * @param {Readonly<Record<string, import("../resource/types.js").ResourceCommandValue>>} input.queryValues
 *   Normalized query values.
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
  void operation;
  void id;
  void bodyValues;
  void queryValues;
  void bodyFields;
  void queryFields;

  // Merge bodyValues and queryValues into one values object.
  // Merge bodyFields and queryFields into one providedFields array.
  // Return a frozen ResourceCommand:
  // {
  //   operation: operation.operation,
  //   id,
  //   values,
  //   providedFields
  // }
  throw new Error("Not implemented yet.");
}

/**
 * Reads and validates a resource command from raw input.
 *
 * This is the main entrypoint for validation wrappers.
 *
 * @param {object} input Validator input.
 * @param {import("../resource/types.js").ResourceDefinition} input.resource Resource contract.
 * @param {import("../resource/types.js").ResourceOperationPolicy} input.operation Operation policy.
 * @param {import("../resource/types.js").RawResourceCommandInput} input.rawInput Raw command input.
 * @returns {import("../resource/types.js").ResourceCommandValidationResult} Validation result.
 */
export function readResourceCommand({ resource, operation, rawInput }) {
  void resource;
  void operation;
  void rawInput;
  void readObjectOrEmpty;
  void createInvalidCommandResult;
  void createValidCommandResult;
  void readCommandId;
  void readCommandBodyValues;
  void readCommandQueryValues;
  void validateAtLeastOneField;
  void buildResourceCommand;

  // High-level algorithm:
  //
  // 1. Normalize raw body/query:
  //      const body = readObjectOrEmpty(rawInput.body)
  //      const query = readObjectOrEmpty(rawInput.query)
  //
  // 2. Read id:
  //      const idResult = readCommandId(operation, rawInput)
  //
  // 3. Read body values:
  //      const bodyResult = readCommandBodyValues({ resource, operation, body })
  //
  // 4. Read query values:
  //      const queryResult = readCommandQueryValues({ operation, query })
  //
  // 5. Combine all problems.
  //
  // 6. Validate requireAtLeastOneField against accepted provided fields.
  //
  // 7. If problems exist:
  //      return createInvalidCommandResult(...)
  //
  // 8. Otherwise:
  //      build ResourceCommand
  //      return createValidCommandResult(command)
  throw new Error("Not implemented yet.");
}
