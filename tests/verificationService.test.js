/**
 * Verification service integration tests.
 *
 * These tests run with MOCK_CAMARA=true (set via the npm test command) so
 * no network calls are made. The store is shared across tests in this file,
 * which is fine because each test creates a unique session.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { startVerification, checkVerification, getVerificationSession, getAllSessions } from "../src/verificationService.js";

describe("startVerification", () => {
  it("creates a PENDING session for a valid E.164 number", () => {
    const result = startVerification({ phoneNumber: "+14155552671" });
    assert.ok(result.ok);
    assert.equal(result.statusCode, 201);
    assert.equal(result.data.status, "PENDING");
    assert.equal(result.data.phoneNumber, "+14155552671");
    assert.ok(typeof result.data.id === "string");
  });

  it("returns 400 for an invalid phone number", () => {
    const result = startVerification({ phoneNumber: "not-a-phone" });
    assert.ok(!result.ok);
    assert.equal(result.statusCode, 400);
  });

  it("returns 400 for a missing phone number", () => {
    const result = startVerification({});
    assert.ok(!result.ok);
    assert.equal(result.statusCode, 400);
  });

  it("strips whitespace from phone number", () => {
    const result = startVerification({ phoneNumber: "+1 415 555 2671" });
    assert.ok(result.ok);
    assert.equal(result.data.phoneNumber, "+14155552671");
  });
});

describe("checkVerification", () => {
  it("marks session VERIFIED for a number that should pass", async () => {
    const session = startVerification({ phoneNumber: "+14155552671" });
    const result = await checkVerification({ sessionId: session.data.id, deviceIp: "1.2.3.4" });
    assert.ok(result.ok);
    assert.equal(result.data.status, "VERIFIED");
    assert.equal(result.data.lastVerification.verified, true);
  });

  it("marks session FAILED for a number ending with 0000", async () => {
    const session = startVerification({ phoneNumber: "+141550000" });
    const result = await checkVerification({ sessionId: session.data.id, deviceIp: "1.2.3.4" });
    assert.ok(result.ok);
    assert.equal(result.data.status, "FAILED");
    assert.equal(result.data.lastVerification.verified, false);
  });

  it("returns 404 for an unknown session", async () => {
    const result = await checkVerification({ sessionId: "does-not-exist", deviceIp: "1.2.3.4" });
    assert.ok(!result.ok);
    assert.equal(result.statusCode, 404);
  });

  it("returns 400 when deviceIp is missing", async () => {
    const session = startVerification({ phoneNumber: "+14155552671" });
    const result = await checkVerification({ sessionId: session.data.id });
    assert.ok(!result.ok);
    assert.equal(result.statusCode, 400);
  });

  it("records provider name in lastVerification", async () => {
    const session = startVerification({ phoneNumber: "+14155552671" });
    const result = await checkVerification({ sessionId: session.data.id, deviceIp: "1.2.3.4" });
    assert.ok(result.data.lastVerification.provider);
  });
});

describe("getVerificationSession", () => {
  it("returns the session after creation", () => {
    const created = startVerification({ phoneNumber: "+14155552671" });
    const fetched = getVerificationSession(created.data.id);
    assert.ok(fetched.ok);
    assert.equal(fetched.data.id, created.data.id);
  });

  it("returns 404 for unknown id", () => {
    const result = getVerificationSession("nonexistent");
    assert.ok(!result.ok);
    assert.equal(result.statusCode, 404);
  });
});

describe("getAllSessions", () => {
  it("returns an array with at least the sessions created above", () => {
    startVerification({ phoneNumber: "+14155552671" });
    const result = getAllSessions();
    assert.ok(result.ok);
    assert.ok(Array.isArray(result.data));
    assert.ok(result.data.length >= 1);
  });
});
