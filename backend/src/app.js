import cors from "cors";
import express from "express";
import { healthRouter } from "./routes/health.routes.js";
import { automationRouter } from "./routes/automation.routes.js";

export function createApp() {
  const app = express();
  const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5500";

  app.disable("x-powered-by");
  app.use(cors({ origin: allowedOrigin }));
  app.use(express.json({ limit: "100kb" }));
  app.use("/api/health", healthRouter);
  app.use("/api/automation", automationRouter);

  app.use((request, response) => {
    response.status(404).json({
      error: {
        code: "ROUTE_NOT_FOUND",
        message: `No route matches ${request.method} ${request.originalUrl}`,
      },
    });
  });

  return app;
}
