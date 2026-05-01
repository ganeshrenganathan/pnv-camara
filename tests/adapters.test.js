import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { MockAdapter } from "../src/adapters/mock.js";
import { getAdapter, resetAdapter, REGISTRY } from "../src/adapters/index.js";

// ---------------------------------------------------------------------------
// MockAdapter
// ---------------------------------------------------------------------------
describe("MockAdapter", () => {
  it("getName() returns 'mock'", () => {
    const adapter = new MockAdapter();
    assert.equal(adapter.getName(), "mock");
  });

  it("getAccessToken() returns a string token", async () => {
    const adapter = new MockAdapter();
    const token = await adapter.getAccessToken();
    assert.equal(typeof token, "string");
    assert.ok(token.length > 0);
  });

  it("verify() returns verified=true for a normal number", async () => {
    const adapter = new MockAdapter();
    const result = await adapter.verify({ phoneNumber: "+14155552671", deviceIp: "1.2.3.4", sessionId: "s1" });
    assert.equal(result.verified, true);
  });

  it("verify() returns verified=false for a number ending with 0000", async () => {
    const adapter = new MockAdapter();
    const result = await adapter.verify({ phoneNumber: "+141550000", deviceIp: "1.2.3.4", sessionId: "s1" });
    assert.equal(result.verified, false);
  });

  it("verify() result contains a raw object", async () => {
    const adapter = new MockAdapter();
    const result = await adapter.verify({ phoneNumber: "+14155552671", deviceIp: "1.2.3.4", sessionId: "s1" });
    assert.ok(typeof result.raw === "object");
  });
});

// ---------------------------------------------------------------------------
// AdapterRegistry / getAdapter factory
// ---------------------------------------------------------------------------
describe("AdapterRegistry", () => {
  beforeEach(() => resetAdapter());

  it("REGISTRY contains 'mock' and 'gsma-open-gateway'", () => {
    assert.ok("mock" in REGISTRY);
    assert.ok("gsma-open-gateway" in REGISTRY);
  });

  it("getAdapter() returns MockAdapter when mockCamara=true", () => {
    const adapter = getAdapter({ mockCamara: true, adapterName: "gsma-open-gateway", camara: {} });
    assert.equal(adapter.getName(), "mock");
  });

  it("getAdapter() returns MockAdapter when adapterName=mock", () => {
    const adapter = getAdapter({ mockCamara: false, adapterName: "mock", camara: {} });
    assert.equal(adapter.getName(), "mock");
  });

  it("getAdapter() returns GsmaOpenGatewayAdapter for adapterName=gsma-open-gateway", () => {
    const cfg = {
      mockCamara: false,
      adapterName: "gsma-open-gateway",
      camara: {
        tokenUrl: "https://example.com/token",
        clientId: "id",
        clientSecret: "secret",
        scope: "test-scope",
        baseUrl: "https://example.com",
        verifyPath: "/verify",
        apiKey: "",
        resultPath: "devicePhoneNumberVerified",
        successValues: ["true"]
      }
    };
    const adapter = getAdapter(cfg);
    assert.equal(adapter.getName(), "gsma-open-gateway");
  });

  it("getAdapter() returns the same singleton on repeated calls", () => {
    const cfg = { mockCamara: true, adapterName: "mock", camara: {} };
    const a = getAdapter(cfg);
    const b = getAdapter(cfg);
    assert.strictEqual(a, b);
  });

  it("getAdapter() throws for an unknown adapter name", () => {
    assert.throws(
      () => getAdapter({ mockCamara: false, adapterName: "nonexistent-operator", camara: {} }),
      /Unknown adapter/
    );
  });
});
