import { resolveStorageTarget } from "./connection.js";

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

  return Object.freeze({
    ok: true,
    status: "ok", // Text or HTTP?
    notes: resolvedStorage.storageTarget.adapter.listDevNotes(),
  });
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
  if (!input.id || !Number.isInteger(input.id) || input.id < 1) {
    return Object.freeze({
      ok: true,
      status: "invalid-request",
      message: `Invalid dev-note id: ${input.id ? input.id : "undefined request.id"}`,
    });
  }

  const resolvedStorage = resolveStorageTarget(input.storageKind);

  if (!resolvedStorage.ok) {
    return resolvedStorage;
  }

  return Object.freeze({
    ok: true,
    status: "ok",
    note: resolvedStorage.storageTarget.adapter.getDevNoteById(input),
  });
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
  if (!input.text || input.text === "") {
    return Object.freeze({
      ok: true,
      status: "invalid-request",
      message: `Invalid dev-note text: ${input.text ? input.text : "undefined request.text"}`,
    });
  }

  const resolvedStorage = resolveStorageTarget(input.storageKind);

  if (!resolvedStorage.ok) {
    return resolvedStorage;
  }

  return Object.freeze({
    ok: true,
    status: "ok",
    notes: resolvedStorage.storageTarget.adapter.searchDevNotesByText(input),
  });
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
  if (!input.text || input.text === "") {
    return Object.freeze({
      ok: true,
      status: "invalid-request",
      message: `Invalid dev-note text: ${input.text ? input.text : "undefined request.text"}`,
    });
  }

  const resolvedStorage = resolveStorageTarget(input.storageKind);

  if (!resolvedStorage.ok) {
    return resolvedStorage;
  }

  return Object.freeze({
    ok: true,
    status: "created",
    note: resolvedStorage.storageTarget.adapter.createDevNote(input),
  });
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
  if (!input.id || !Number.isInteger(input.id) || input.id < 1) {
    return Object.freeze({
      ok: true,
      status: "invalid-request",
      message: `Invalid dev-note id: ${input.id ? input.id : "undefined request.id"}`,
    });
  }

  if (!input.text || input.text === "") {
    return Object.freeze({
      ok: true,
      status: "invalid-request",
      message: `Invalid dev-note text: ${input.text ? input.text : "undefined request.text"}`,
    });
  }

  const resolvedStorage = resolveStorageTarget(input.storageKind);

  if (!resolvedStorage.ok) {
    return resolvedStorage;
  }

  return Object.freeze({
    ok: true,
    status: "replaced",
    note: resolvedStorage.storageTarget.adapter.replaceDevNote(input),
  });
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
  if (!input.id || !Number.isInteger(input.id) || input.id < 1) {
    return Object.freeze({
      ok: true,
      status: "invalid-request",
      message: `Invalid dev-note id: ${input.id ? input.id : "undefined request.id"}`,
    });
  }

  if (!input.text || input.text === "") {
    return Object.freeze({
      ok: true,
      status: "invalid-request",
      message: `Invalid dev-note text: ${input.text ? input.text : "undefined request.text"}`,
    });
  }

  const resolvedStorage = resolveStorageTarget(input.storageKind);

  if (!resolvedStorage.ok) {
    return resolvedStorage;
  }

  return Object.freeze({
    ok: true,
    status: "updated",
    note: resolvedStorage.storageTarget.adapter.updateDevNote(input),
  });
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
  if (!input.id || !Number.isInteger(input.id) || input.id < 1) {
    return Object.freeze({
      ok: true,
      status: "invalid-request",
      message: `Invalid dev-note id: ${input.id ? input.id : "undefined request.id"}`,
    });
  }

  if (!input.text || input.text === "") {
    return Object.freeze({
      ok: true,
      status: "invalid-request",
      message: `Invalid dev-note text: ${input.text ? input.text : "undefined request.text"}`,
    });
  }

  const resolvedStorage = resolveStorageTarget(input.storageKind);

  if (!resolvedStorage.ok) {
    return resolvedStorage;
  }

  return Object.freeze({
    ok: true,
    status: "deleted",
    note: resolvedStorage.storageTarget.adapter.deleteDevNote(input),
  });
}

// HEAD

// OPTIONS
