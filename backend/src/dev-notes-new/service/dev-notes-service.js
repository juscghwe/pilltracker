/**
 * Dev-notes use-case orchestration.
 *
 * The service validates raw use-case input, resolves a configured repository target, invokes one
 * repository capability, and converts repository output into stable service results.
 */

import { assertDevNotesRepository } from "../repository/repository-port.js";
import { readResourceCommand } from "../validation/command-validation.js";
import {
  createListResult,
  createOperationFailedResult,
  createSingleResult,
  createStorageDisabledResult,
  createUnknownStorageResult,
} from "./result-builders.js";

/**
 * @typedef {object} CreateDevNotesServiceInput
 * @property {boolean} enabled Whether the dev-notes feature is enabled.
 * @property {import("../resource/types.js").ResourceDefinition} resource Resource contract.
 * @property {Readonly<Record<import("../resource/types.js").ResourceOperationName, import("../resource/types.js").ResourceOperationPolicy>>} operations Operation policies.
 * @property {Readonly<Record<import("../resource/types.js").DevNotesStorageKind, import("../resource/types.js").DevNotesStorageTarget>>} storageTargets Storage registry.
 */

/**
 * @param {unknown} rawStorageKind Raw storage kind.
 * @returns {string} Normalized storage label.
 */
function normalizeStorageKind(rawStorageKind) {
  if (rawStorageKind === null || rawStorageKind === undefined) {
    return "";
  }

  return String(rawStorageKind).trim();
}

/**
 * @param {import("../resource/types.js").ResourceCommand} command Validated command.
 * @returns {number} Required id.
 */
function readValidatedId(command) {
  if (command.id === null) {
    throw new TypeError(`Validated ${command.operation} command is missing its required id.`);
  }

  return command.id;
}

/**
 * Creates the dev-notes service against injected repository targets.
 *
 * @param {CreateDevNotesServiceInput} input Composition input.
 * @returns {Readonly<{
 *   resolveStorageTarget: (rawStorageKind: unknown) => Readonly<{ok: true; storageKind: import("../resource/types.js").DevNotesStorageKind; storageTarget: import("../resource/types.js").DevNotesStorageTarget}> | Readonly<import("../resource/types.js").DevNotesBaseResult>;
 *   listDevNotes: (input: {storageKind: unknown; query?: unknown; body?: unknown}) => import("../resource/types.js").DevNotesServiceResult;
 *   getDevNoteById: (input: {storageKind: unknown; id: unknown; query?: unknown; body?: unknown}) => import("../resource/types.js").DevNotesServiceResult;
 *   searchDevNotesByText: (input: {storageKind: unknown; query: unknown; body?: unknown}) => import("../resource/types.js").DevNotesServiceResult;
 *   createDevNote: (input: {storageKind: unknown; body: unknown; query?: unknown}) => import("../resource/types.js").DevNotesServiceResult;
 *   replaceDevNote: (input: {storageKind: unknown; id: unknown; body: unknown; query?: unknown}) => import("../resource/types.js").DevNotesServiceResult;
 *   updateDevNote: (input: {storageKind: unknown; id: unknown; body: unknown; query?: unknown}) => import("../resource/types.js").DevNotesServiceResult;
 *   deleteDevNote: (input: {storageKind: unknown; id: unknown; query?: unknown; body?: unknown}) => import("../resource/types.js").DevNotesServiceResult;
 *   optionsStorageOnly: () => Readonly<{Allow: string}>;
 *   optionsStorageAndId: () => Readonly<{Allow: string}>;
 * }>} Dev-notes service.
 */
