import { resolveStorageTarget } from "./connection.js";

/**
 * Helper: Gets a dev-note and validates it.
 *
 * @private
 * @param {object} input Get input.
 * @param {?number || null} input.id Requested id.
 * @param {?string || ""} input.text Requested text.
 * @param {void} functionName Requested function to retrieve the dev-note.
 * @param {import(".types.js").DevNotesCreateResult}
 */
function getNote(input, functionName) {
  const note = functionName(input);

  if (!note) {
    return Object.freeze({
      ok: false,
      status: "not-found",
      message: `Dev-note not found for ${input.id} or ${input.text}`,
    });
  }

  return Object.freeze({
    ok: true,
    status: "ok",
    note: note,
  });
}

/**
 * Helper: Gets a dev-notes and validates it.
 *
 * @private
 * @param {object} input Get input.
 * @param {?number || null} input.id Requested id.
 * @param {?string || ""} input.text Requested text.
 * @param {void} functionName Requested function to retrieve the dev-note.
 * @returns {import("./types.js").DevNotesListResult}
 */
function getNotes(input, functionName) {
  const notes = functionName(input);

  if (!notes || notes.length === 0) {
    return Object.freeze({
      ok: false,
      status: "not-found",
      message: `Dev-note not found for ${input.id} or ${input.text}`,
    });
  }

  return Object.freeze({
    ok: true,
    status: "ok",
    notes: notes,
  });
}

/**
 * Lists dev-notes from the requested storage target. (GET)
 *
 * @param {object} input List input.
 * @param {string} input.storageKind Requested storage kind.
 * @returns {import("./types.js").DevNotesListResult} List result.
 * @see Dev-notes README, section "storage facade".
 */
export function listDevNotes(input) {
  const resolvedStorage = resolveStorageTarget(input.storageKind);

  if (!resolvedStorage.ok) {
    return resolvedStorage;
  }

  return getNotes({}, resolvedStorage.storageTarget.adapter.listDevNotes);
}

/**
 * Lists dev-note by ID from the requested storage target. (GET)
 *
 * @param {object} input List input.
 * @param {string} input.storageKind Requested storage kind.
 * @returns {import("./types.js").DevNotesCreateResult} List result.
 * @see Dev-notes README, section "storage facade".
 */
export function getDevNoteById(input) {
  const id = Number(input.id);
  if (!id || !Number.isInteger(id) || id < 1) {
    return Object.freeze({
      ok: false,
      status: "invalid-request",
      message: `Invalid dev-note id: ${id ?? "undefined request.id"}`,
    });
  }

  const resolvedStorage = resolveStorageTarget(input.storageKind);

  if (!resolvedStorage.ok) {
    return resolvedStorage;
  }

  return getNote({ id: id }, resolvedStorage.storageTarget.adapter.getDevNoteById);
}

/**
 * Lists dev-notes by text from the requested storage target. (GET)
 *
 * @param {object} input List input.
 * @param {string} input.storageKind Requested storage kind.
 * @returns {import("./types.js").DevNotesListResult} List result.
 * @see Dev-notes README, section "storage facade".
 */
export function searchDevNotesByText(input) {
  const text = String(input.text ?? "").trim();
  if (text === "") {
    return Object.freeze({
      ok: false,
      status: "invalid-request",
      message: `Invalid dev-note text: ${text ?? "undefined request.text"}`,
    });
  }

  const resolvedStorage = resolveStorageTarget(input.storageKind);

  if (!resolvedStorage.ok) {
    return resolvedStorage;
  }

  return getNotes({ text: text }, resolvedStorage.storageTarget.adapter.searchDevNotesByText);
}

/**
 * Creates a dev-note in the requested storage target. (POST)
 *
 * @param {object} input Create input.
 * @param {string} input.storageKind Requested storage kind.
 * @param {string} input.text Dev-note text.
 * @returns {import("./types.js").DevNotesCreateResult} Create result.
 * @see Dev-notes README, section "storage facade".
 */
