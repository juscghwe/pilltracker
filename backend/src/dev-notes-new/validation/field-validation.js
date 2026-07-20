/**
 * Low-level field validation helpers for resource command normalization.
 *
 * This file should stay generic. It should not know about dev-notes specifically, routes,
 * repositories, SQLite or HTTP status codes.
 */

/**
 * @typedef {{
 *       ok: true;
 *       value: import("../resource/types.js").ResourceCommandValue;
 *     }
 *   | {
 *       ok: false;
 *       problems: readonly import("../resource/types.js").ResourceValidationProblem[];
 *     }} FieldNormalizationResult
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
  return Object.freeze({
    ok: false,
    status: "invalid-request",
    message,
    details: Object.freeze({
      problems: Object.freeze([...problems]),
    }),
  });
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
  if (isPlainObject(value)) {
    return Object.freeze(value);
  }
  return Object.freeze({});
}

/**
 * Checks whether an object owns a field directly.
 *
 * @param {Readonly<Record<string, unknown>>} input Input object.
 * @param {string} field Field name.
 * @returns {boolean} Whether the input owns the field.
 */
export function hasOwnField(input, field) {
  return Object.hasOwn(input, field);
}

/**
 * Creates a normalized field failure result.
 *
 * @param {string} field Field name.
 * @param {string} reason Stable validation problem reason.
 * @param {object} [options] Optional validation problem details.
 * @param {unknown} [options.expected] Expected value/type/policy.
 * @param {unknown} [options.actual] Actual value/type/policy.
 * @returns {FieldNormalizationResult} Field validation failure result.
 */
function invalidFieldValue(field, reason, options = {}) {
  return Object.freeze({
    ok: false,
    problems: Object.freeze([createValidationProblem(field, reason, options)]),
  });
}

/**
 * Creates a normalized field success result.
 *
 * @param {import("../resource/types.js").ResourceCommandValue} value Normalized value.
 * @returns {FieldNormalizationResult} Field validation success result.
 */
function validFieldValue(value) {
  return Object.freeze({
    ok: true,
    value,
  });
}

/**
 * Handles explicit null input for a field.
 *
 * @param {string} fieldName Public field name.
 * @param {import("../resource/types.js").ResourceFieldDefinition} fieldDefinition Field contract.
 * @param {string} expected Expected type description.
 * @returns {FieldNormalizationResult} Normalized null result.
 */
function normalizeNullFieldValue(fieldName, fieldDefinition, expected) {
  if (fieldDefinition.nullable) {
    return validFieldValue(null);
  }

  return invalidFieldValue(fieldName, "null-not-allowed", {
    expected,
    actual: null,
  });
}

/**
 * Normalizes a string resource field value.
 *
 * @param {string} fieldName Public field name.
 * @param {import("../resource/types.js").ResourceFieldDefinition} fieldDefinition Field contract.
 * @param {unknown} rawValue Raw input value.
 * @returns {FieldNormalizationResult} Normalized string value or validation problems.
 */
function normalizeStringResourceFieldValue(fieldName, fieldDefinition, rawValue) {
  if (rawValue === null) {
    return normalizeNullFieldValue(fieldName, fieldDefinition, "string");
  }

  if (typeof rawValue !== "string") {
    return invalidFieldValue(fieldName, "invalid-type", {
      expected: "string",
      actual: typeof rawValue,
    });
  }

  const trimmedValue = rawValue.trim();

  if (trimmedValue !== "") {
    return validFieldValue(trimmedValue);
  }

  if (!fieldDefinition.allowEmpty) {
    return invalidFieldValue(fieldName, "empty-not-allowed", {
      expected: "non-empty string",
      actual: rawValue,
    });
  }

  if (fieldDefinition.emptyAsNull) {
    return validFieldValue(null);
  }

  return validFieldValue("");
}

/**
 * Normalizes an integer resource field value.
 *
 * @param {string} fieldName Public field name.
 * @param {import("../resource/types.js").ResourceFieldDefinition} fieldDefinition Field contract.
 * @param {unknown} rawValue Raw input value.
 * @returns {FieldNormalizationResult} Normalized integer value or validation problems.
 */
function normalizeIntegerResourceFieldValue(fieldName, fieldDefinition, rawValue) {
  if (rawValue === null) {
    return normalizeNullFieldValue(fieldName, fieldDefinition, "integer");
  }

  if (typeof rawValue === "number") {
    return normalizeIntegerNumber(fieldName, rawValue);
  }

  if (typeof rawValue === "string") {
    return normalizeIntegerString(fieldName, rawValue);
  }

  return invalidFieldValue(fieldName, "invalid-type", {
    expected: "integer as number or string",
    actual: typeof rawValue,
  });
}

