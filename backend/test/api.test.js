import assert from "node:assert/strict";
import { before, after, test } from "node:test";

process.env.NODE_ENV = "test";

const { app } = await import("../src/server.js");

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test("health endpoint returns service metadata", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.service, "solguard-backend");
  assert.ok(body.rpcSource);
});

test("diagnostics endpoint reports integration statuses without secrets", async () => {
  const response = await fetch(`${baseUrl}/api/diagnostics`);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.ok(Array.isArray(body.integrations));
  assert.ok(body.integrations.some((item) => item.name === "SOLANA_RPC_URL"));
  assert.ok(body.integrations.some((item) => item.name === "TELEGRAM_BOT_TOKEN"));
  assert.equal(typeof body.telegramReady, "boolean");
  assert.ok(Array.isArray(body.alertPolicy));
});

test("wallet scan validates wallet address shape", async () => {
  const response = await fetch(`${baseUrl}/api/scan-wallet`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ walletAddress: "not-a-wallet" }),
  });
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.match(body.error, /Invalid walletAddress/);
});

test("token scan validates mint address shape", async () => {
  const response = await fetch(`${baseUrl}/api/scan-token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ mintAddress: "not-a-mint" }),
  });
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.match(body.error, /Invalid mintAddress/);
});

test("simulation endpoint supports intent-only checks", async () => {
  const response = await fetch(`${baseUrl}/api/simulate-transaction`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.simulationMode, "mock");
  assert.ok(Array.isArray(body.summary));
});

test("telegram test endpoint is safe when env vars are missing", async () => {
  const response = await fetch(`${baseUrl}/api/telegram/test-alert`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.telegram.sent, false);
});
