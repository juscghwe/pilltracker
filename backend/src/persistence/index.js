import { appConfig } from "../config/appConfig.js";
import { createSqlitePartialHealthReporter } from "../sqlite/health-partial.js";
import { sqliteFileAdapter as betterSqliteAdapter } from "./adapters/better-sqlite3/index.js";

const getHealthPartial = createSqlitePartialHealthReporter({
  adapterId: "better-sqlite3",
  databasePath: appConfig.app.persistence.path,
  getConnection: betterSqliteAdapter.getConnection,
});

/**
 * Active persistence adapter used by backend modules.
 *
 * Consumers should import this adapter seam instead of importing concrete adapter modules directly.
 */
export const persistenceAdapter = Object.freeze({
  ...betterSqliteAdapter,
  getHealthPartial,
});
