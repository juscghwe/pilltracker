import { Router } from "express";
import { apiRoutes } from "../constants/apiRoutes.js";

import dbHealthRouter from "./dbHealth.js";
import healthRouter from "./health.js";

const router = Router();

router.use(apiRoutes.databaseHealth, dbHealthRouter);
router.use(apiRoutes.health, healthRouter);

export default router;
