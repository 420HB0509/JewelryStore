/* POST /api/admin/login  { password } → { token, expiresIn } */

import { createToken, passwordConfigured, passwordMatches } from "../_lib/auth.js";
import { clientIp, fail, json, readJson } from "../_lib/http.js";
import { bumpCounter, resetCounter } from "../_lib/storage.js";

const MAX_ATTEMPTS = 8;
const WINDOW_SECONDS = 15 * 60;

export async function POST(request) {
  if (!passwordConfigured()) {
    return fail(503, "The admin password isn't set up yet.", { code: "NO_PASSWORD" });
  }

  const key = `login-attempts:${clientIp(request)}`;
  try {
    const attempts = await bumpCounter(key, WINDOW_SECONDS);
    if (attempts > MAX_ATTEMPTS) {
      return fail(429, "Too many attempts. Please wait 15 minutes and try again.");
    }

    const { password } = await readJson(request, 10_000);
    if (!passwordMatches(password)) {
      await new Promise((r) => setTimeout(r, 500));
      return fail(401, "That password isn't correct.");
    }

    await resetCounter(key);
    return json(createToken());
  } catch (err) {
    console.error("login failed", err);
    return fail(err.status || 500, err.status ? err.message : "Login is temporarily unavailable.");
  }
}
