/**
 * Dev-notes route result response.
 *
 * @typedef {import("../dev-notes/types.js").DevNotesBaseResult
 *   | import("../dev-notes/types.js").DevNotesSingleResult
 *   | import("../dev-notes/types.js").DevNotesListResult
 *   | import("../dev-notes/types.js").DevNotesInvalidRequestResult} DevNotesRouteResult
 */

import { Router } from "express";
import {
  listDevNotes,
  getDevNoteById,
  searchDevNotesByText,
  createDevNote,
  replaceDevNote,
  updateDevNote,
  deleteDevNote,
  optionsStorageOnly,
  optionsStorageAndId,
} from "../dev-notes/index.js";

const devNotesRouter = Router();

/**
 * Reads a JSON object body from an Express request.
 *
 * Arrays, null, and non-object bodies are treated as an empty object so validation can return
 * structured invalid-request responses instead of route-level crashes.
 *
 * @param {import("express").Request} req Express request.
 * @returns {Record<string, unknown>} Request body object.
 */
function readObjectBody(req) {
  if (typeof req.body !== "object" || req.body === null || Array.isArray(req.body)) {
    return {};
  }

  return /** @type {Record<string, unknown>} */ (req.body);
}

/**
 * Sends a dev-notes route result with the matching HTTP status code.
 *
 * @param {import("express").Response} res Express response.
 * @param {DevNotesRouteResult} message Dev-notes result message.
 * @returns {void}
 */
function returnCodes(res, message) {
  switch (message.status) {
    case "ok":
    case "replaced":
    case "updated":
    case "deleted":
      res.status(200).json(message);
      break;

    case "created":
      res.status(201).json(message);
      break;

    case "invalid-request":
      res.status(400).json(message);
      break;

    case "not-found":
    case "unknown-storage":
    case "storage-disabled":
      res.status(404).json(message);
      break;

    case "operation-failed":
      res.status(500).json(message);
      break;

    default:
      throw new Error("Unhandled dev-notes result status.");
  }
}

// TODO: add HEAD

devNotesRouter.options("/:storage", (_req, res) => {
  res.set(optionsStorageOnly());
  return res.status(204).end();
});

devNotesRouter.options("/:storage/:id", (_req, res) => {
  res.set(optionsStorageAndId());
  return res.status(204).end();
});

/**
 * Lists all dev-notes from the selected storage target, or searches dev-notes by text query.
 *
 * @example
 *   `GET /api/dev-notes/:storage`;
 *
 * @example
 *   `GET /api/dev-notes/:storage?text=search`;
 */
devNotesRouter.get("/:storage", (req, res) => {
  const storageKind = req.params.storage ?? null;
  const textQuery = req.query.text ?? null;
  let message;

  if (typeof textQuery === "string") {
    message = searchDevNotesByText({
      storageKind,
      text: textQuery,
    });
  } else {
    message = listDevNotes({
      storageKind,
    });
  }

  return returnCodes(res, message);
});

/**
 * Reads one dev-note from the selected storage target.
 *
 * @example
 *   `GET /api/dev-notes/:storage/:id`;
 */
devNotesRouter.get("/:storage/:id", (req, res) => {
  const storageKind = req.params.storage ?? null;
  const idQuery = req.params.id ?? null;

  const message = getDevNoteById({
    storageKind,
    id: idQuery,
  });

  return returnCodes(res, message);
});

/**
 * Creates one dev-note in the selected storage target.
 *
 * Body shape:
 *
 * - Name: required string
 * - Comment: optional string
 *
 * @example
 *   `POST /api/dev-notes/:storage`;
 */
devNotesRouter.post("/:storage", (req, res) => {
  const storageKind = req.params.storage ?? null;
  const body = readObjectBody(req);

  const message = createDevNote({
    ...body,
    storageKind,
  });

  return returnCodes(res, message);
});

/**
 * Replaces one dev-note in the selected storage target.
 *
 * Body shape:
 *
 * - Name: required string
 * - Comment: optional string
 *
 * @example
 *   `PUT /api/dev-notes/:storage/:id`;
 */
devNotesRouter.put("/:storage/:id", (req, res) => {
  const storageKind = req.params.storage ?? null;
  const idQuery = req.params.id ?? null;
  const body = readObjectBody(req);

  const message = replaceDevNote({
    ...body,
    storageKind,
    id: idQuery,
  });

  return returnCodes(res, message);
});

/**
 * Updates one dev-note in the selected storage target.
 *
 * Body shape:
 *
 * - Name: optional string
 * - Comment: optional string
 * - LastConfirmedInteraction: optional string
 *
 * At least one update field must be present.
 *
 * @example
 *   `PATCH /api/dev-notes/:storage/:id`;
 */
devNotesRouter.patch("/:storage/:id", (req, res) => {
  const storageKind = req.params.storage ?? null;
  const idQuery = req.params.id ?? null;
  const body = readObjectBody(req);

  const message = updateDevNote({
    ...body,
    storageKind,
    id: idQuery,
  });

  return returnCodes(res, message);
});

/**
 * Deletes one dev-note from the selected storage target.
 *
 * @example
 *   `DELETE /api/dev-notes/:storage/:id`;
 */
devNotesRouter.delete("/:storage/:id", (req, res) => {
  const storageKind = req.params.storage ?? null;
  const idQuery = req.params.id ?? null;

  const message = deleteDevNote({
    storageKind,
    id: idQuery,
  });

  return returnCodes(res, message);
});

export default devNotesRouter;
