const SUPPORTED_EVENT_TYPES = new Set([
  "task.created",
  "task.updated",
  "task.completed",
  "task.deleted",
]);

export function validateTaskAutomationEvent(value) {
  const errors = [];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return ["request body must be an object"];
  }
  if (typeof value.eventId !== "string" || !value.eventId) errors.push("eventId is required");
  if (!SUPPORTED_EVENT_TYPES.has(value.eventType)) errors.push("eventType is not supported");
  if (typeof value.taskId !== "string" || !value.taskId) errors.push("taskId is required");
  if (!isDateTime(value.occurredAt)) errors.push("occurredAt must be an ISO date-time");
  if (!value.task || typeof value.task !== "object") {
    errors.push("task is required");
  } else {
    if (typeof value.task.title !== "string" || !value.task.title.trim()) errors.push("task.title is required");
    if (value.task.scheduledStart && !isDateTime(value.task.scheduledStart)) errors.push("task.scheduledStart must be an ISO date-time or null");
    if (value.task.scheduledEnd && !isDateTime(value.task.scheduledEnd)) errors.push("task.scheduledEnd must be an ISO date-time or null");
  }
  return errors;
}

export async function sendTaskEventToN8n(event) {
  const webhookUrl = process.env.N8N_TASK_WEBHOOK_URL;
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET;
  if (!webhookUrl || !webhookSecret) {
    const error = new Error("n8n task webhook is not configured");
    error.code = "AUTOMATION_NOT_CONFIGURED";
    throw error;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-to-bloom-signature": webhookSecret,
    },
    body: JSON.stringify(event),
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    const error = new Error(`n8n webhook returned HTTP ${response.status}`);
    error.code = "AUTOMATION_UPSTREAM_FAILED";
    throw error;
  }
  return { accepted: true, status: response.status };
}

function isDateTime(value) {
  return typeof value === "string" && !Number.isNaN(new Date(value).getTime());
}
