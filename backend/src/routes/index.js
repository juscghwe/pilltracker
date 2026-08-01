import { Router } from "express";

import { appConfig } from "../config/appConfig.js";
import devNotesRouter from "../dev-notes/index.js";
import healthRouter from "./health.routes.js";

/**
 * Root API router mounted below `/api`.
 *
 * @type {import("express").Router}
 */
const router = Router();

router.use("/health", healthRouter);

if (appConfig.devNotes.enabled) {
  router.use("/dev-notes", devNotesRouter);
}

export default router;
