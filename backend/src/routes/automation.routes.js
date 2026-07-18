import { Router } from "express";
import {
  sendTaskEventToN8n,
  validateTaskAutomationEvent,
} from "../services/task-automation.service.js";

export const automationRouter = Router();

automationRouter.post("/task-events", async (request, response) => {
  const apiKey = process.env.AUTOMATION_API_KEY;
  if (!apiKey || !process.env.N8N_TASK_WEBHOOK_URL || !process.env.N8N_WEBHOOK_SECRET) {
    return response.status(503).json({ error: { code: "AUTOMATION_NOT_CONFIGURED", message: "n8n integration is disabled until server credentials are configured." } });
  }
  if (request.get("x-automation-key") !== apiKey) {
    return response.status(401).json({ error: { code: "AUTOMATION_UNAUTHORIZED", message: "Invalid automation API key." } });
  }

  const errors = validateTaskAutomationEvent(request.body);
  if (errors.length) {
    return response.status(400).json({ error: { code: "INVALID_AUTOMATION_EVENT", message: errors.join("; ") } });
  }

  try {
    await sendTaskEventToN8n(request.body);
    return response.status(202).json({ accepted: true, eventId: request.body.eventId });
  } catch (error) {
    return response.status(error.code === "AUTOMATION_NOT_CONFIGURED" ? 503 : 502).json({
      error: { code: error.code || "AUTOMATION_UPSTREAM_FAILED", message: error.message },
    });
  }
});
