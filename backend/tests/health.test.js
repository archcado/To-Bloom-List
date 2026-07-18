import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "../src/app.js";

test("createApp returns an Express application", () => {
  const app = createApp();
  assert.equal(typeof app, "function");
  assert.equal(typeof app.listen, "function");
});

