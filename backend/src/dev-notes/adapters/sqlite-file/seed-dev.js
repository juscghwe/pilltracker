/**
 * Inserts demo dev-notes when the table is too small.
 *
 * @param {import("better-sqlite3").Database} connection SQLite connection.
 * @param {number} count Number of demo notes that should exist.
 * @returns {void}
 */
export function seedDevNotes(connection, count = 10) {
  const existing = connection
    .prepare(
      `
        SELECT COUNT(*) AS count
        FROM dev_notes
      `,
    )
    .get();

  if (existing.count > count) {
    return;
  }

  const insertNote = connection.prepare(
    `
      INSERT INTO dev_notes (
        text,
        created_at,
        updated_at
      )
      VALUES (
        @text,
        @createdAt,
        @updatedAt
      )
    `,
  );

  const insertMany = connection.transaction(() => {
    const now = new Date().toISOString();

    for (let index = 1; index <= count; index += 1) {
      insertNote.run({
        text: `Demo note ${index}`,
        createdAt: now,
        updatedAt: now,
      });
    }
  });

  insertMany();
}
