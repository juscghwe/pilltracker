/**
 * @typedef {object} AppErrorOptions
 * @property {string} code Stable machine-readable error code.
 * @property {object} [details] Structured diagnostic details.
 * @property {Error} [cause] Original lower-level error.
 */

/** Base application error with a stable machine-readable code. */
export class AppError extends Error {
  /**
   * @param {string} message Human-readable error message.
   * @param {AppErrorOptions} options Error options.
   */
  constructor(message, { code, details = {}, cause }) {
    super(message, { cause });

    this.name = new.target.name;
    this.code = code;
    this.details = Object.freeze(details);

    Error.captureStackTrace?.(this, new.target);
  }
}
