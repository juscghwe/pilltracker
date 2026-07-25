/**
 * Low-level field validation helpers for resource command normalization.
 *
 * This file is transport-, service-, repository-, and SQLite-agnostic. Validation errors use public
 * input names. Internal resource keys stay with the caller that looked up the field definition.
 */

/** @typedef {{ok: true; value: import("../resource/types.js").ResourceCommandValue}} FieldNormalizationSuccess */
/** @typedef {{ok: false; problems: readonly import("../resource/types.js").ResourceValidationProblem[]}} FieldNormalizationFailure */
/** @typedef {FieldNormalizationSuccess | FieldNormalizationFailure} FieldNormalizationResult */

/** @typedef {Pick<import("../resource/types.js").ResourceFieldDefinition, "publicName" | "type" | "nullable" | "allowEmpty" | "emptyAsNull"> | import("../resource/types.js").ResourceInputFieldDefinition} NormalizableFieldDefinition */

const integerStringPattern = /^-?\d+$/;

/**
 * Creates one structured validation problem.
 *
 * @param {string} field Public field name or structural location.
 * @param {string} reason Stable problem reason.
 * @param {object} [options] Optional problem details.
 * @param {unknown} [options.expected] Expected value/type/policy.
 * @param {unknown} [options.actual] Actual value/type/policy.
 * @returns {import("../resource/types.js").ResourceValidationProblem} Validation problem.
 */
export function createValidationProblem(field, reason, options = {}) {
  /** @type {import("../resource/types.js").ResourceValidationProblem} */
  const problem = { field, reason };

  if (Object.hasOwn(options, "expected")) {
    problem.expected = options.expected;
  }

  if (Object.hasOwn(options, "actual")) {
    problem.actual = options.actual;
  }

  return Object.freeze(problem);
}

/**
 * Creates a standardized invalid resource command result.
 *
 * @param {string} message Human-readable validation failure message.
 * @param {readonly import("../resource/types.js").ResourceValidationProblem[]} problems Problems.
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
 * @param {unknown} value Value to check.
 * @returns {value is Record<string, unknown>} Whether the value is a plain object.
 */
