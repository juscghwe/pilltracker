/**
 * Backend health route options for dev-notes health.
 *
 * @typedef {object} BackendDevNotesHealthOptions
 * @property {boolean} [includeDetails] Return full dev-notes health when true.
 */

import { getDevNotesHealth, getDevNotesHealthPartial } from "../dev-notes/index.js";

/**
 * Returns dev-notes health for backend health routes.
 *
 * @param {BackendDevNotesHealthOptions} [options] Health options.
 * @returns {Readonly<
 *   | import("../dev-notes/resource/types.js").DevNotesHealthResult
 *   | import("../dev-notes/resource/types.js").DevNotesPartialHealthResult
 * >}
 *   Dev-notes health result.
 */
export function getBackendDevNotesHealth(options = {}) {
  if (options.includeDetails) {
    return getDevNotesHealth();
  }

  return getDevNotesHealthPartial();
}

/**
 * Returns condensed dev-notes health for backend-wide health summary.
 *
 * @returns {Readonly<import("../dev-notes/resource/types.js").DevNotesPartialHealthResult>}
 *   Partial dev-notes health result.
 */
export function getBackendDevNotesHealthPartial() {
  return getDevNotesHealthPartial();
}
