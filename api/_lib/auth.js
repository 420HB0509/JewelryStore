/* Single-password admin access.
   The password lives only in the ADMIN_PASSWORD environment variable.
   A successful login returns a signed, expiring token (no database needed). */

import crypto from "node:crypto";

const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

const sha256 = (value) => crypto.createHash("sha256").update(String(value)).digest();

const secret = () =>
  process.env.ADMIN_SESSION_SECRET || sha256(`storefront-admin-session:${process.env.ADMIN_PASSWORD || ""}`);

const sign = (payload) => crypto.createHmac("sha256", secret()).update(payload).digest("base64url");

export const passwordConfigured = () => (process.env.ADMIN_PASSWORD || "").length >= 8;

export function passwordMatches(input) {
  if (!passwordConfigured() || typeof input !== "string") return false;
  // Compare fixed-length hashes so timing doesn't leak the password length
  return crypto.timingSafeEqual(sha256(input), sha256(process.env.ADMIN_PASSWORD));
}

export function createToken() {
  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS })
  ).toString("base64url");
  return { token: `${payload}.${sign(payload)}`, expiresIn: TOKEN_TTL_SECONDS };
}

export function isAuthorized(request) {
  if (!passwordConfigured()) return false;
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof exp === "number" && exp > Date.now() / 1000;
  } catch {
    return false;
  }
}
