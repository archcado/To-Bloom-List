import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (request, response) => {
  response.json({
    status: "ok",
    service: "to-bloom-list-backend",
    version: "0.2.0",
  });
});
