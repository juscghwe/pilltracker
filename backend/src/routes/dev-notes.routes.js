/** @typedef {"persistent" | "temp"} DevNotesStorageKind */

/**
 * @typedef {object} DevNotesStorageTarget
 * @property {DevNotesStorageKind} kind Public route storage kind.
 * @property {string} adapterPath Concrete adapter path/key used by the dev-notes data layer.
 */

import { Router } from "express";

const devNotesRouter = Router();

// TODO: refactor into adapter and load from appConfig
/**
 * Storage targets accepted by dev-notes routes.
 *
 * @type {Readonly<Record<DevNotesStorageKind, DevNotesStorageTarget>>}
 */
const devNotesStorageTargets = Object.freeze({
  persistent: Object.freeze({
    kind: "persistent",
    adapterPath: "persistent",
  }),

  temp: Object.freeze({
    kind: "temp",
    adapterPath: "temp",
  }),
});

/**
 * Resolves a route storage value to a known dev-notes storage target.
 *
 * @param {string} storage Raw route storage parameter.
 * @returns {DevNotesStorageTarget | null} Matching storage target, or null when unsupported.
 */
function resolveDevNotesStorageTarget(storage) {
  return devNotesStorageTargets[storage] ?? null;
}

/**
 * Validates and stores the dev-notes storage target for later route handlers.
 *
 * @param {import("express").Request} _req Express request.
 * @param {import("express").Response} res Express response.
 * @param {import("express").NextFunction} next Express next callback.
 * @param {string} storage Raw `:storage` route parameter.
 * @returns {void}
 */
function resolveDevNotesStorageParam(_req, res, next, storage) {
  const storageTarget = resolveDevNotesStorageTarget(storage);

  if (!storageTarget) {
    res.status(404).json({
      error: "Unknown dev-notes storage target",
      storage,
      allowedValues: Object.keys(devNotesStorageTargets),
    });
    return;
  }

  res.locals.devNotesStorageTarget = storageTarget;
  next();
}

/**
 * Returns the resolved dev-notes storage target for the current response.
 *
 * @param {import("express").Response} res Express response.
 * @returns {DevNotesStorageTarget} Resolved dev-notes storage target.
 */
function getDevNotesStorageTarget(res) {
  return res.locals.devNotesStorageTarget;
}

devNotesRouter.param("storage", resolveDevNotesStorageParam);

/**
 * Lists all dev notes from the selected storage target.
 *
 * @example
 *   `GET /api/dev-notes/:storage`;
 */
devNotesRouter.get("/:storage", (_req, res) => {
  const storageTarget = getDevNotesStorageTarget(res);

  res.status(501).json({
    message: "List dev notes is not implemented yet",
    storage: storageTarget.kind,
    adapterPath: storageTarget.adapterPath,
  });
});

/**
 * Reads one dev note from the selected storage target.
 *
 * @example
 *   `GET /api/dev-notes/:storage/:id`;
 */
devNotesRouter.get("/:storage/:id", (req, res) => {
  const storageTarget = getDevNotesStorageTarget(res);

  res.status(501).json({
    message: "Read dev note is not implemented yet",
    storage: storageTarget.kind,
    adapterPath: storageTarget.adapterPath,
    id: req.params.id,
  });
});

/**
 * Creates one dev note in the selected storage target.
 *
 * @example
 *   `POST /api/dev-notes/:storage`;
 */
devNotesRouter.post("/:storage", (_req, res) => {
  const storageTarget = getDevNotesStorageTarget(res);

  res.status(501).json({
    message: "Create dev note is not implemented yet",
    storage: storageTarget.kind,
    adapterPath: storageTarget.adapterPath,
  });
});

/**
 * Replaces one dev note in the selected storage target.
 *
 * @example
 *   `PUT /api/dev-notes/:storage/:id`;
 */
devNotesRouter.put("/:storage/:id", (req, res) => {
  const storageTarget = getDevNotesStorageTarget(res);

  res.status(501).json({
    message: "Replace dev note is not implemented yet",
    storage: storageTarget.kind,
    adapterPath: storageTarget.adapterPath,
    id: req.params.id,
  });
});

/**
 * Updates one dev note in the selected storage target.
 *
 * @example
 *   `PATCH /api/dev-notes/:storage/:id`;
 */
devNotesRouter.patch("/:storage/:id", (req, res) => {
  const storageTarget = getDevNotesStorageTarget(res);

  res.status(501).json({
    message: "Update dev note is not implemented yet",
    storage: storageTarget.kind,
    adapterPath: storageTarget.adapterPath,
    id: req.params.id,
  });
});

/**
 * Deletes one dev note from the selected storage target.
 *
 * @example
 *   `DELETE /api/dev-notes/:storage/:id`;
 */
devNotesRouter.delete("/:storage/:id", (req, res) => {
  const storageTarget = getDevNotesStorageTarget(res);

  res.status(501).json({
    message: "Delete dev note is not implemented yet",
    storage: storageTarget.kind,
    adapterPath: storageTarget.adapterPath,
    id: req.params.id,
  });
});

export default devNotesRouter;
