/**
 * Low-level field validation helpers for resource command normalization.
 *
 * This file should stay generic. It should not know about dev-notes specifically, routes,
 * repositories, SQLite or HTTP status codes.
 */

/**
 * Creates one structured validation problem.
 *
 * @param {string} field Field name or `"body"`, `"query"` or `"id"` for structural issues.
 * @param {string} reason Stable validation problem reason.
 * @param {object} [options] Optional problem details.
 * @param {unknown} [options.expected] Expected value/type/policy.
 * @param {unknown} [options.actual] Actual value/type/policy.
 * @returns {import("../resource/types.js").ResourceValidationProblem} Validation problem.
 */
export function createValidationProblem(field, reason, options = {}) {
  /** @type {import("../resource/types.js").ResourceValidationProblem} */
  const validationProblem = {
    field,
    reason,
  };

  if (Object.hasOwn(options, "expected")) {
    validationProblem.expected = options.expected;
  }

  if (Object.hasOwn(options, "actual")) {
    validationProblem.actual = options.actual;
  }

  return Object.freeze(validationProblem);
}

/**
 * Creates a standardized invalid resource command result.
 *
 * @param {string} message Human-readable validation failure message.
 * @param {readonly import("../resource/types.js").ResourceValidationProblem[]} problems Validation
 *   problems.
 * @returns {import("../resource/types.js").ResourceCommandInvalidResult} Invalid command result.
 */
export function createInvalidCommandResult(message, problems) {
  const invalidCommandResult = Object.freeze({
    ok: false,
    status: "invalid-request",
    message: message,
    details: Object.freeze({ problems: Object.freeze({ ...problems }) }),
  });

  return invalidCommandResult;
}

/**
 * Checks whether a value is a plain object-like record.
 *
 * Arrays, null, strings, numbers and booleans should return false.
 *
 * @param {unknown} value Value to check.
 * @returns {value is Record<string, unknown>} Whether the value is a plain object-like record.
 */
export function isPlainObject(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}

/**
 * Reads a raw object value or returns an empty object.
 *
 * This is useful at command boundaries where missing body/query should not crash validation.
 *
 * @param {unknown} value Raw value.
 * @returns {Readonly<Record<string, unknown>>} Object value or empty object.
 */
export function readObjectOrEmpty(value) {
  void value;

  // If value is a plain object, return it.
  // Otherwise return Object.freeze({}).
  throw new Error("Not implemented yet.");
}

/**
 * Checks whether an object owns a field directly.
 *
 * @param {Readonly<Record<string, unknown>>} input Input object.
 * @param {string} field Field name.
 * @returns {boolean} Whether the input owns the field.
 */
export function hasOwnField(input, field) {
  void input;
  void field;

  // Use Object.hasOwn(input, field).
  throw new Error("Not implemented yet.");
}

/**
 * Normalizes and validates a resource id.
 *
 * Accepted raw values:
 *
 * - Positive integer number
 * - String containing a positive integer
 *
 * Rejected raw values:
 *
 * - Missing/null/undefined
 * - Empty string
 * - Non-integer number
 * - Zero or negative number
 * - Object/array/boolean
 *
 * @param {unknown} rawId Raw id value.
 * @returns {{
 *       ok: true;
 *       value: number;
 *     }
 *   | {
 *       ok: false;
 *       problems: readonly import("../resource/types.js").ResourceValidationProblem[];
 *     }}
 *   Normalized id result or validation problems.
 */
export function readRequiredResourceId(rawId) {
  void rawId;

  // Return ok true with normalized numeric id.
  // On failure, return ok false with one or more validation problems for field "id".
  throw new Error("Not implemented yet.");
}

/**
 * Normalizes a raw value according to one resource field definition.
 *
 * This is for actual resource fields such as `name`, `comment` or `lastConfirmedInteraction`.
 *
 * @param {string} fieldName Public field name.
 * @param {import("../resource/types.js").ResourceFieldDefinition} fieldDefinition Field contract.
 * @param {unknown} rawValue Raw input value.
 * @returns {{
 *       ok: true;
 *       value: import("../resource/types.js").ResourceCommandValue;
 *     }
 *   | {
 *       ok: false;
 *       problems: readonly import("../resource/types.js").ResourceValidationProblem[];
 *     }}
 *   Normalized field value or validation problems.
 */
export function normalizeResourceFieldValue(fieldName, fieldDefinition, rawValue) {
  void fieldName;
  void fieldDefinition;
  void rawValue;

  // Validate the raw value based on fieldDefinition.type.
  // For string:
  //   require string unless nullable + null is allowed.
  //   trim strings.
  //   reject empty strings when allowEmpty === false.
  //   convert empty string to null when emptyAsNull === true.
  // For integer:
  //   accept integer number or integer-like string.
  //   reject invalid numbers.
  // Return normalized ResourceCommandValue.
  throw new Error("Not implemented yet.");
}

/**
 * Normalizes a raw value according to one operation-only input field definition.
 *
 * This is for inputs that are not resource fields, such as search query `text`.
 *
 * @param {string} fieldName Public input field name.
 * @param {import("../resource/types.js").ResourceInputFieldDefinition} inputFieldDefinition Input
 *   field contract.
 * @param {unknown} rawValue Raw input value.
 * @returns {{
 *       ok: true;
 *       value: import("../resource/types.js").ResourceCommandValue;
 *     }
 *   | {
 *       ok: false;
 *       problems: readonly import("../resource/types.js").ResourceValidationProblem[];
 *     }}
 *   Normalized input value or validation problems.
 */
export function normalizeInputFieldValue(fieldName, inputFieldDefinition, rawValue) {
  void fieldName;
  void inputFieldDefinition;
  void rawValue;

  // Same general idea as normalizeResourceFieldValue, but using ResourceInputFieldDefinition.
  // This is mainly for query/search inputs.
  throw new Error("Not implemented yet.");
}

/**
 * Finds fields that were provided but are not accepted for the current operation.
 *
 * @param {Readonly<Record<string, unknown>>} input Raw body/query object.
 * @param {readonly string[]} acceptedFields Fields accepted by the operation.
 * @param {string} location Human-readable location, usually `"body"` or `"query"`.
 * @returns {readonly import("../resource/types.js").ResourceValidationProblem[]} Validation
 *   problems for unexpected fields.
 */
export function findUnexpectedFields(input, acceptedFields, location) {
  void input;
  void acceptedFields;
  void location;

  // Compare Object.keys(input) against acceptedFields.
  // Return one problem per unexpected key.
  // Reason can be "unexpected-field".
  throw new Error("Not implemented yet.");
}

/**
 * Finds required fields that are missing from an input object.
 *
 * @param {Readonly<Record<string, unknown>>} input Raw body/query object.
 * @param {readonly string[]} requiredFields Required fields.
 * @param {string} location Human-readable location, usually `"body"` or `"query"`.
 * @returns {readonly import("../resource/types.js").ResourceValidationProblem[]} Validation
 *   problems for missing fields.
 */
export function findMissingRequiredFields(input, requiredFields, location) {
  void input;
  void requiredFields;
  void location;

  // Compare requiredFields against fields owned by input.
  // Return one problem per missing key.
  // Reason can be "missing".
  throw new Error("Not implemented yet.");
}
