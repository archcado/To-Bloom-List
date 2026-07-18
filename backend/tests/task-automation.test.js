import assert from "node:assert/strict";
import test from "node:test";
import { validateTaskAutomationEvent } from "../src/services/task-automation.service.js";

test("valid task automation event passes validation", () => {
  const errors = validateTaskAutomationEvent({
    eventId: "event-1",
    eventType: "task.created",
    taskId: "task-1",
    occurredAt: "2026-07-18T09:00:00.000Z",
    task: { title: "整理圖鑑", scheduledStart: null, scheduledEnd: null },
  });
  assert.deepEqual(errors, []);
});

test("invalid task automation event returns actionable errors", () => {
  const errors = validateTaskAutomationEvent({ eventType: "unknown", task: {} });
  assert.ok(errors.includes("eventId is required"));
  assert.ok(errors.includes("eventType is not supported"));
  assert.ok(errors.includes("taskId is required"));
  assert.ok(errors.includes("task.title is required"));
});