export function createDevNote(input) {
  const text = String(input.text ?? "").trim();
  if (!text || text === "") {
    return Object.freeze({
      ok: false,
      status: "invalid-request",
      message: `Invalid dev-note text: ${text ?? "undefined request.text"}`,
    });
  }

  const resolvedStorage = resolveStorageTarget(input.storageKind);

  if (!resolvedStorage.ok) {
    return resolvedStorage;
  }

  return getNote({ text: text }, resolvedStorage.storageTarget.adapter.createDevNote);
}

/**
 * Replaces a dev-note in the requested storage target. (PUT)
 *
 * @param {object} input Replace input.
 * @param {string} input.storageKind Requested storage kind.
 * @param {number | string} input.id Dev-note id.
 * @param {string} input.text Dev-note text.
 * @returns {import("./types.js").DevNotesCreateResult} Replacement result.
 * @see Dev-notes README, section "storage facade".
 */
export function replaceDevNote(input) {
  const id = Number(input.id);
  if (!input.id || !Number.isInteger(id) || id < 1) {
    return Object.freeze({
      ok: false,
      status: "invalid-request",
      message: `Invalid dev-note id: ${id ?? "undefined request.id"}`,
    });
  }

  const text = String(input.text ?? "").trim();
  if (text === "") {
    return Object.freeze({
      ok: false,
      status: "invalid-request",
      message: `Invalid dev-note text: ${text ?? "undefined request.text"}`,
    });
  }

  const resolvedStorage = resolveStorageTarget(input.storageKind);

  if (!resolvedStorage.ok) {
    return resolvedStorage;
  }

  return getNote({ id: id }, resolvedStorage.storageTarget.adapter.replaceDevNote);
}

/**
 * Updates a dev-note in the requested storage target. (PATCH)
 *
 * @param {object} input Update input.
 * @param {string} input.storageKind Requested storage kind.
 * @param {number | string} input.id Dev-note id.
 * @param {string} input.text Dev-note text.
 * @returns {import("./types.js").DevNotesCreateResult} Updated result.
 * @see Dev-notes README, section "storage facade".
 */
export function updateDevNote(input) {
  const id = Number(input.id);
  if (!id || !Number.isInteger(id) || id < 1) {
    return Object.freeze({
      ok: false,
      status: "invalid-request",
      message: `Invalid dev-note id: ${id ? id : "undefined request.id"}`,
    });
  }

  const text = String(input.text ?? "").trim();
  if (!text || input.text === "") {
    return Object.freeze({
      ok: false,
      status: "invalid-request",
      message: `Invalid dev-note text: ${text ? text : "undefined request.text"}`,
    });
  }

  const resolvedStorage = resolveStorageTarget(input.storageKind);

  if (!resolvedStorage.ok) {
    return resolvedStorage;
  }

  return getNote({ id: id }, resolvedStorage.storageTarget.adapter.updateDevNote);
}

/**
 * Deletes a dev-note in the requested storage target. (PUT)
 *
 * @param {object} input Delete input.
 * @param {string} input.storageKind Requested storage kind.
 * @param {number | string} input.id Dev-note id.
 * @param {string} input.text Dev-note text.
 * @returns {import("./types.js").DevNotesCreateResult} Deleted object.
 * @see Dev-notes README, section "storage facade".
 */
export function deleteDevNote(input) {
  const id = Number(input.id);
  if (!id || !Number.isInteger(id) || id < 1) {
    return Object.freeze({
      ok: false,
      status: "invalid-request",
      message: `Invalid dev-note id: ${id ? id : "undefined request.id"}`,
    });
  }

  const resolvedStorage = resolveStorageTarget(input.storageKind);

  if (!resolvedStorage.ok) {
    return resolvedStorage;
  }

  return getNote({ id: id }, resolvedStorage.storageTarget.adapter.deleteDevNote);
}

// HEAD

// OPTIONS
