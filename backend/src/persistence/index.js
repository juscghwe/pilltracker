import { persistenceAdapter as betterSqliteAdapter } from "./adapters/better-sqlite3/index.js";

/**
 * Active persistence adapter used by the backend.
 *
 * Backend modules should import this export instead of importing a concrete adapter implementation directly to avoid silent switches and fails.
 * Switching the persistence backend should happen here, not in consumers.
 */
export const persistenceAdapter = betterSqliteAdapter;
