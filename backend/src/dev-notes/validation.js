/**
 * Creates a structured invalid-request validation result.
 *
 * @param {string} message Human-readable validation failure message.
 * @param {import("./types.js").DevNotesValidationDetails} details Validation failure details.
 * @returns {import("./types.js").DevNotesInvalidRequestResult} Invalid request result.
 */
function invalidRequest(message, details) {
  return Object.freeze({
    ok: false,
    status: "invalid-request",
    message,
    details: Object.freeze(details),
  });
}

/**
 * Checks whether an input object owns a field.
 *
 * @param {Record<string, unknown>} input Input object.
 * @param {string} field Field name.
 * @returns {boolean} Whether the field exists directly on the input object.
 */
function hasOwnField(input, field) {
  return Object.hasOwn(input, field);
}

/**
 * Reads and validates a string field from an input object.
 *
 * This helper only handles generic string validation. Operation-specific rules belong in the
 * exported create/replace/update validators below.
 *
 * @param {Record<string, unknown>} input Input object.
 * @param {string} field Field name.
 * @param {object} options Validation options.
 * @param {string} options.label Human-readable field label.
 * @param {boolean} [options.required=false] Whether the field must be present. Default is `false`
 * @param {boolean} [options.allowEmpty=true] Whether the trimmed value may be empty. Default is
 *   `true`
 * @returns {{
 *       ok: true;
 *       present: false;
 *     }
 *   | {
 *       ok: true;
 *       present: true;
 *       value: string;
 *     }
 *   | import("./types.js").DevNotesInvalidRequestResult}
 *   Validation result.
 */
function readStringField(input, field, options) {
  const { label, required = false, allowEmpty = true } = options;

  if (!hasOwnField(input, field)) {
    if (!required) {
      return Object.freeze({
        ok: true,
        present: false,
      });
    }

    return invalidRequest(`Missing ${label}.`, {
      field,
      reason: "missing",
    });
  }

  const rawValue = input[field];

  if (typeof rawValue !== "string") {
    return invalidRequest(`${label} must be a string.`, {
      field,
      reason: "wrong-type",
      actualType: typeof rawValue,
    });
  }

  const value = rawValue.trim();

  if (!allowEmpty && value === "") {
    return invalidRequest(`${label} must not be empty.`, {
      field,
      reason: "empty",
    });
  }

  return Object.freeze({
    ok: true,
    present: true,
    value,
  });
}

/**
 * Reads and validates a required non-empty string field from an input object.
 *
 * @param {Record<string, unknown>} input Input object.
 * @param {string} field Field name.
 * @param {string} label Human-readable field label.
 * @returns {{
 *       ok: true;
 *       value: string;
 *     }
 *   | import("./types.js").DevNotesInvalidRequestResult}
 *   Validation result.
 */
function readRequiredStringField(input, field, label) {
  const result = readStringField(input, field, {
    label,
    required: true,
    allowEmpty: false,
  });

  if (!result.ok) {
    return result;
  }

  if (!result.present || typeof result.value !== "string") {
    return invalidRequest(`Missing ${label}.`, {
      field,
      reason: "missing",
    });
  }

  return Object.freeze({
    ok: true,
    value: result.value,
  });
}

/**
 * Reads and validates a required dev-note id from an input object.
 *
 * @param {Partial<import("./types.js").GetDevNoteByIdInput>} input Input object.
 * @returns {import("./types.js").DevNoteIdValidationResult} Validation result.
 */
export function readRequiredDevNoteId(input) {
  if (!hasOwnField(input, "id")) {
    return invalidRequest("Missing dev-note id.", {
      field: "id",
      reason: "missing",
    });
  }

  const rawId = input.id;

  if (typeof rawId !== "string" && typeof rawId !== "number") {
    return invalidRequest("Dev-note id must be a positive integer.", {
      field: "id",
      reason: "wrong-type",
      actualType: typeof rawId,
    });
  }

  if (typeof rawId === "string" && rawId.trim() === "") {
    return invalidRequest("Dev-note id must not be empty.", {
      field: "id",
      reason: "empty",
    });
  }

  const id = Number(rawId);

  if (!Number.isInteger(id) || id < 1) {
    return invalidRequest("Dev-note id must be a positive integer.", {
      field: "id",
      reason: "invalid-value",
      actualValue: rawId,
    });
  }

  return Object.freeze({
    ok: true,
    value: id,
  });
}

