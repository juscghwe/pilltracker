import { Router } from "express";

import healthRouter from "./health.routes.js";
import devNotesRouter from "./dev-notes.routes.js";
import { appConfig } from "../config/appConfig.js";

/**
 * Root API router mounted below `/api`.
 *
 * @type {import("express").Router}
 */
const router = Router();

router.use("/health", healthRouter);

// TODO: check wether here or if check within router or seam adapter is enough (primate: SSOT of appconfig, as limited as possible usage outside deep implementation)
if (appConfig.devNotes.enabled) {
  router.use("/dev-notes", devNotesRouter);
}

export default router;
