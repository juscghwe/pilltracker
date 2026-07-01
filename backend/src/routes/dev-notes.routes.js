import { Router } from "express";
import {
  listDevNotes,
  getDevNoteById,
  searchDevNotesByText,
  createDevNote,
  replaceDevNote,
  updateDevNote,
  deleteDevNote,
} from "../dev-notes/index.js";

const devNotesRouter = Router();

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

    case "no-content": // TODO: not yet implemented in dev-notes CRUD
      res.status(204).end();
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
      res.status(500).json({
        ok: false,
        status: "unknown-result-status",
        message: `Unhandled result status: ${message.status}`,
      });
  }
}

// TODO: add head

devNotesRouter.options("/:storage", (_req, res) => {
  res.set("Allow", "GET, POST, OPTIONS");
  return res.status(204).end();
});

devNotesRouter.options("/:storage/:id", (_req, res) => {
  res.set("Allow", "GET, HEAD, PUT, PATCH, DELETE, OPTIONS");
  return res.status(204).end();
});

/**
 * Lists all dev notes from the selected storage target. OR Searches dev notes by text from the
 * selected storage target.
 *
 * @example
 *   `GET /api/dev-notes/:storage`;
 *
 * @example
 *   `GET /api/dev-notes/:storage?text=search`;
 */
devNotesRouter.get("/:storage", (req, res) => {
  const storageKind = req.params.storage ?? null;
  const textQuery = req.body.text ?? null;
  let message;

  if (typeof textQuery === "string") {
    // GET /:storage?text=search
    message = searchDevNotesByText({ storageKind: storageKind, text: textQuery });
  } else {
    // GET /:storage
    message = listDevNotes({ storageKind });
  }

  return returnCodes(res, message);
});

/**
 * Reads one dev note from the selected storage target.
 *
 * @example
 *   `GET /api/dev-notes/:storage/:id`;
 */
devNotesRouter.get("/:storage/:id", (req, res) => {
  const storageKind = req.params.storage ?? null;
  const idQuery = req.params.id;

  const message = getDevNoteById({ storageKind: storageKind, id: idQuery });

  return returnCodes(res, message);
});

/**
 * Creates one dev note in the selected storage target.
 *
 * @example
 *   `POST /api/dev-notes/:storage`;
 */
devNotesRouter.post("/:storage", (req, res) => {
  const storageKind = req.params.storage ?? null;
  const textQuery = req.body.text ?? null;

  const message = createDevNote({ storageKind: storageKind, text: textQuery });

  return returnCodes(res, message);
});

/**
 * Replaces one dev note in the selected storage target.
 *
 * @example
 *   `PUT /api/dev-notes/:storage/:id`;
 */
devNotesRouter.put("/:storage/:id", (req, res) => {
  const storageKind = req.params.storage ?? null;
  const idQuery = req.params.id ?? null;
  const textQuery = req.body.text ?? null;

  const message = replaceDevNote({ storageKind: storageKind, id: idQuery, text: textQuery });

  return returnCodes(res, message);
});

/**
 * Updates one dev note in the selected storage target.
 *
 * @example
 *   `PATCH /api/dev-notes/:storage/:id`;
 */
devNotesRouter.patch("/:storage/:id", (req, res) => {
  const storageKind = req.params.storage ?? null;
  const idQuery = req.params.id ?? null;
  const textQuery = req.body.text ?? null;

  const message = updateDevNote({ storageKind: storageKind, id: idQuery, text: textQuery });

  return returnCodes(res, message);
});

/**
 * Deletes one dev note from the selected storage target.
 *
 * @example
 *   `DELETE /api/dev-notes/:storage/:id`;
 */
devNotesRouter.delete("/:storage/:id", (req, res) => {
  const storageKind = req.params.storage ?? null;
  const idQuery = req.params.id ?? null;

  const message = deleteDevNote({ storageKind: storageKind, id: idQuery });

  return returnCodes(res, message);
});

export default devNotesRouter;
