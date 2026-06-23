import { Router } from "express";

import appDatabase from "../db/connection.js";

const dbHealthRouter = Router();

dbHealthRouter.get("/", (_req, res) => {
  const [result, version] = appDatabase.prepare("SELECT 1, sqlite_version() AS ok, version").get();

  res.status(200).json({
    status: "ok",
    database: {
      status: result.ok === 1 ? "healthy" : "unhealthy",
      engine: {
        name: "sqlite", // TODO: This should be dynamic based on the database engine used
        version: version.version,
      },
      driver: {
        name: "better-sqlite3", // TODO: This should be dynamic based on the database driver used
      },
      mode: appDatabase.pragma("journal_mode"),
      path: {
        Configured: Boolean(process.env.DB_PATH),
        Path: process.env.DB_PATH || "Not Configured",
      },
    },
    timestamp: new Date().toISOString(),
  });
});

export default dbHealthRouter;
