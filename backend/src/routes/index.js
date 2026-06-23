import { Router } from "express";

import dbHealthRouter from "./dbHealth.js";
import healthRouter from "./health.js";

const router = Router();

router.use("/health/db", dbHealthRouter);
router.use("/health", healthRouter);

export default router;
