/**
 * Row returned by the dev-notes seed count query.
 *
 * @typedef {object} DevNotesCountRow
 * @property {number} count Existing dev-note count.
 */

/**
 * Inserts demo dev-notes for manual development.
 *
 * Modes:
 *
 * - `when-empty`: insert demo notes only if the table is empty.
 * - `maintain-minimum`: insert missing demo notes until at least `count` rows exist.
 *
 * @param {import("better-sqlite3").Database} connection SQLite connection.
 * @param {object} [options] Seed options.
 * @param {number} [options.count] Number of demo notes to create or maintain.
 * @param {"when-empty" | "maintain-minimum"} [options.mode] Seed behavior.
 * @returns {void}
 */
export function seedDevNotes(connection, { count = 10, mode = "when-empty" } = {}) {
  const existing = /** @type {DevNotesCountRow | undefined} */ (
    connection
      .prepare(
        `
        SELECT COUNT(*) AS count
        FROM dev_notes_temp
      `,
      )
      .get()
  );

  const existingCount = existing?.count ?? 0;

  if (mode === "when-empty" && existingCount > 0) {
    return;
  }

  if (mode === "maintain-minimum" && existingCount >= count) {
    return;
  }

  const insertNote = connection.prepare(
    `
      INSERT INTO dev_notes_temp (
        name_temp,
        comment_temp,
        created_at,
        updated_at
      )
      VALUES (
        @nameTemp,
        @commentTemp,
        @createdAt,
        @updatedAt
      )
    `,
  );

  const insertMany = connection.transaction(() => {
    const now = new Date().toISOString();
    const firstIndex = mode === "maintain-minimum" ? existingCount + 1 : 1;

    for (let index = firstIndex; index <= count; index += 1) {
      insertNote.run({
        nameTemp: `Demo temp note ${index}`,
        commentTemp: "Generated through seed.",
        createdAt: now,
        updatedAt: now,
      });
    }
  });

  insertMany();
}
