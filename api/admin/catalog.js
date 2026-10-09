/* GET /api/admin/catalog — latest saved catalog (never cached)
   PUT /api/admin/catalog — { catalog, baseUpdatedAt } → { catalog }

   baseUpdatedAt is the version the editor started from. If someone
   saved in between (another phone or tab), the save is refused with
   409 instead of silently overwriting their changes. */

import { normalizeCatalog } from "../../shared/catalog.js";
import { isAuthorized } from "../_lib/auth.js";
import { fail, json, readJson } from "../_lib/http.js";
import { SetupError, readCatalog, writeCatalog } from "../_lib/storage.js";

export async function GET(request) {
  if (!isAuthorized(request)) return fail(401, "Please log in again.");
  try {
    return json({ catalog: await readCatalog() });
  } catch (err) {
    console.error("admin catalog read failed", err);
    return fail(503, "Couldn't load the catalog. Please try again.");
  }
}

export async function PUT(request) {
  if (!isAuthorized(request)) return fail(401, "Please log in again.");
  try {
    const body = await readJson(request);
    const current = await readCatalog();
    const currentVersion = current?.updatedAt ?? null;
    if ((body.baseUpdatedAt ?? null) !== currentVersion) {
      return fail(409, "The catalog was changed somewhere else. Reload to get the latest version.", {
        code: "CONFLICT",
      });
    }

    const { catalog, errors } = normalizeCatalog(body.catalog);
    if (errors.length) return fail(400, errors[0], { errors });

    catalog.updatedAt = new Date().toISOString();
    await writeCatalog(catalog);
    return json({ catalog });
  } catch (err) {
    if (err instanceof SetupError) return fail(503, err.message, { code: err.code });
    console.error("admin catalog save failed", err);
    return fail(err.status || 500, err.status ? err.message : "Saving failed. Please try again.");
  }
}
