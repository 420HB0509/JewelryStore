/* POST /api/admin/upload?name=<file name>
   Body: the image bytes (already resized in the browser).
   → { url } */

import { isAuthorized } from "../_lib/auth.js";
import { fail, json } from "../_lib/http.js";
import { ALLOWED_IMAGE_TYPES, SetupError, saveImage } from "../_lib/storage.js";

const MAX_BYTES = 4 * 1024 * 1024; // Vercel functions accept up to 4.5 MB

export async function POST(request) {
  if (!isAuthorized(request)) return fail(401, "Please log in again.");

  const contentType = (request.headers.get("content-type") || "").split(";")[0].trim();
  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    return fail(415, "Please upload a JPG, PNG or WebP photo.");
  }

  try {
    const buffer = Buffer.from(await request.arrayBuffer());
    if (!buffer.length) return fail(400, "The photo is empty.");
    if (buffer.length > MAX_BYTES) return fail(413, "This photo is too large (max 4 MB).");

    const name = new URL(request.url).searchParams.get("name") || "photo";
    const url = await saveImage(buffer, contentType, name);
    return json({ url });
  } catch (err) {
    if (err instanceof SetupError) return fail(503, err.message, { code: err.code });
    console.error("upload failed", err);
    return fail(500, "Upload failed. Please try again.");
  }
}
