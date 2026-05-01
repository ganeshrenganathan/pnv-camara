import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getByPath, normalizePhoneNumber, isE164, asBoolean } from "../src/utils.js";

describe("getByPath", () => {
  it("returns top-level value", () => {
    assert.equal(getByPath({ a: 1 }, "a"), 1);
  });

  it("returns nested value via dot notation", () => {
    assert.equal(getByPath({ a: { b: { c: 42 } } }, "a.b.c"), 42);
  });

  it("returns undefined for missing key", () => {
    assert.equal(getByPath({ a: 1 }, "b"), undefined);
  });

  it("returns undefined for null object", () => {
    assert.equal(getByPath(null, "a"), undefined);
  });

  it("returns undefined for empty path", () => {
    assert.equal(getByPath({ a: 1 }, ""), undefined);
  });
});

describe("normalizePhoneNumber", () => {
  it("strips internal whitespace", () => {
    assert.equal(normalizePhoneNumber("+1 415 555 2671"), "+14155552671");
  });

  it("returns empty string for null/undefined", () => {
    assert.equal(normalizePhoneNumber(null), "");
    assert.equal(normalizePhoneNumber(undefined), "");
  });

  it("does not modify a clean E.164 number", () => {
    assert.equal(normalizePhoneNumber("+14155552671"), "+14155552671");
  });
});

describe("isE164", () => {
  it("accepts valid E.164 numbers", () => {
    assert.ok(isE164("+14155552671"));
    assert.ok(isE164("+442071234567"));
    assert.ok(isE164("+919876543210"));
  });

  it("rejects numbers without leading +", () => {
    assert.ok(!isE164("14155552671"));
  });

  it("rejects numbers that are too short", () => {
    assert.ok(!isE164("+1234567"));
  });

  it("rejects numbers that are too long", () => {
    assert.ok(!isE164("+1" + "0".repeat(15)));
  });

  it("rejects non-numeric characters", () => {
    assert.ok(!isE164("+1415abc5671"));
  });
});

describe("asBoolean", () => {
  it("returns true for 'true'", () => assert.ok(asBoolean("true")));
  it("returns true for '1'", () => assert.ok(asBoolean("1")));
  it("returns true for 'yes'", () => assert.ok(asBoolean("yes")));
  it("returns false for 'false'", () => assert.ok(!asBoolean("false")));
  it("returns false for '0'", () => assert.ok(!asBoolean("0")));
  it("returns false for empty string", () => assert.ok(!asBoolean("")));
  it("handles boolean input directly", () => {
    assert.ok(asBoolean(true));
    assert.ok(!asBoolean(false));
  });
  it("handles numeric input", () => {
    assert.ok(asBoolean(1));
    assert.ok(!asBoolean(0));
  });
});