export function isPlainObject(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/**
 * Returns a detached, frozen object copy or an empty object for non-record input.
 *
 * Structural type errors are reported by command validation; this helper only makes later reads
 * safe.
 *
 * @param {unknown} value Raw value.
 * @returns {Readonly<Record<string, unknown>>} Safe object value.
 */
export function readObjectOrEmpty(value) {
  return Object.freeze(isPlainObject(value) ? { ...value } : {});
}

/**
 * @param {Readonly<Record<string, unknown>>} input Input object.
 * @param {string} field Public field name.
 * @returns {boolean} Whether the object owns the field.
 */
export function hasOwnField(input, field) {
  return Object.hasOwn(input, field);
}

/**
 * @param {string} field Public field name.
 * @param {string} reason Stable reason.
 * @param {object} [options] Optional problem details.
 * @param {unknown} [options.expected] Expected value/type/policy.
 * @param {unknown} [options.actual] Actual value/type/policy.
 * @returns {FieldNormalizationFailure} Failed normalization result.
 */
function invalidFieldValue(field, reason, options = {}) {
  return Object.freeze({
    ok: false,
    problems: Object.freeze([createValidationProblem(field, reason, options)]),
  });
}

/**
 * @param {import("../resource/types.js").ResourceCommandValue} value Normalized value.
 * @returns {FieldNormalizationSuccess} Successful normalization result.
 */
function validFieldValue(value) {
  return Object.freeze({ ok: true, value });
}

/**
 * @param {NormalizableFieldDefinition} definition Field definition.
 * @param {string} expected Expected type description.
 * @returns {FieldNormalizationResult} Normalized null result.
 */
function normalizeNullFieldValue(definition, expected) {
  if (definition.nullable) {
    return validFieldValue(null);
  }

  return invalidFieldValue(definition.publicName, "null-not-allowed", {
    expected,
    actual: null,
  });
}

/**
 * @param {NormalizableFieldDefinition} definition Field definition.
 * @param {unknown} rawValue Raw value.
 * @returns {FieldNormalizationResult} Normalized string result.
 */
function normalizeStringFieldValue(definition, rawValue) {
  if (rawValue === null) {
    return normalizeNullFieldValue(definition, "string");
  }

  if (typeof rawValue !== "string") {
    return invalidFieldValue(definition.publicName, "invalid-type", {
      expected: "string",
      actual: typeof rawValue,
    });
  }

  const value = rawValue.trim();

  if (value !== "") {
    return validFieldValue(value);
  }

  if (!definition.allowEmpty) {
    return invalidFieldValue(definition.publicName, "empty-not-allowed", {
      expected: "non-empty string",
      actual: rawValue,
    });
  }

  return validFieldValue(definition.emptyAsNull ? null : "");
}

/**
 * @param {NormalizableFieldDefinition} definition Field definition.
 * @param {unknown} rawValue Raw value.
 * @returns {FieldNormalizationResult} Normalized integer result.
 */
function normalizeIntegerFieldValue(definition, rawValue) {
  if (rawValue === null) {
    return normalizeNullFieldValue(definition, "integer");
  }

  if (typeof rawValue === "number") {
    if (!Number.isInteger(rawValue)) {
      return invalidFieldValue(definition.publicName, "not-integer", {
        expected: "integer",
        actual: rawValue,
      });
    }

    return validFieldValue(rawValue);
  }

  if (typeof rawValue !== "string") {
    return invalidFieldValue(definition.publicName, "invalid-type", {
      expected: "integer as number or decimal string",
      actual: typeof rawValue,
    });
  }

  const value = rawValue.trim();

  if (value === "") {
    return invalidFieldValue(definition.publicName, "empty-not-allowed", {
      expected: "integer",
      actual: rawValue,
    });
  }

  if (!integerStringPattern.test(value)) {
    return invalidFieldValue(definition.publicName, "not-integer", {
      expected: "integer",
      actual: rawValue,
    });
  }

  const numericValue = Number(value);

  if (!Number.isSafeInteger(numericValue)) {
    return invalidFieldValue(definition.publicName, "not-safe-integer", {
      expected: "safe integer",
      actual: rawValue,
    });
  }

  return validFieldValue(numericValue);
}

/**
 * Normalizes a raw value using a resource field definition.
 *
 * The definition already owns the public name. The caller retains the internal contract key used
 * to locate the definition.
 *
 * @param {import("../resource/types.js").ResourceFieldDefinition} fieldDefinition Field contract.
 * @param {unknown} rawValue Raw input value.
 * @returns {FieldNormalizationResult} Normalized value or validation problems.
 */
export function normalizeResourceFieldValue(fieldDefinition, rawValue) {
  if (rawValue === undefined) {
    return invalidFieldValue(fieldDefinition.publicName, "missing", {
      expected: fieldDefinition.type,
      actual: "undefined",
    });
  }

  switch (fieldDefinition.type) {
    case "string":
      return normalizeStringFieldValue(fieldDefinition, rawValue);
    case "integer":
      return normalizeIntegerFieldValue(fieldDefinition, rawValue);
    default:
      return invalidFieldValue(fieldDefinition.publicName, "unsupported-field-type", {
        expected: "string | integer",
        actual: fieldDefinition.type,
      });
  }
}

/**
 * Normalizes an operation-only input field such as search query `text`.
 *
 * @param {import("../resource/types.js").ResourceInputFieldDefinition} inputFieldDefinition Input
 *   field contract.
 * @param {unknown} rawValue Raw input value.
 * @returns {FieldNormalizationResult} Normalized value or validation problems.
 */
export function normalizeInputFieldValue(inputFieldDefinition, rawValue) {
  if (rawValue === undefined) {
    return invalidFieldValue(inputFieldDefinition.publicName, "missing", {
      expected: inputFieldDefinition.type,
      actual: "undefined",
    });
  }

  switch (inputFieldDefinition.type) {
    case "string":
      return normalizeStringFieldValue(inputFieldDefinition, rawValue);
    case "integer":
      return normalizeIntegerFieldValue(inputFieldDefinition, rawValue);
    default:
      return invalidFieldValue(inputFieldDefinition.publicName, "unsupported-field-type", {
        expected: "string | integer",
        actual: inputFieldDefinition.type,
      });
  }
}

/**
 * Normalizes and validates a required positive resource id.
 *
 * @param {unknown} rawId Raw id value.
 * @returns {{ok: true; value: number} | {ok: false; problems: readonly import("../resource/types.js").ResourceValidationProblem[]}} Result.
 */
export function readRequiredResourceId(rawId) {
  /** @type {import("../resource/types.js").ResourceInputFieldDefinition} */
  const idDefinition = {
    publicName: "id",
    type: "integer",
    required: true,
    nullable: false,
    allowEmpty: false,
  };

  const result = normalizeInputFieldValue(idDefinition, rawId);

  if (!result.ok) {
    return result;
  }

  if (typeof result.value !== "number") {
    return invalidFieldValue("id", "invalid-normalized-type", {
      expected: "number",
      actual: typeof result.value,
    });
  }

  if (result.value < 1) {
    return invalidFieldValue("id", "not-positive", {
      expected: "positive integer id",
      actual: result.value,
    });
  }

  return Object.freeze({ ok: true, value: result.value });
}

/**
 * Finds fields that are not accepted at the current input location.
 *
 * @param {Readonly<Record<string, unknown>>} input Raw body/query object.
 * @param {readonly string[]} acceptedFields Accepted public names.
 * @param {string} location Usually `body` or `query`.
 * @returns {readonly import("../resource/types.js").ResourceValidationProblem[]} Problems.
 */
export function findUnexpectedFields(input, acceptedFields, location) {
  const accepted = new Set(acceptedFields);
  return Object.freeze(
    Object.keys(input)
      .filter((field) => !accepted.has(field))
      .map((field) =>
        createValidationProblem(field, "unexpected-field", {
          expected: `${location} field in accepted set`,
          actual: field,
        }),
      ),
  );
}

/**
 * Finds required public fields missing from an input object.
 *
 * @param {Readonly<Record<string, unknown>>} input Raw body/query object.
 * @param {readonly string[]} requiredFields Required public names.
 * @param {string} location Usually `body` or `query`.
 * @returns {readonly import("../resource/types.js").ResourceValidationProblem[]} Problems.
 */
export function findMissingRequiredFields(input, requiredFields, location) {
  return Object.freeze(
    requiredFields
      .filter((field) => !hasOwnField(input, field))
      .map((field) =>
        createValidationProblem(field, "missing", {
          expected: `required ${location} field`,
          actual: "missing",
        }),
      ),
  );
}
