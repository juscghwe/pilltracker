import { Router } from "express";

import healthRouter from "./health.routes.js";
import devNotesRouter from "./dev-notes.routes.js";

/**
 * Root API router mounted below `/api`.
 *
 * @type {import("express").Router}
 */
const router = Router();

router.use("/health", healthRouter);
router.use("/dev-notes", devNotesRouter);

export default router;
