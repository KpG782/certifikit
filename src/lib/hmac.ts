import { createHmac, timingSafeEqual } from "node:crypto";

const SIG_PREFIX = "sha256=";

// Compute the hex HMAC-SHA256 of `body` with `secret`, prefixed `sha256=`.
export function signBody(body: string, secret: string): string {
  const mac = createHmac("sha256", secret).update(body, "utf8").digest("hex");
  return SIG_PREFIX + mac;
}

// Constant-time comparison of a provided signature header against the
// expected signature for `body`. Returns false on any malformed input
// rather than throwing, so callers can treat it as a plain auth check.
export function verifySignature(
  body: string,
  signatureHeader: string | null | undefined,
  secret: string,
): boolean {
  if (!signatureHeader || !secret) return false;
  const expected = signBody(body, secret);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signatureHeader, "utf8");
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export const SIGNATURE_HEADER = "x-certifikit-signature";
