/**
 * JSON API response wrapper used by frontend API connector helpers.
 *
 * @typedef {object} JsonHttpResult
 * @property {boolean} ok Whether the response status is in the 200-299 range.
 * @property {number} status HTTP response status code.
 * @property {string} path Requested API path.
 * @property {unknown} body Parsed JSON response body.
 */

/**
 * Raw API response wrapper for diagnostic/debug views.
 *
 * @typedef {object} ApiDebugResult
 * @property {boolean} ok Whether the HTTP response status is in the 200-299 range.
 * @property {number} status HTTP response status code.
 * @property {string} path Requested API path.
 * @property {string} contentType Response content type header value.
 * @property {"json" | "text"} bodyKind Parsed response body kind.
 * @property {unknown} body Parsed JSON body or raw text body.
 * @property {string} rawBody Unmodified response body text.
 * @property {string | null} parseError JSON parse error message when parsing failed.
 */

export {};
