import { Router } from "express";

const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "pilltracker-api",
    database: "not_checked", // TODO: Implement with work-packet #38
    timestamp: new Date().toISOString(),
  });
});

export default healthRouter;
