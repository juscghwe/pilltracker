/**
 * Public composition root for the rebuilt dev-notes M1 proof of concept.
 *
 * This file wires concrete storage implementations to the repository port and exposes stable module
 * entrypoints. It does not mount routes into the application; that integration remains an explicit
 * later replacement of the old module.
 */

import { appConfig, validSqliteJournalModes } from "../config/appConfig.js";
import { createDevNotesSqliteHealthReporter } from "./adapters/sqlite/sqlite-health.js";
import { createSqliteRepository } from "./adapters/sqlite/sqlite-repository.js";
import {
  getPersistentConnection,
  persistentConnectionMetadata,
} from "./adapters/sqlite/persistent/connection.js";
import { getTempConnection, tempConnectionMetadata } from "./adapters/sqlite/temp/connection.js";
import { createDevNotesHealth } from "./health/dev-notes-health.js";
import { devNotesResource } from "./resource/contract.js";
import { devNotesOperations } from "./resource/operations.js";
import { createDevNotesRouter } from "./routes.js";
import { createDevNotesService } from "./service/dev-notes-service.js";

export const devNotesStorageKinds = Object.freeze({
  temp: "temp",
  persistent: "persistent",
});

const getTempHealth = createDevNotesSqliteHealthReporter({
  ...tempConnectionMetadata,
  validJournalModes: validSqliteJournalModes,
  getConnection: getTempConnection,
  resource: devNotesResource,
});
const getPersistentHealth = createDevNotesSqliteHealthReporter({
  ...persistentConnectionMetadata,
  validJournalModes: validSqliteJournalModes,
  getConnection: getPersistentConnection,
  resource: devNotesResource,
});

export const tempDevNotesRepository = createSqliteRepository({
  resource: devNotesResource,
  getConnection: getTempConnection,
  getHealth: getTempHealth,
});
export const persistentDevNotesRepository = createSqliteRepository({
  resource: devNotesResource,
  getConnection: getPersistentConnection,
  getHealth: getPersistentHealth,
});

/**
 * @type {Readonly<
 *   Record<
 *     import("./resource/types.js").DevNotesStorageKind,
 *     import("./resource/types.js").DevNotesStorageTarget
 *   >
 * >}
 */
export const devNotesStorageTargets = Object.freeze({
  [devNotesStorageKinds.temp]: Object.freeze({
    config: appConfig.devNotes.storage.temp,
    repository: tempDevNotesRepository,
  }),
  [devNotesStorageKinds.persistent]: Object.freeze({
    config: appConfig.devNotes.storage.persistent,
    repository: persistentDevNotesRepository,
  }),
});

export const devNotesService = createDevNotesService({
  enabled: appConfig.devNotes.enabled,
  resource: devNotesResource,
  operations: devNotesOperations,
  storageTargets: devNotesStorageTargets,
});

export const devNotesHealth = createDevNotesHealth({
  enabled: appConfig.devNotes.enabled,
  storageTargets: devNotesStorageTargets,
});

export const devNotesRouter = createDevNotesRouter(devNotesService);

export const {
  listDevNotes,
  getDevNoteById,
  searchDevNotesByText,
  createDevNote,
  replaceDevNote,
  updateDevNote,
  deleteDevNote,
  optionsStorageOnly,
  optionsStorageAndId,
  resolveStorageTarget,
} = devNotesService;

export const { getDevNotesHealth, getDevNotesHealthPartial } = devNotesHealth;

export { devNotesResource, devNotesOperations };
export { createDevNotesRouter } from "./routes.js";
export { createDevNotesService } from "./service/dev-notes-service.js";
export { createSqliteRepository } from "./adapters/sqlite/sqlite-repository.js";
export { createDevNotesHealth } from "./health/dev-notes-health.js";

export default devNotesRouter;
