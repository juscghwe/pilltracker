/**
 * Escapes special SQLite LIKE wildcard characters in a user-provided search fragment.
 *
 * @param {string} value Raw search fragment.
 * @returns {string} LIKE-safe search fragment.
 */
export function escapeSqlLikePattern(value) {
  return value.replace(/[\\%_]/g, "\\$&");
}
