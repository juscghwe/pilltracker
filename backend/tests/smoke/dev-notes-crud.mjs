/**
 * Dev-notes CRUD API smoke test.
 *
 * This test exercises the disposable dev-notes CRUD POC through the HTTP API for every enabled
 * dev-notes storage target.
 */

const baseUrl = process.env.API_BASE_URL ?? "http://localhost:3000";
const storages = (process.env.DEV_NOTES_SMOKE_STORAGES ?? "temp,persistent")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

/** @typedef {Record<string, any>} JsonObject */

/**
 * Fails the smoke test when a condition is false.
 *
 * @param {unknown} condition Assertion condition.
 * @param {string} message Failure message.
 * @returns {asserts condition}
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * Fetches JSON from the API and validates the status code.
 *
 * @param {string} path API path.
 * @param {object} [options] Fetch options.
 * @param {number} [expectedStatus=200] Expected HTTP status. Default is `200`
 * @returns {Promise<JsonObject>} Parsed JSON body.
 */
async function fetchJson(path, options = {}, expectedStatus = 200) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = await response.json();

  if (response.status !== expectedStatus) {
    throw new Error(
      `Expected HTTP ${expectedStatus} for ${path}, got HTTP ${response.status}: ${JSON.stringify(
        body,
      )}`,
    );
  }

  return body;
}

/**
 * Sends a JSON request to the API.
 *
 * @param {string} method HTTP method.
 * @param {string} path API path.
 * @param {JsonObject} body Request body.
 * @param {number} expectedStatus Expected HTTP status.
 * @returns {Promise<JsonObject>} Parsed JSON body.
 */
