import { resolveStorageTarget } from "./connection.js";
import { readRequiredDevNoteId, readRequiredDevNoteText } from "./validation.js";

export function optionsStorageOnly() {
  return { Allow: "GET, POST, OPTIONS" };
}

// TODO: Initiate HEAD
export function optionsStorageAndId() {
  return { Allow: "GET, PUT, PATCH, DELETE, OPTIONS" };
}

/**
 * Creates a single-dev-note facade result.
 *
 * @private
 * @param {import("./types.js").DevNote | null} note Dev-note returned by the storage adapter.
 * @param {string} [successStatus="ok"] Success status to expose when a note exists. Default is
 *   `"ok"`
 * @returns {import("./types.js").DevNotesSingleResult} Single-note facade result.
 */
function singleNoteResult(note, successStatus = "ok") {
  if (!note) {
    return Object.freeze({
      ok: false,
      status: "not-found",
      message: "Dev-note not found.",
    });
  }

  return Object.freeze({
    ok: true,
    status: successStatus,
    note,
  });
}

/**
 * Creates a list-dev-notes facade result.
 *
 * @private
 * @param {import("./types.js").DevNote[]} notes Dev-notes returned by the storage adapter.
 * @returns {import("./types.js").DevNotesListResult} List facade result.
 */
function listResult(notes) {
  return Object.freeze({
    ok: true,
    status: "ok",
    notes,
  });
}

/**
 * Creates an operation-failed facade result.
 *
 * @private
 * @param {string} message Human-readable failure message.
 * @returns {import("./types.js").DevNotesBaseResult} Failure result.
 */
function operationFailedResult(message) {
  return Object.freeze({
    ok: false,
    status: "operation-failed",
    message,
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

  const notes = resolvedStorage.storageTarget.adapter.listDevNotes();

  return listResult(notes);
}

/**
 * Lists dev-note by ID from the requested storage target. (GET)
 *
 * @param {object} input List input.
 * @param {string} input.storageKind Requested storage kind.
 * @param {number | string} input.id Dev-note id.
 * @returns {import("./types.js").DevNotesGetResult} List result.
 * @see Dev-notes README, section "storage facade".
 */
export function getDevNoteById(input) {
  const idResult = readRequiredDevNoteId(input);

  if (!idResult.ok) {
    return idResult;
  }

  const id = idResult.value;

  const resolvedStorage = resolveStorageTarget(input.storageKind);

  if (!resolvedStorage.ok) {
    return resolvedStorage;
  }

  const note = resolvedStorage.storageTarget.adapter.getDevNoteById({
    id: id,
  });

  return singleNoteResult(note);
}

/**
 * Lists dev-notes by text from the requested storage target. (GET)
 *
 * @param {object} input List input.
 * @param {string} input.storageKind Requested storage kind.
 * @param {string} input.text Dev-note text.
 * @returns {import("./types.js").DevNotesSearchResult} List result.
 * @see Dev-notes README, section "storage facade".
 */
export function searchDevNotesByText(input) {
  const textResult = readRequiredDevNoteText(input);

  if (!textResult.ok) {
    return textResult;
  }

  const resolvedStorage = resolveStorageTarget(input.storageKind);

  if (!resolvedStorage.ok) {
    return resolvedStorage;
  }

  const notes = resolvedStorage.storageTarget.adapter.searchDevNotesByText({
    text: textResult.value,
  });

  return listResult(notes);
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
  const textResult = readRequiredDevNoteText(input);

  if (!textResult.ok) {
    return textResult;
  }

  const resolvedStorage = resolveStorageTarget(input.storageKind);

  if (!resolvedStorage.ok) {
    return resolvedStorage;
  }

  const note = resolvedStorage.storageTarget.adapter.createDevNote({
    text: textResult.value,
  });

  if (!note) {
    return operationFailedResult("Dev-note could not be created.");
  }

  return singleNoteResult(note, "created");
}

/**
 * Replaces a dev-note in the requested storage target. (PUT)
 *
 * @param {object} input Replace input.
 * @param {string} input.storageKind Requested storage kind.
 * @param {number | string} input.id Dev-note id.
 * @param {string} input.text Dev-note text.
 * @returns {import("./types.js").DevNotesReplaceResult} Replacement result.
 * @see Dev-notes README, section "storage facade".
 */
export function replaceDevNote(input) {
  const idResult = readRequiredDevNoteId(input);

  if (!idResult.ok) {
    return idResult;
  }

  const textResult = readRequiredDevNoteText(input);

  if (!textResult.ok) {
    return textResult;
  }

  const resolvedStorage = resolveStorageTarget(input.storageKind);

  if (!resolvedStorage.ok) {
    return resolvedStorage;
  }

  const note = resolvedStorage.storageTarget.adapter.replaceDevNote({
    id: idResult.value,
    text: textResult.value,
  });

  return singleNoteResult(note, "replaced");
}

/**
 * Updates a dev-note in the requested storage target. (PATCH)
 *
 * @param {object} input Update input.
 * @param {string} input.storageKind Requested storage kind.
 * @param {number | string} input.id Dev-note id.
 * @param {string} input.text Dev-note text.
 * @returns {import("./types.js").DevNotesUpdateResult} Updated result.
 * @see Dev-notes README, section "storage facade".
 */
export function updateDevNote(input) {
  const idResult = readRequiredDevNoteId(input);

  if (!idResult.ok) {
    return idResult;
  }

  const textResult = readRequiredDevNoteText(input);

  if (!textResult.ok) {
    return textResult;
  }

  const resolvedStorage = resolveStorageTarget(input.storageKind);

  if (!resolvedStorage.ok) {
    return resolvedStorage;
  }

  const note = resolvedStorage.storageTarget.adapter.updateDevNote({
    id: idResult.value,
    text: textResult.value,
  });

  return singleNoteResult(note, "updated");
}

/**
 * Deletes a dev-note in the requested storage target. (DELETE)
 *
 * @param {object} input Delete input.
 * @param {string} input.storageKind Requested storage kind.
 * @param {number | string} input.id Dev-note id.
 * @returns {import("./types.js").DevNotesDeleteResult} Delete result.
 * @see Dev-notes README, section "storage facade".
 */
export function deleteDevNote(input) {
  const idResult = readRequiredDevNoteId(input);

  if (!idResult.ok) {
    return idResult;
  }

  const resolvedStorage = resolveStorageTarget(input.storageKind);

  if (!resolvedStorage.ok) {
    return resolvedStorage;
  }

  const note = resolvedStorage.storageTarget.adapter.deleteDevNote({
    id: idResult.value,
  });

  return singleNoteResult(note, "deleted");
}

// HEAD

// OPTIONS
