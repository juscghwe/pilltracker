/**
 * Runtime vocabulary and guard for the repository capability boundary.
 *
 * The service consumes this interface. SQLite is one implementation, not part of the interface.
 */

/** @type {readonly (keyof import("../resource/types.js").DevNotesRepository)[]} */
export const devNotesRepositoryMethods = Object.freeze([
  "list",
  "getById",
  "search",
  "create",
  "replace",
  "update",
  "delete",
  "getHealth",
]);

/**
 * Fails fast when composition wiring does not satisfy the repository port.
 *
 * @param {unknown} repository Candidate repository.
 * @param {string} [label="dev-notes repository"] Diagnostic label. Default is `"dev-notes
 *   repository"`. Default is `"dev-notes repository"`
 * @returns {asserts repository is import("../resource/types.js").DevNotesRepository}
 */
export function assertDevNotesRepository(repository, label = "dev-notes repository") {
  if (typeof repository !== "object" || repository === null) {
    throw new TypeError(`${label} must be an object.`);
  }

  for (const method of devNotesRepositoryMethods) {
    if (typeof (/** @type {Record<string, unknown>} */ (repository)[method]) !== "function") {
      throw new TypeError(`${label} must implement ${method}().`);
    }
  }
}
