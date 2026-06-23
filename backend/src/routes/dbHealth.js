import { Router } from "express";

import appDatabase, { appDatabaseInfo } from "../db/connection.js";

const dbHealthRouter = Router();

dbHealthRouter.get("/", (_req, res) => {
  const result = appDatabase.prepare("SELECT 1 AS ok").get();
  const isHealthy = result.ok === 1;

  res.status(200).json({
    status: isHealthy ? "healthy" : "unhealthy",
    database: {
      engine: appDatabaseInfo.engine,
      driver: appDatabaseInfo.driver,
      mode: appDatabaseInfo.journalMode,
      pathConfigured: appDatabaseInfo.pathConfigured,
    },
    timestamp: new Date().toISOString(),
  });
});

export default dbHealthRouter;
