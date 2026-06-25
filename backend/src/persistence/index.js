import { persistenceAdapter as betterSqliteAdapter } from "./adapters/better-sqlite3/index.js";

/**
 * Active persistence adapter used by backend modules.
 *
 * Consumers should import this adapter seam instead of importing concrete adapter modules directly.
 *
 * @type {import("./adapters/better-sqlite3/index.js").persistenceAdapter}
 */
export const persistenceAdapter = betterSqliteAdapter;