async function sendJson(method, path, body, expectedStatus) {
  return fetchJson(
    path,
    {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
    expectedStatus,
  );
}

/**
 * Reads and validates a `notes` array from a dev-notes list/search response.
 *
 * @param {JsonObject} body Response body.
 * @param {string} context Assertion context.
 * @returns {JsonObject[]} Notes array.
 */
function readNotesArray(body, context) {
  assert(Array.isArray(body.notes), `${context}: expected notes to be an array.`);

  return /** @type {JsonObject[]} */ (body.notes);
}

/**
 * Checks whether a value looks like a public dev-note API resource.
 *
 * @param {JsonObject} note Candidate note.
 * @returns {void}
 */
function assertDevNoteShape(note) {
  assert(Number.isInteger(note.id), `Expected note.id to be an integer: ${JSON.stringify(note)}`);
  assert(
    typeof note.name === "string",
    `Expected note.name to be a string: ${JSON.stringify(note)}`,
  );
  assert(
    typeof note.comment === "string",
    `Expected note.comment to be a string: ${JSON.stringify(note)}`,
  );
  assert(
    typeof note.lastConfirmedInteraction === "string",
    `Expected note.lastConfirmedInteraction to be a string: ${JSON.stringify(note)}`,
  );
  assert(
    typeof note.createdAt === "string",
    `Expected note.createdAt to be a string: ${JSON.stringify(note)}`,
  );
  assert(
    typeof note.updatedAt === "string",
    `Expected note.updatedAt to be a string: ${JSON.stringify(note)}`,
  );
}

/**
 * Runs the CRUD contract against one storage target.
 *
 * @param {string} storage Storage kind.
 * @returns {Promise<void>}
 */
async function runCrudSmoke(storage) {
  const token = `CRUD_SMOKE_${storage}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const originalName = `${token}_name`;
  const originalComment = `${token}_comment`;
  const updatedName = `${token}_name_A`;
  const updatedComment = `${token}_comment_A`;
  const interactionTimestamp = "2026-07-07T12:00:00.000Z";

  const storagePath = `/api/dev-notes/${encodeURIComponent(storage)}`;

  const initialList = await fetchJson(storagePath);
  assert(initialList.ok === true, `${storage}: initial list did not return ok.`);
  const initialNotes = readNotesArray(initialList, `${storage}: initial list`);
  const initialLength = initialNotes.length;

  const created = await sendJson(
    "POST",
    storagePath,
    {
      name: originalName,
      comment: originalComment,
    },
    201,
  );

  assert(created.ok === true, `${storage}: create did not return ok.`);
  assert(created.status === "created", `${storage}: create did not return created status.`);
  assertDevNoteShape(created.note);
  assert(created.note.name === originalName, `${storage}: created note name mismatch.`);
  assert(created.note.comment === originalComment, `${storage}: created note comment mismatch.`);
  assert(
    created.note.lastConfirmedInteraction === "",
    `${storage}: created note should start without lastConfirmedInteraction.`,
  );

  const id = created.note.id;
  const createdAt = created.note.createdAt;

  const listAfterCreate = await fetchJson(storagePath);
  assert(
    listAfterCreate.notes.length === initialLength + 1,
    `${storage}: list length after create should be initial length + 1.`,
  );
  const notesAfterCreate = readNotesArray(listAfterCreate, `${storage}: list after create`);
  assert(
    notesAfterCreate.some((note) => note.id === id && note.name === originalName),
    `${storage}: created note was not found in full list.`,
  );

  const searchResult = await fetchJson(`${storagePath}?text=${encodeURIComponent(token)}`);
  assert(searchResult.ok === true, `${storage}: search did not return ok.`);
  assert(Array.isArray(searchResult.notes), `${storage}: search did not return notes array.`);
  assert(
    searchResult.notes.some(
      (note) => note.id === id && note.name === originalName && note.comment === originalComment,
    ),
    `${storage}: created note was not found by search.`,
  );

  const readById = await fetchJson(`${storagePath}/${id}`);
  assert(readById.ok === true, `${storage}: read by id did not return ok.`);
  assertDevNoteShape(readById.note);
  assert(readById.note.id === id, `${storage}: read by id returned wrong id.`);
  assert(readById.note.name === originalName, `${storage}: read by id returned wrong name.`);
  assert(
    readById.note.comment === originalComment,
    `${storage}: read by id returned wrong comment.`,
  );

  const interactionPatch = await sendJson(
    "PATCH",
    `${storagePath}/${id}`,
    {
      lastConfirmedInteraction: interactionTimestamp,
    },
    200,
  );

  assert(interactionPatch.ok === true, `${storage}: interaction patch did not return ok.`);
  assert(interactionPatch.status === "updated", `${storage}: interaction patch status mismatch.`);
  assertDevNoteShape(interactionPatch.note);
  assert(
    interactionPatch.note.name === originalName,
    `${storage}: interaction patch changed name unexpectedly.`,
  );
  assert(
    interactionPatch.note.comment === originalComment,
    `${storage}: interaction patch changed comment unexpectedly.`,
  );
  assert(
    interactionPatch.note.lastConfirmedInteraction === interactionTimestamp,
    `${storage}: interaction patch did not persist lastConfirmedInteraction.`,
  );

  const contentPatch = await sendJson(
    "PATCH",
    `${storagePath}/${id}`,
    {
      name: updatedName,
      comment: updatedComment,
    },
    200,
  );

  assert(contentPatch.ok === true, `${storage}: content patch did not return ok.`);
  assert(contentPatch.status === "updated", `${storage}: content patch status mismatch.`);
  assertDevNoteShape(contentPatch.note);
  assert(contentPatch.note.name === updatedName, `${storage}: content patch name mismatch.`);
  assert(
    contentPatch.note.comment === updatedComment,
    `${storage}: content patch comment mismatch.`,
  );
  assert(
    contentPatch.note.lastConfirmedInteraction === interactionTimestamp,
    `${storage}: content patch should preserve lastConfirmedInteraction.`,
  );
  assert(contentPatch.note.createdAt === createdAt, `${storage}: content patch changed createdAt.`);

  const deleted = await fetchJson(
    `${storagePath}/${id}`,
    {
      method: "DELETE",
    },
    200,
  );

  assert(deleted.ok === true, `${storage}: delete did not return ok.`);
  assert(deleted.status === "deleted", `${storage}: delete status mismatch.`);
  assertDevNoteShape(deleted.note);
  assert(deleted.note.id === id, `${storage}: delete returned wrong note.`);

  const readAfterDelete = await fetchJson(`${storagePath}/${id}`, {}, 404);
  assert(readAfterDelete.ok === false, `${storage}: deleted note lookup should not return ok.`);
  assert(
    readAfterDelete.status === "not-found",
    `${storage}: deleted note lookup should return not-found.`,
  );

  const listAfterDelete = await fetchJson(storagePath);
  assert(
    listAfterDelete.notes.length === initialLength,
    `${storage}: list length after delete should return to initial length.`,
  );

  console.log(`Dev-notes CRUD smoke passed for storage: ${storage}`);
}

for (const storage of storages) {
  await runCrudSmoke(storage);
}
