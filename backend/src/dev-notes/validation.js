/**
 * Creates a structured invalid-request result.
 *
 * @param {string} message Human-readable validation failure message.
 * @param {import("./types.js").DevNotesValidationDetails} details Validation failure details.
 * @returns {import("./types.js").DevNotesInvalidRequestResult} Invalid request result.
 */
function invalidRequest(message, details = {}) {
  return Object.freeze({
    ok: false,
    status: "invalid-request",
    message,
    details: Object.freeze(details),
  });
}

/**
 * Reads and validates a required dev-note id from an input object.
 *
 * @param {object} input Input object.
 * @returns {import("./types.js").DevNoteIdValidationResult} Validation result.
 */
export function readRequiredDevNoteId(input) {
  if (!Object.hasOwn(input, "id")) {
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
 * Reads and validates a required dev-note text value from an input object.
 *
 * @param {object} input Input object.
 * @returns {import("./types.js").DevNoteTextValidationResult} Validation result.
 */
export function readRequiredDevNoteText(input) {
  if (!Object.hasOwn(input, "text")) {
    return invalidRequest("Missing dev-note text.", {
      field: "text",
      reason: "missing",
    });
  }

  if (typeof input.text !== "string") {
    return invalidRequest("Dev-note text must be a string.", {
      field: "text",
      reason: "wrong-type",
      actualType: typeof input.text,
    });
  }

  const text = input.text.trim();

  if (text === "") {
    return invalidRequest("Dev-note text must not be empty.", {
      field: "text",
      reason: "empty",
    });
  }

  return Object.freeze({
    ok: true,
    value: text,
  });
}
