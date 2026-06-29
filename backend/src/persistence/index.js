import { sqliteFileAdapter as betterSqliteAdapter } from "./adapters/better-sqlite3/index.js";

/**
 * Active persistence adapter used by backend modules.
 *
 * Consumers should import this adapter seam instead of importing concrete adapter modules directly.
 */
export const persistenceAdapter = betterSqliteAdapter;
