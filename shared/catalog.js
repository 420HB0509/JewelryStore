/* =============================================================
   Catalog model — shared by the storefront, the control center
   and the API so that all three agree on what valid data is.

   catalog = {
     version, updatedAt,
     settings:    { whatsappNumber, instagramUrl, instagramHandle,
                    deliveryFee, freeDeliveryThreshold, deliveryMode,
                    announcements: [] },
     collections: [{ id, name, image, alt, active, kind }],
     products:    [{ id, name, price, originalPrice, category, images,
                    description, material, details, variants,
                    badge, availability, active, shippingFee }]
   }
   ============================================================= */

export const AVAILABILITY = ["in_stock", "low_stock", "sold_out"];
export const BADGES = ["bestseller", "new"];
export const DELIVERY_MODES = ["highest", "per_item"];
export const COLLECTION_KINDS = ["category", "bestsellers"];

export const LIMITS = {
  products: 500,
  collections: 40,
  images: 8,
  details: 12,
  sizes: 30,
  colors: 12,
  announcements: 6,
};

const ID_RE = /^[A-Za-z0-9_-]{1,40}$/;

/* ---------- primitive sanitizers ---------- */

const str = (v, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

const toNumber = (v) => {
  if (v === null || v === undefined || (typeof v === "string" && v.trim() === "")) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/** Non-negative amount rounded to 2 decimals, or null. */
const money = (v) => {
  const n = toNumber(v);
  return n === null || n < 0 ? null : Math.round(n * 100) / 100;
};

const bool = (v, fallback) => (typeof v === "boolean" ? v : fallback);

/** https URLs and site-relative paths only (no javascript:, data:, //host). */
export function safeUrl(v) {
  const s = str(v, 2000);
  if (!s) return "";
  if (/^https:\/\//i.test(s)) return s;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(s)) return s;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(s) && !s.startsWith("//")) return s;
  return "";
}

const uniqueStrings = (arr, max, maxLen = 60) =>
  [...new Set((Array.isArray(arr) ? arr : []).map((x) => str(String(x ?? ""), maxLen)).filter(Boolean))].slice(0, max);

export function slugify(text) {
  return (
    String(text || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "collection"
  );
}

/* ---------- normalizers ---------- */

function normalizeSettings(raw = {}) {
  const deliveryMode = DELIVERY_MODES.includes(raw.deliveryMode) ? raw.deliveryMode : "highest";
  return {
    whatsappNumber: String(raw.whatsappNumber ?? "").replace(/\D/g, "").slice(0, 15),
    instagramUrl: safeUrl(raw.instagramUrl),
    instagramHandle: str(raw.instagramHandle, 60),
    deliveryFee: money(raw.deliveryFee),
    freeDeliveryThreshold: money(raw.freeDeliveryThreshold),
    deliveryMode,
    announcements: uniqueStrings(raw.announcements, LIMITS.announcements, 120),
  };
}

function normalizeCollection(raw = {}) {
  return {
    id: str(raw.id, 40),
    name: str(raw.name, 60),
    image: safeUrl(raw.image),
    alt: str(raw.alt, 160),
    active: bool(raw.active, true),
    kind: COLLECTION_KINDS.includes(raw.kind) ? raw.kind : "category",
  };
}

function normalizeProduct(raw = {}) {
  const price = money(raw.price);
  const originalPrice = money(raw.originalPrice);
  const colors = (Array.isArray(raw.variants?.colors) ? raw.variants.colors : [])
    .map((c) => ({
      name: str(c?.name, 40),
      hex: /^#[0-9a-f]{6}$/i.test(c?.hex) ? c.hex : "#c9a45c",
    }))
    .filter((c) => c.name)
    .slice(0, LIMITS.colors);
  const sizes = uniqueStrings(raw.variants?.sizes, LIMITS.sizes, 20);

  const variants = {};
  if (colors.length) variants.colors = colors;
  if (sizes.length) variants.sizes = sizes;

  return {
    id: str(raw.id, 40),
    name: str(raw.name, 120),
    price: price ?? 0,
    originalPrice: originalPrice && price !== null && originalPrice > price ? originalPrice : null,
    category: str(raw.category, 40),
    images: (Array.isArray(raw.images) ? raw.images : []).map(safeUrl).filter(Boolean).slice(0, LIMITS.images),
    description: str(raw.description, 2000),
    material: str(raw.material, 160),
    details: uniqueStrings(raw.details, LIMITS.details, 160),
    variants,
    badge: BADGES.includes(raw.badge) ? raw.badge : null,
    availability: AVAILABILITY.includes(raw.availability) ? raw.availability : "in_stock",
    active: bool(raw.active, true),
    shippingFee: money(raw.shippingFee),
  };
}

/**
 * Cleans untrusted catalog data and reports problems.
 * Returns { catalog, errors } — errors are human-readable sentences.
 */
export function normalizeCatalog(raw) {
  const errors = [];
  const src = raw && typeof raw === "object" ? raw : {};

  const collections = [];
  const seenCollections = new Set();
  for (const c of (Array.isArray(src.collections) ? src.collections : []).slice(0, LIMITS.collections)) {
    const col = normalizeCollection(c);
    if (!ID_RE.test(col.id)) {
      errors.push(`A collection has an invalid reference (“${col.id || "empty"}”).`);
      continue;
    }
    if (!col.name) errors.push(`Collection ${col.id} needs a name.`);
    if (seenCollections.has(col.id)) {
      errors.push(`Two collections share the reference “${col.id}”.`);
      continue;
    }
    seenCollections.add(col.id);
    collections.push(col);
  }
  const categoryIds = new Set(collections.filter((c) => c.kind === "category").map((c) => c.id));

  const products = [];
  const seenProducts = new Set();
  for (const p of (Array.isArray(src.products) ? src.products : []).slice(0, LIMITS.products)) {
    const prod = normalizeProduct(p);
    const label = prod.name || prod.id || "A product";
    if (!ID_RE.test(prod.id)) {
      errors.push(`${label} has an invalid reference.`);
      continue;
    }
    if (seenProducts.has(prod.id)) {
      errors.push(`Two products share the reference “${prod.id}”.`);
      continue;
    }
    seenProducts.add(prod.id);
    if (!prod.name) errors.push(`Product ${prod.id} needs a name.`);
    if (money(p.price) === null || prod.price <= 0) errors.push(`${label} needs a price above 0.`);
    if (!categoryIds.has(prod.category)) errors.push(`${label} must belong to a collection.`);
    if (prod.active && !prod.images.length) errors.push(`${label} needs at least one photo to be shown on the store.`);
    products.push(prod);
  }

  return {
    catalog: {
      version: 1,
      updatedAt: typeof src.updatedAt === "string" ? src.updatedAt : null,
      settings: normalizeSettings(src.settings),
      collections,
      products,
    },
    errors,
  };
}

/* ---------- storefront visibility rules ---------- */

/** Shown on the store (turned on and has a photo). */
export const isListed = (p) => Boolean(p) && p.active !== false && p.images?.length > 0;

/** Shown and can be ordered. */
export const isAvailable = (p) => isListed(p) && p.availability !== "sold_out";

export const productsInCollection = (collection, products) =>
  collection.kind === "bestsellers"
    ? products.filter((p) => p.badge === "bestseller")
    : products.filter((p) => p.category === collection.id);

/** A collection appears only when it is on and has at least one available piece. */
export const isCollectionVisible = (collection, products) =>
  collection.active !== false && productsInCollection(collection, products).some(isAvailable);

/** Next free reference, e.g. "N05" for a Necklaces product. */
export function nextProductId(products, collectionName = "") {
  const prefix = (slugify(collectionName)[0] || "p").toUpperCase();
  const taken = new Set(products.map((p) => p.id));
  let n = products.filter((p) => p.id.startsWith(prefix)).length + 1;
  let id;
  do {
    id = `${prefix}${String(n).padStart(2, "0")}`;
    n += 1;
  } while (taken.has(id));
  return id;
}

export function uniqueCollectionId(collections, name) {
  const base = slugify(name);
  const taken = new Set(collections.map((c) => c.id));
  let id = base;
  let i = 2;
  while (taken.has(id)) id = `${base}-${i++}`.slice(0, 40);
  return id;
}
