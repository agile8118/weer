import assert from "node:assert/strict";
import request from "supertest";
import { after, describe, it } from "mocha";
import { server } from "../src/index";
import { connection } from "../src/database";

describe("URL Endpoints", () => {
  it("should create a new shortened url", async () => {
    const res = await request(server).post("/url").send({
      url: "http://www.example.com",
    });

    assert.strictEqual(res.statusCode, 200);
    assert.ok(Object.prototype.hasOwnProperty.call(res.body, "shortenedURL"));
    assert.strictEqual(res.body.realURL, "http://www.example.com");
  });

  it("should not create a new shortened url if the url is not valid", async () => {
    const res = await request(server).post("/url").send({
      url: "random text",
    });

    assert.strictEqual(res.statusCode, 400);
  });

  after(async () => {
    // Closing the DB connection
    connection.end();
    // Close the server (promisified so mocha waits)
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });
});
