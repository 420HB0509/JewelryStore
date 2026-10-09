/* GET /api/catalog — the published catalog for the storefront.
   Responds { catalog: null } until the first save from the control
   center; the storefront then uses its built-in sample catalog. */

import { json } from "./_lib/http.js";
import { readCatalog } from "./_lib/storage.js";

export async function GET() {
  try {
    const catalog = await readCatalog();
    // Never cached (neither by browsers nor by Vercel's edge), so changes
    // made in the control center show up on the very next page load.
    return json({ catalog });
  } catch (err) {
    console.error("catalog read failed", err);
    return json({ error: "Catalog temporarily unavailable." }, 503);
  }
}
