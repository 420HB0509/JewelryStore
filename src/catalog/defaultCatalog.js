/* The sample catalog built from src/data/products.js and src/config/store.js.
   Used until the first save from the control center, and as a fallback
   when the store runs without the API (e.g. a static-only host). */

import { normalizeCatalog } from "../../shared/catalog.js";
import { ANNOUNCEMENTS, COLLECTIONS, STORE_CONFIG } from "../config/store.js";
import { PRODUCTS } from "../data/products.js";

export const DEFAULT_CATALOG = normalizeCatalog({
  version: 1,
  updatedAt: null,
  settings: {
    whatsappNumber: STORE_CONFIG.whatsappNumber,
    instagramUrl: STORE_CONFIG.instagramUrl,
    instagramHandle: STORE_CONFIG.instagramHandle,
    deliveryFee: STORE_CONFIG.deliveryFee,
    freeDeliveryThreshold: STORE_CONFIG.freeDeliveryThreshold,
    deliveryMode: STORE_CONFIG.deliveryMode,
    announcements: ANNOUNCEMENTS,
  },
  collections: COLLECTIONS.map((c) => ({ ...c, active: true })),
  products: PRODUCTS.map((p) => ({ ...p, active: true, shippingFee: null })),
}).catalog;
