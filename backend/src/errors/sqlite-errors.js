import { AppError } from "./app-errors.js";

/** Error thrown when SQLite reports a different active journal mode than requested. */
export class SqliteJournalModeMismatchError extends AppError {
  /**
   * @param {object} input Mismatch input.
   * @param {string} input.requestedJournalMode Requested SQLite journal mode.
   * @param {string} input.activeJournalMode Active SQLite journal mode reported by SQLite.
   * @param {string} input.moduleName Module or adapter where the mismatch occurred.
   */
  constructor(input) {
    super(
      `SQLite journal mode mismatch in ${input.moduleName}: requested ${input.requestedJournalMode}, active ${input.activeJournalMode}`,
      {
        code: "SQLITE_JOURNAL_MODE_MISMATCH",
        details: {
          requestedJournalMode: input.requestedJournalMode,
          activeJournalMode: input.activeJournalMode,
          moduleName: input.moduleName,
        },
      },
    );
  }
}