/**
 * Reads and validates dev-note search input.
 *
 * Search still uses `text` because it is a query fragment, not the dev-note resource shape.
 *
 * @param {Record<string, unknown>} input Input object.
 * @returns {{
 *       ok: true;
 *       value: import("./types.js").SearchDevNotesByTextInput;
 *     }
 *   | import("./types.js").DevNotesInvalidRequestResult}
 *   Validation result.
 */
export function readSearchDevNotesByTextInput(input) {
  const textResult = readRequiredStringField(input, "text", "Search text");

  if (!textResult.ok) {
    return textResult;
  }

  return Object.freeze({
    ok: true,
    value: Object.freeze({
      text: textResult.value,
    }),
  });
}

/**
 * Reads and validates dev-note creation input.
 *
 * @param {Record<string, unknown>} input Input object.
 * @returns {{
 *       ok: true;
 *       value: import("./types.js").CreateDevNoteInput;
 *     }
 *   | import("./types.js").DevNotesInvalidRequestResult}
 *   Validation result.
 */
export function readCreateDevNoteInput(input) {
  const nameResult = readRequiredStringField(input, "name", "Dev-note name");

  if (!nameResult.ok) {
    return nameResult;
  }

  const commentResult = readStringField(input, "comment", {
    label: "Dev-note comment",
    required: false,
    allowEmpty: true,
  });

  if (!commentResult.ok) {
    return commentResult;
  }

  return Object.freeze({
    ok: true,
    value: Object.freeze({
      name: nameResult.value,
      comment: commentResult.present ? commentResult.value : "",
    }),
  });
}

/**
 * Reads and validates dev-note replacement input.
 *
 * PUT currently replaces the editable resource fields. `name` is required, `comment` is optional.
 *
 * @param {Record<string, unknown>} input Input object.
 * @returns {{
 *       ok: true;
 *       value: import("./types.js").ReplaceDevNoteInput;
 *     }
 *   | import("./types.js").DevNotesInvalidRequestResult}
 *   Validation result.
 */
export function readReplaceDevNoteInput(input) {
  const idResult = readRequiredDevNoteId(input);

  if (!idResult.ok) {
    return idResult;
  }

  const createResult = readCreateDevNoteInput(input);

  if (!createResult.ok) {
    return createResult;
  }

  return Object.freeze({
    ok: true,
    value: Object.freeze({
      id: idResult.value,
      ...createResult.value,
    }),
  });
}

/**
 * Reads and validates dev-note partial update input.
 *
 * PATCH allows any subset of `name`, `comment`, and `lastConfirmedInteraction`, but at least one
 * update field must be present.
 *
 * @param {Record<string, unknown>} input Input object.
 * @returns {{
 *       ok: true;
 *       value: import("./types.js").UpdateDevNoteInput;
 *     }
 *   | import("./types.js").DevNotesInvalidRequestResult}
 *   Validation result.
 */
export function readUpdateDevNoteInput(input) {
  const idResult = readRequiredDevNoteId(input);

  if (!idResult.ok) {
    return idResult;
  }

  const nameResult = readStringField(input, "name", {
    label: "Dev-note name",
    required: false,
    allowEmpty: false,
  });

  if (!nameResult.ok) {
    return nameResult;
  }

  const commentResult = readStringField(input, "comment", {
    label: "Dev-note comment",
    required: false,
    allowEmpty: true,
  });

  if (!commentResult.ok) {
    return commentResult;
  }

  const interactionResult = readStringField(input, "lastConfirmedInteraction", {
    label: "Last confirmed interaction",
    required: false,
    allowEmpty: true,
  });

  if (!interactionResult.ok) {
    return interactionResult;
  }

  if (!nameResult.present && !commentResult.present && !interactionResult.present) {
    return invalidRequest("At least one update field is required.", {
      field: "body",
      reason: "missing",
    });
  }

  return Object.freeze({
    ok: true,
    value: Object.freeze({
      id: idResult.value,
      ...(nameResult.present ? { name: nameResult.value } : {}),
      ...(commentResult.present ? { comment: commentResult.value } : {}),
      ...(interactionResult.present ? { lastConfirmedInteraction: interactionResult.value } : {}),
    }),
  });
}
