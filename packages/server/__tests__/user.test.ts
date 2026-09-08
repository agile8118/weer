import assert from "node:assert/strict";
import request from "supertest";
import { describe, it } from "mocha";
import app from "../src/app.js";
import { DB } from "../src/database/index.js";
import { getEmailCode, signUpAndLogIn } from "./helpers/factories/auth.js";

describe("User Endpoints", () => {
  it("changes a user's email after confirming the code sent to the new address", async () => {
    const agent = request.agent(app);
    const email = "change-email-test@example.com";
    const newEmail = "change-email-test-new@example.com";
    await signUpAndLogIn(agent, email);

    const sendRes = await agent.post("/user/email/send-code").send({ newEmail });
    assert.strictEqual(sendRes.statusCode, 200);

    const code = await getEmailCode(newEmail);

    const confirmRes = await agent
      .patch("/user/email/confirm")
      .send({ newEmail, code });
    assert.strictEqual(confirmRes.statusCode, 200);

    const statusRes = await agent.get("/auth/status");
    assert.strictEqual(statusRes.body.email, newEmail);
  });

  it("rejects a change-email request for an email already in use", async () => {
    const agent = request.agent(app);
    await signUpAndLogIn(agent, "owner@example.com");
    await signUpAndLogIn(request.agent(app), "taken@example.com");

    const res = await agent.post("/user/email/send-code").send({ newEmail: "taken@example.com" });
    assert.strictEqual(res.statusCode, 409);
  });

  it("changes a password for an already-logged-in user", async () => {
    const agent = request.agent(app);
    const email = "change-password-test@example.com";
    await signUpAndLogIn(agent, email);

    const res = await agent.patch("/user/password").send({ newPassword: "NewPassword456" });
    assert.strictEqual(res.statusCode, 200);

    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email, password: "NewPassword456" });
    assert.strictEqual(loginRes.statusCode, 200);
  });

  it("allows setting a first password on a Google-only account", async () => {
    const email = "google-only@example.com";
    await DB.insert("users", { email, name: "Google Only", google_id: "fake-sub-9" });

    const agent = request.agent(app);
    const originalFetch = global.fetch;
    global.fetch = (async (url: string) => {
      if (url.toString().includes("oauth2.googleapis.com/token")) {
        return { json: async () => ({ access_token: "fake-token" }) } as any;
      }
      if (url.toString().includes("googleapis.com/oauth2/v3/userinfo")) {
        return { json: async () => ({ sub: "fake-sub-9", name: "Google Only", email }) } as any;
      }
      throw new Error(`Unexpected fetch to ${url}`);
    }) as any;

    try {
      await agent.get("/auth/google/callback?code=fake-code");
    } finally {
      global.fetch = originalFetch;
    }

    const res = await agent
      .patch("/user/password")
      .send({ newPassword: "FirstPassword789" });
    assert.strictEqual(res.statusCode, 200);

    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email, password: "FirstPassword789" });
    assert.strictEqual(loginRes.statusCode, 200);
  });
});
