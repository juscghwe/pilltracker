/** Base application error with a stable machine-readable code. */
export class AppError extends Error {
  /**
   * @param {string} message Human-readable error message.
   * @param {object} options Error options.
   * @param {string} options.code Stable machine-readable error code.
   * @param {object} [options.details] Structured diagnostic details.
   * @param {Error} [options.cause] Original lower-level error.
   */
  constructor(message, { code, details = {}, cause } = {}) {
    super(message, { cause });

    this.name = new.target.name;
    this.code = code;
    this.details = Object.freeze(details);

    Error.captureStackTrace?.(this, new.target);
  }
}
