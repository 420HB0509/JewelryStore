/* GET /api/admin/session — checks the login and reports which storage is connected. */

import { isAuthorized } from "../_lib/auth.js";
import { fail, json } from "../_lib/http.js";
import { catalogStorage, uploadStorage } from "../_lib/storage.js";

export function GET(request) {
  if (!isAuthorized(request)) return fail(401, "Please log in again.");
  return json({ ok: true, storage: { catalog: catalogStorage(), uploads: uploadStorage() } });
}