export function createDevNotesService(input) {
  for (const [storageKind, storageTarget] of Object.entries(input.storageTargets)) {
    assertDevNotesRepository(storageTarget.repository, `${storageKind} dev-notes repository`);
  }

  /**
   * @param {unknown} rawStorageKind Raw storage kind.
   * @returns {Readonly<{ok: true; storageKind: import("../resource/types.js").DevNotesStorageKind; storageTarget: import("../resource/types.js").DevNotesStorageTarget}> | Readonly<import("../resource/types.js").DevNotesBaseResult>} Resolution.
   */
  function resolveStorageTarget(rawStorageKind) {
    if (!input.enabled) {
      return createStorageDisabledResult("dev-notes");
    }

    const storageKind = normalizeStorageKind(rawStorageKind);

    if (!Object.hasOwn(input.storageTargets, storageKind)) {
      return createUnknownStorageResult(storageKind);
    }

    const knownStorageKind = /** @type {import("../resource/types.js").DevNotesStorageKind} */ (
      storageKind
    );
    const storageTarget = input.storageTargets[knownStorageKind];

    if (!storageTarget.config.enabled) {
      return createStorageDisabledResult(knownStorageKind);
    }

    return Object.freeze({ ok: true, storageKind: knownStorageKind, storageTarget });
  }

  /**
   * @param {unknown} storageKind Raw storage kind.
   * @param {(repository: import("../resource/types.js").DevNotesRepository) => import("../resource/types.js").DevNotesServiceResult} operation Repository action.
   * @returns {import("../resource/types.js").DevNotesServiceResult} Result.
   */
  function runStorageOperation(storageKind, operation) {
    const resolved = resolveStorageTarget(storageKind);

    if (!("storageTarget" in resolved)) {
      return resolved;
    }

    try {
      return operation(resolved.storageTarget.repository);
    } catch {
      return createOperationFailedResult("Dev-note storage operation failed.");
    }
  }

  /** @param {{storageKind: unknown; query?: unknown; body?: unknown}} operationInput */
  function listDevNotes(operationInput) {
    const validation = readResourceCommand({
      resource: input.resource,
      operation: input.operations.list,
      rawInput: { query: operationInput.query, body: operationInput.body },
    });

    if (!validation.ok) {
      return validation;
    }

    return runStorageOperation(operationInput.storageKind, function list(repository) {
      return createListResult(repository.list());
    });
  }

  /** @param {{storageKind: unknown; id: unknown; query?: unknown; body?: unknown}} operationInput */
  function getDevNoteById(operationInput) {
    const validation = readResourceCommand({
      resource: input.resource,
      operation: input.operations.getById,
      rawInput: { id: operationInput.id, query: operationInput.query, body: operationInput.body },
    });

    if (!validation.ok) {
      return validation;
    }

    const id = readValidatedId(validation.value);
    return runStorageOperation(operationInput.storageKind, function getById(repository) {
      return createSingleResult(repository.getById(id));
    });
  }

  /** @param {{storageKind: unknown; query: unknown; body?: unknown}} operationInput */
  function searchDevNotesByText(operationInput) {
    const validation = readResourceCommand({
      resource: input.resource,
      operation: input.operations.search,
      rawInput: { query: operationInput.query, body: operationInput.body },
    });

    if (!validation.ok) {
      return validation;
    }

    const text = validation.value.values.text;

    if (typeof text !== "string") {
      return createOperationFailedResult("Validated dev-note search text is invalid.");
    }

    return runStorageOperation(operationInput.storageKind, function search(repository) {
      return createListResult(repository.search(text));
    });
  }

  /** @param {{storageKind: unknown; body: unknown; query?: unknown}} operationInput */
  function createDevNote(operationInput) {
    const validation = readResourceCommand({
      resource: input.resource,
      operation: input.operations.create,
      rawInput: { body: operationInput.body, query: operationInput.query },
    });

    if (!validation.ok) {
      return validation;
    }

    return runStorageOperation(operationInput.storageKind, function create(repository) {
      const note = repository.create(validation.value.values);
      return note
        ? createSingleResult(note, "created")
        : createOperationFailedResult("Dev-note could not be created.");
    });
  }

  /** @param {{storageKind: unknown; id: unknown; body: unknown; query?: unknown}} operationInput */
  function replaceDevNote(operationInput) {
    const validation = readResourceCommand({
      resource: input.resource,
      operation: input.operations.replace,
      rawInput: { id: operationInput.id, body: operationInput.body, query: operationInput.query },
    });

    if (!validation.ok) {
      return validation;
    }

    const id = readValidatedId(validation.value);
    return runStorageOperation(operationInput.storageKind, function replace(repository) {
      return createSingleResult(repository.replace(id, validation.value.values), "replaced");
    });
  }

  /** @param {{storageKind: unknown; id: unknown; body: unknown; query?: unknown}} operationInput */
  function updateDevNote(operationInput) {
    const validation = readResourceCommand({
      resource: input.resource,
      operation: input.operations.update,
      rawInput: { id: operationInput.id, body: operationInput.body, query: operationInput.query },
    });

    if (!validation.ok) {
      return validation;
    }

    const id = readValidatedId(validation.value);
    return runStorageOperation(operationInput.storageKind, function update(repository) {
      return createSingleResult(
        repository.update(id, validation.value.values, validation.value.providedFields),
        "updated",
      );
    });
  }

  /** @param {{storageKind: unknown; id: unknown; query?: unknown; body?: unknown}} operationInput */
  function deleteDevNote(operationInput) {
    const validation = readResourceCommand({
      resource: input.resource,
      operation: input.operations.delete,
      rawInput: { id: operationInput.id, query: operationInput.query, body: operationInput.body },
    });

    if (!validation.ok) {
      return validation;
    }

    const id = readValidatedId(validation.value);
    return runStorageOperation(operationInput.storageKind, function remove(repository) {
      return createSingleResult(repository.delete(id), "deleted");
    });
  }

  function optionsStorageOnly() {
    return Object.freeze({ Allow: "GET, POST, OPTIONS" });
  }

  function optionsStorageAndId() {
    return Object.freeze({ Allow: "GET, PUT, PATCH, DELETE, OPTIONS" });
  }

  return Object.freeze({
    resolveStorageTarget,
    listDevNotes,
    getDevNoteById,
    searchDevNotesByText,
    createDevNote,
    replaceDevNote,
    updateDevNote,
    deleteDevNote,
    optionsStorageOnly,
    optionsStorageAndId,
  });
}
