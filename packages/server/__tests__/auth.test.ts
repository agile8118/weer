import assert from "node:assert/strict";
import request from "supertest";
import { describe, it } from "mocha";
import app from "../src/app.js";
import { DB } from "../src/database/index.js";
import type { IUser } from "../src/database/types.js";
import { DEFAULT_PASSWORD, getEmailCode, signUpAndLogIn } from "./helpers/factories/auth.js";

describe("Auth Endpoints", () => {
  it("signs a user up, verifies their email, and logs them in automatically", async () => {
    const agent = request.agent(app);
    const email = "signup-test@example.com";

    await signUpAndLogIn(agent, email);

    const statusRes = await agent.get("/auth/status");
    assert.strictEqual(statusRes.body.isSignedIn, true);
    assert.strictEqual(statusRes.body.email, email);
  });

  it("checks username availability without requiring authentication", async () => {
    const res = await request(app).get("/user/username-availability/somebrandnewusername");
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.available, true);
  });

  it("signs a user up with an optional username and sets it as their active username", async () => {
    const agent = request.agent(app);
    const email = "signup-username-test@example.com";
    const username = "signupuser";

    await agent.post("/auth/send-code").send({
      name: "Test User",
      email,
      password: DEFAULT_PASSWORD,
      username,
    });
    const code = await getEmailCode(email);
    const res = await agent.post("/auth/register").send({
      name: "Test User",
      email,
      password: DEFAULT_PASSWORD,
      code,
      username,
    });
    assert.strictEqual(res.statusCode, 201);

    const statusRes = await agent.get("/auth/status");
    const active = statusRes.body.usernames.find((u: any) => u.active);
    assert.strictEqual(active?.value, username);
  });

  it("rejects signup with a username that is already taken", async () => {
    const ownerAgent = request.agent(app);
    const ownerEmail = "username-owner@example.com";
    const username = "takenusername";

    await ownerAgent
      .post("/auth/send-code")
      .send({ name: "Username Owner", email: ownerEmail, password: DEFAULT_PASSWORD, username });
    await ownerAgent.post("/auth/register").send({
      name: "Username Owner",
      email: ownerEmail,
      password: DEFAULT_PASSWORD,
      code: await getEmailCode(ownerEmail),
      username,
    });

    const res = await request(app).post("/auth/send-code").send({
      name: "Someone Else",
      email: "different-email@example.com",
      password: DEFAULT_PASSWORD,
      username,
    });

    assert.strictEqual(res.statusCode, 409);
  });

  it("rejects signup for an email already registered with a password", async () => {
    const email = "dup-test@example.com";
    await signUpAndLogIn(request.agent(app), email);

    const res = await request(app)
      .post("/auth/send-code")
      .send({ name: "Dup Again", email, password: DEFAULT_PASSWORD });

    assert.strictEqual(res.statusCode, 409);
  });

  it("rejects signup for an email already tied to a Google account", async () => {
    const email = "google-user@example.com";
    await DB.insert<IUser>("users", { email, name: "Google User", google_id: "fake-sub-1" });

    const res = await request(app)
      .post("/auth/send-code")
      .send({ name: "Someone", email, password: DEFAULT_PASSWORD });

    assert.strictEqual(res.statusCode, 409);
    assert.match(res.body.error, /already have an account/i);
  });

  it("locks out after 5 wrong verification code attempts", async () => {
    const email = "lockout-test@example.com";
    await request(app)
      .post("/auth/send-code")
      .send({ name: "Lockout", email, password: DEFAULT_PASSWORD });

    let res;
    for (let i = 0; i < 5; i++) {
      res = await request(app)
        .post("/auth/register")
        .send({ name: "Lockout", email, password: DEFAULT_PASSWORD, code: "00000" });
    }
    assert.strictEqual(res!.statusCode, 429);

    const afterLockout = await request(app)
      .post("/auth/register")
      .send({ name: "Lockout", email, password: DEFAULT_PASSWORD, code: "00000" });
    assert.strictEqual(afterLockout.statusCode, 400);
  });

  it("rejects login with an incorrect password", async () => {
    const email = "login-test@example.com";
    await signUpAndLogIn(request.agent(app), email);

    const res = await request(app)
      .post("/auth/login")
      .send({ email, password: "WrongPassword1" });

    assert.strictEqual(res.statusCode, 401);
  });

  it("resets a forgotten password via the emailed token", async () => {
    const email = "reset-test@example.com";
    const userId = await signUpAndLogIn(request.agent(app), email);

    await request(app).post("/auth/forgot-password").send({ email });

    const user = await DB.find<IUser>("SELECT token_code FROM users WHERE id = $1", [userId]);

    const resetRes = await request(app)
      .patch("/auth/reset-password")
      .send({ userId, token: user!.token_code, newPassword: "NewPassword456" });
    assert.strictEqual(resetRes.statusCode, 200);

    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email, password: "NewPassword456" });
    assert.strictEqual(loginRes.statusCode, 200);

    const oldLoginRes = await request(app)
      .post("/auth/login")
      .send({ email, password: DEFAULT_PASSWORD });
    assert.strictEqual(oldLoginRes.statusCode, 401);
  });

  it("lets a Google-only account set a password via forgot-password, without breaking Google login", async () => {
    const email = "google-forgot-password-test@example.com";

    const originalFetch = global.fetch;
    global.fetch = (async (url: string) => {
      if (url.toString().includes("oauth2.googleapis.com/token")) {
        return { json: async () => ({ access_token: "fake-token" }) } as any;
      }
      if (url.toString().includes("googleapis.com/oauth2/v3/userinfo")) {
        return { json: async () => ({ sub: "fake-sub-google-only", name: "Google Only", email }) } as any;
      }
      throw new Error(`Unexpected fetch to ${url}`);
    }) as any;

    try {
      await request(app).get("/auth/google/callback?code=fake-code");
    } finally {
      global.fetch = originalFetch;
    }

    const forgotRes = await request(app).post("/auth/forgot-password").send({ email });
    assert.strictEqual(forgotRes.statusCode, 200);

    const user = await DB.find<IUser>("SELECT id, token_code FROM users WHERE email = $1", [email]);
    assert.ok(user?.token_code, "expected a reset token to be issued for a Google-only account");

    const resetRes = await request(app)
      .patch("/auth/reset-password")
      .send({ userId: user!.id, token: user!.token_code, newPassword: "GoogleOnlyPass456" });
    assert.strictEqual(resetRes.statusCode, 200);

    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email, password: "GoogleOnlyPass456" });
    assert.strictEqual(loginRes.statusCode, 200);

    const stillGoogleLinked = await DB.find<IUser>("SELECT google_id FROM users WHERE email = $1", [email]);
    assert.strictEqual(stillGoogleLinked!.google_id, "fake-sub-google-only");
  });

  it("enforces a per-email cooldown on repeated code sends", async () => {
    const email = "cooldown-test@example.com";

    let lastRes;
    for (let i = 0; i < 4; i++) {
      lastRes = await request(app)
        .post("/auth/send-code")
        .send({ name: "Cooldown", email, password: DEFAULT_PASSWORD });
    }
    assert.strictEqual(lastRes!.statusCode, 429);
  });

  it("links a Google login to an existing password account with the same email", async () => {
    const email = "link-test@example.com";
    const userId = await signUpAndLogIn(request.agent(app), email);

    const originalFetch = global.fetch;
    global.fetch = (async (url: string) => {
      if (url.toString().includes("oauth2.googleapis.com/token")) {
        return { json: async () => ({ access_token: "fake-token" }) } as any;
      }
      if (url.toString().includes("googleapis.com/oauth2/v3/userinfo")) {
        return { json: async () => ({ sub: "fake-sub-link", name: "Link Test", email }) } as any;
      }
      throw new Error(`Unexpected fetch to ${url}`);
    }) as any;

    try {
      const res = await request(app).get("/auth/google/callback?code=fake-code");
      assert.strictEqual(res.statusCode, 302);
    } finally {
      global.fetch = originalFetch;
    }

    const user = await DB.find<IUser>("SELECT id, google_id FROM users WHERE email = $1", [email]);
    assert.strictEqual(user!.id, userId);
    assert.strictEqual(user!.google_id, "fake-sub-link");
  });
});
