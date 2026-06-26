import { Router } from "express";

import { getHealthSummary } from "../health/summary.js";
import { getRuntimeHealth } from "../health/runtime.js";
import { getPersistenceHealth } from "../health/persistence.js";

/**
 * Express router exposing backend health endpoints.
 *
 * @type {import("express").Router}
 * @see ./README.md#health-routes
 */
const healthRouter = Router();

/** Summarizes the entire backend health status in health statements only */
healthRouter.get("/", (_req, res) => {
  const health = getHealthSummary();

  res.status(health.status === "healthy" ? 200 : 503).json({
    ...health,
    timestamp: new Date().toISOString(),
  });
});

/** Runtime health: Node.js server reachable */
healthRouter.get("/runtime", (_req, res) => {
  const health = getRuntimeHealth();

  res.status(200).json({
    ...health,
    timestamp: new Date().toISOString(),
  });
});

/** Persistence health: SQLite DBs reachable */
healthRouter.get("/persistence", (req, res) => {
  const includeDetails = req.query.details === "full";

  const health = getPersistenceHealth({ includeDetails });

  res.status(health.status === "healthy" ? 200 : 503).json({
    ...health,
    timestamp: new Date().toISOString(),
  });
});

export default healthRouter;
