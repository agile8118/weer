import assert from "node:assert/strict";
import http from "http";
import request from "supertest";
import { after, before, describe, it } from "mocha";
import app from "../src/app";
import { pool } from "../src/database";

describe("URL Endpoints", () => {
  let agent: ReturnType<typeof request.agent>;
  let server: http.Server;

  before(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, resolve);
    });
    agent = request.agent(server);
    // Establish a session cookie for unauthenticated requests
    await agent.get("/auth/status");
  });

  it("should create a new classic shortened url", async () => {
    const res = await agent.post("/url").send({
      url: "http://www.example.com",
      type: "classic",
    });

    assert.strictEqual(res.statusCode, 200);
    assert.ok(Object.prototype.hasOwnProperty.call(res.body, "code"));
    assert.strictEqual(res.body.realURL, "http://www.example.com");
  });

  it("should create a new digit shortened url", async () => {
    const res = await agent.post("/url").send({
      url: "http://www.example.com",
      type: "digit",
    });

    assert.strictEqual(res.statusCode, 200);
    assert.ok(Object.prototype.hasOwnProperty.call(res.body, "code"));
    assert.strictEqual(res.body.realURL, "http://www.example.com");
  });

  it("should not create a new classic shortened url if the url is not valid", async () => {
    const res = await agent.post("/url").send({
      url: "random text",
      type: "classic",
    });

    assert.strictEqual(res.statusCode, 400);
  });

  after(async () => {
    // Closing the DB connection
    pool.end();
    // Close the server (promisified so mocha waits)
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });
});