/**
 * Normalizes a numeric integer value.
 *
 * @param {string} fieldName Public field name.
 * @param {number} rawValue Raw number value.
 * @returns {FieldNormalizationResult} Normalized integer value or validation problems.
 */
function normalizeIntegerNumber(fieldName, rawValue) {
  if (!Number.isInteger(rawValue)) {
    return invalidFieldValue(fieldName, "not-integer", {
      expected: "integer",
      actual: rawValue,
    });
  }

  return validFieldValue(rawValue);
}

/**
 * Normalizes a string integer value.
 *
 * @param {string} fieldName Public field name.
 * @param {string} rawValue Raw string value.
 * @returns {FieldNormalizationResult} Normalized integer value or validation problems.
 */
function normalizeIntegerString(fieldName, rawValue) {
  const trimmedValue = rawValue.trim();

  if (trimmedValue === "") {
    return invalidFieldValue(fieldName, "empty-not-allowed", {
      expected: "integer",
      actual: rawValue,
    });
  }

  const numericValue = Number(trimmedValue);

  if (!Number.isInteger(numericValue)) {
    return invalidFieldValue(fieldName, "not-integer", {
      expected: "integer",
      actual: rawValue,
    });
  }

  return validFieldValue(numericValue);
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
  /**
   * @param {string} reason
   * @param {string} [actual]
   * @returns {readonly import("../resource/types.js").ResourceValidationProblem[]}
   */
  function invalidId(reason, actual) {
    return Object.freeze([
      createValidationProblem("id", reason, {
        expected: "positive integer id",
        actual: actual ? actual : String(rawId),
      }),
    ]);
  }

  if (rawId === undefined) {
    return invalidFieldValue("id", "missing", {
      expected: "positive integer id",
      actual: "undefined",
    });
  }

  if (rawId === null) {
    return Object.freeze({
      ok: false,
      problems: invalidId("null"),
    });
  }

  if (typeof rawId === "string") {
    const trimmedId = rawId.trim();

    if (trimmedId === "") {
      return Object.freeze({
        ok: false,
        problems: invalidId("empty"),
      });
    }

    const numericId = Number(trimmedId);

    if (!Number.isInteger(numericId)) {
      return Object.freeze({
        ok: false,
        problems: invalidId("non-integer"),
      });
    }

    if (numericId <= 0) {
      return Object.freeze({
        ok: false,
        problems: invalidId("not-positive"),
      });
    }

    return Object.freeze({
      ok: true,
      value: numericId,
    });
  }

  if (typeof rawId === "number") {
    if (!Number.isInteger(rawId)) {
      return Object.freeze({
        ok: false,
        problems: invalidId("non-integer"),
      });
    }

    if (rawId <= 0) {
      return Object.freeze({
        ok: false,
        problems: invalidId("not-positive"),
      });
    }

    return Object.freeze({
      ok: true,
      value: rawId,
    });
  }

  return Object.freeze({
    ok: false,
    problems: invalidId("invalid-type", typeof rawId),
  });
}

/**
 * Normalizes a raw value according to one resource field definition.
 *
 * This is for actual resource fields such as `name`, `comment` or `lastConfirmedInteraction`.
 *
 * @param {string} fieldName Public field name.
 * @param {import("../resource/types.js").ResourceFieldDefinition} fieldDefinition Field contract.
 * @param {unknown} rawValue Raw input value.
 * @returns {FieldNormalizationResult} Normalized field value or validation problems.
 */
export function normalizeResourceFieldValue(fieldName, fieldDefinition, rawValue) {
  if (rawValue === undefined) {
    return invalidFieldValue(fieldName, "missing", {
      expected: fieldDefinition.type,
      actual: rawValue,
    });
  }

  switch (fieldDefinition.type) {
    case "string":
      return normalizeStringResourceFieldValue(fieldName, fieldDefinition, rawValue);

    case "integer":
      return normalizeIntegerResourceFieldValue(fieldName, fieldDefinition, rawValue);

    default:
      return invalidFieldValue(`fieldDefinition.type of ${fieldName}`, "unsupported-field-type", {
        expected: "string | integer",
        actual: fieldDefinition.type,
      });
  }
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
