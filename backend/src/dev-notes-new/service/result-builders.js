/** Standard service-result builders for the dev-notes proof of concept. */

/**
 * @param {readonly Readonly<import("../resource/types.js").DevNote>[]} notes Notes.
 * @returns {Readonly<import("../resource/types.js").DevNotesListResult>} List result.
 */
export function createListResult(notes) {
  return Object.freeze({
    ok: true,
    status: "ok",
    notes: Object.freeze([...notes]),
  });
}

/**
 * @param {Readonly<import("../resource/types.js").DevNote> | null} note Note or null.
 * @param {import("../resource/types.js").DevNotesSuccessStatus} [status="ok"] Success status.
 * @returns {Readonly<import("../resource/types.js").DevNotesSingleResult>} Single-note result.
 */
export function createSingleResult(note, status = "ok") {
  if (!note) {
    return createNotFoundResult();
  }

  return Object.freeze({ ok: true, status, note });
}

/**
 * @param {string} [message="Dev-note not found."] Message.
 * @returns {Readonly<import("../resource/types.js").DevNotesBaseResult>} Not-found result.
 */
export function createNotFoundResult(message = "Dev-note not found.") {
  return Object.freeze({ ok: false, status: "not-found", message });
}

/**
 * @param {string} message Safe failure message.
 * @returns {Readonly<import("../resource/types.js").DevNotesBaseResult>} Operation failure.
 */
export function createOperationFailedResult(message) {
  return Object.freeze({ ok: false, status: "operation-failed", message });
}

/**
 * @param {string} storageKind Requested storage kind.
 * @returns {Readonly<import("../resource/types.js").DevNotesBaseResult>} Unknown-storage result.
 */
export function createUnknownStorageResult(storageKind) {
  return Object.freeze({
    ok: false,
    status: "unknown-storage",
    message: `Unknown dev-notes storage target: ${storageKind}`,
  });
}

/**
 * @param {string} storageKind Disabled storage kind or subsystem label.
 * @returns {Readonly<import("../resource/types.js").DevNotesBaseResult>} Disabled-storage result.
 */
export function createStorageDisabledResult(storageKind) {
  return Object.freeze({
    ok: false,
    status: "storage-disabled",
    message:
      storageKind === "dev-notes"
        ? "Dev-notes is disabled."
        : `Dev-notes storage target is disabled: ${storageKind}`,
  });
}
