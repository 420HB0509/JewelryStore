/* GET /api/catalog — the published catalog for the storefront.
   Responds { catalog: null } until the first save from the control
   center; the storefront then uses its built-in sample catalog. */

import { json } from "./_lib/http.js";
import { readCatalog } from "./_lib/storage.js";

export async function GET() {
  try {
    const catalog = await readCatalog();
    return json({ catalog }, 200, {
      // Browsers always ask for the latest version…
      "cache-control": "public, max-age=0, must-revalidate",
      // …while Vercel's edge keeps a copy for 10 s, so changes go live within seconds
      "vercel-cdn-cache-control": "max-age=10, stale-while-revalidate=300",
    });
  } catch (err) {
    console.error("catalog read failed", err);
    return json({ error: "Catalog temporarily unavailable." }, 503);
  }
}
