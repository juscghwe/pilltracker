import { Router } from "express";

import db from "../db/connection.js";

const dbHealthRouter = Router();

dbHealthRouter.get("/", (_req, res) => {
  const result = db.prepare("SELECT 1").get();

  res.status(200).json({
    status: "ok",
    database: {
      status: result.ok === 1 ? "healthy" : "unhealthy",
      driver: "sqlite3",
      pathConfigured: Boolean(process.env.DB_PATH),
    },
    timestamp: new Date().toISOString(),
  });
});

export default dbHealthRouter;
