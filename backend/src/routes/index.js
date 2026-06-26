import { Router } from "express";

import healthRouter from "./health.routes.js";

/**
 * Root API router mounted below `/api`.
 *
 * @type {import("express").Router}
 */
const router = Router();

router.use("/health", healthRouter);

export default router;
