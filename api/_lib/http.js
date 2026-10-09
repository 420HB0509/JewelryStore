/* Small helpers for the Web-standard (Request → Response) handlers.
   Files in api/_lib are not exposed as endpoints by Vercel. */

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...headers,
    },
  });
}

export const fail = (status, error, extra = {}) => json({ error, ...extra }, status);

export async function readJson(request, maxBytes = 1_000_000) {
  const text = await request.text();
  if (text.length > maxBytes) throw Object.assign(new Error("Request is too large."), { status: 413 });
  try {
    return JSON.parse(text || "{}");
  } catch {
    throw Object.assign(new Error("Invalid request."), { status: 400 });
  }
}

export function clientIp(request) {
  return (
    request.headers.get("x-real-ip") ||
    (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "local"
  );
}
