import { describe, it, expect } from "vitest";
import { signBody, verifySignature } from "@/lib/hmac";

const SECRET = "test-secret-key";

describe("signBody / verifySignature", () => {
  it("produces a sha256= prefixed hex digest", () => {
    const sig = signBody('{"a":1}', SECRET);
    expect(sig).toMatch(/^sha256=[0-9a-f]{64}$/);
  });

  it("verifies a correctly signed body", () => {
    const body = '{"id":1,"status":"sent"}';
    const sig = signBody(body, SECRET);
    expect(verifySignature(body, sig, SECRET)).toBe(true);
  });

  it("rejects a tampered body", () => {
    const sig = signBody('{"id":1,"status":"sent"}', SECRET);
    expect(verifySignature('{"id":1,"status":"failed"}', sig, SECRET)).toBe(false);
  });

  it("rejects a wrong secret", () => {
    const body = '{"x":1}';
    const sig = signBody(body, SECRET);
    expect(verifySignature(body, sig, "other-secret")).toBe(false);
  });

  it("rejects missing signature header", () => {
    expect(verifySignature("{}", null, SECRET)).toBe(false);
    expect(verifySignature("{}", undefined, SECRET)).toBe(false);
  });

  it("rejects when secret is empty", () => {
    expect(verifySignature("{}", signBody("{}", SECRET), "")).toBe(false);
  });

  it("is constant-time-safe for different-length inputs", () => {
    expect(verifySignature("{}", "sha256=short", SECRET)).toBe(false);
  });
});
