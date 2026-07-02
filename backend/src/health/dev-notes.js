import { getDevNotesHealth, getDevNotesHealthPartial } from "../dev-notes/index.js";

/**
 * Returns dev-notes health for backend health routes.
 *
 * @param {object} [options] Health options.
 * @param {boolean} [options.includeDetails] Return full dev-notes health when true.
 * @returns {Readonly<object>} Dev-notes health result.
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
 * @returns {Readonly<object>} Partial dev-notes health result.
 */
export function getBackendDevNotesHealthPartial() {
  return getDevNotesHealthPartial();
}
