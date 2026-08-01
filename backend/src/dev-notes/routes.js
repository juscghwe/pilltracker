/** Express adapter for the composed dev-notes service. */

import { Router } from "express";

/**
 * @typedef {object} DevNotesRouteService
 * @property {(input: {
 *   storageKind: unknown;
 *   query?: unknown;
 *   body?: unknown;
 * }) => import("./resource/types.js").DevNotesServiceResult} listDevNotes
 * @property {(input: {
 *   storageKind: unknown;
 *   id: unknown;
 *   query?: unknown;
 *   body?: unknown;
 * }) => import("./resource/types.js").DevNotesServiceResult} getDevNoteById
 * @property {(input: {
 *   storageKind: unknown;
 *   query: unknown;
 *   body?: unknown;
 * }) => import("./resource/types.js").DevNotesServiceResult} searchDevNotesByText
 * @property {(input: {
 *   storageKind: unknown;
 *   body: unknown;
 *   query?: unknown;
 * }) => import("./resource/types.js").DevNotesServiceResult} createDevNote
 * @property {(input: {
 *   storageKind: unknown;
 *   id: unknown;
 *   body: unknown;
 *   query?: unknown;
 * }) => import("./resource/types.js").DevNotesServiceResult} replaceDevNote
 * @property {(input: {
 *   storageKind: unknown;
 *   id: unknown;
 *   body: unknown;
 *   query?: unknown;
 * }) => import("./resource/types.js").DevNotesServiceResult} updateDevNote
 * @property {(input: {
 *   storageKind: unknown;
 *   id: unknown;
 *   query?: unknown;
 *   body?: unknown;
 * }) => import("./resource/types.js").DevNotesServiceResult} deleteDevNote
 * @property {() => Readonly<{ Allow: string }>} optionsStorageOnly
 * @property {() => Readonly<{ Allow: string }>} optionsStorageAndId
 */

/**
 * Sends a service result with its HTTP transport status.
 *
 * @param {import("express").Response} response Express response.
 * @param {import("./resource/types.js").DevNotesServiceResult} result Service result.
 * @returns {import("express").Response} Express response.
 */
function sendResult(response, result) {
  switch (result.status) {
    case "ok":
    case "replaced":
    case "updated":
    case "deleted":
      return response.status(200).json(result);
    case "created":
      return response.status(201).json(result);
    case "invalid-request":
      return response.status(400).json(result);
    case "not-found":
    case "unknown-storage":
    case "storage-disabled":
      return response.status(404).json(result);
    case "operation-failed":
      return response.status(500).json(result);
    default:
      throw new Error("Unhandled dev-notes service result status.");
  }
}

/**
 * Creates an isolated router. Composition belongs in `index.js`; application mounting stays outside
 * this module until the old proof-of-concept integration is intentionally replaced.
 *
 * @param {DevNotesRouteService} service Composed dev-notes service.
 * @returns {import("express").Router} Router.
 */
export function createDevNotesRouter(service) {
  const router = Router();

  router.options("/:storage", (_request, response) => {
    response.set(service.optionsStorageOnly());
    return response.status(204).end();
  });

  router.options("/:storage/:id", (_request, response) => {
    response.set(service.optionsStorageAndId());
    return response.status(204).end();
  });

  router.get("/:storage", (request, response) => {
    const baseInput = {
      storageKind: request.params.storage,
      query: request.query,
      body: request.body,
    };
    const result = Object.hasOwn(request.query, "text")
      ? service.searchDevNotesByText(baseInput)
      : service.listDevNotes(baseInput);

    return sendResult(response, result);
  });

  router.get("/:storage/:id", (request, response) =>
    sendResult(
      response,
      service.getDevNoteById({
        storageKind: request.params.storage,
        id: request.params.id,
        query: request.query,
        body: request.body,
      }),
    ),
  );

  router.post("/:storage", (request, response) =>
    sendResult(
      response,
      service.createDevNote({
        storageKind: request.params.storage,
        body: request.body,
        query: request.query,
      }),
    ),
  );

  router.put("/:storage/:id", (request, response) =>
    sendResult(
      response,
      service.replaceDevNote({
        storageKind: request.params.storage,
        id: request.params.id,
        body: request.body,
        query: request.query,
      }),
    ),
  );

  router.patch("/:storage/:id", (request, response) =>
    sendResult(
      response,
      service.updateDevNote({
        storageKind: request.params.storage,
        id: request.params.id,
        body: request.body,
        query: request.query,
      }),
    ),
  );

  router.delete("/:storage/:id", (request, response) =>
    sendResult(
      response,
      service.deleteDevNote({
        storageKind: request.params.storage,
        id: request.params.id,
        query: request.query,
        body: request.body,
      }),
    ),
  );

  return router;
}
