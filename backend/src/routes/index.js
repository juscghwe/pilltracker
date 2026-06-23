import { Router } from "express";
import { apiRoutes } from "../../constantRoutes.js";

import dbHealthRouter from "./dbHealth.js";
import healthRouter from "../backend/health.js";

const router = Router();

router.use(apiRoutes.databaseHealth, dbHealthRouter);
router.use(apiRoutes.health, healthRouter);

export default router;
