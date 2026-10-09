/* Where the catalog and photos are kept.

   Catalog:
     redis → Upstash Redis (Vercel → Storage → Upstash for Redis)
     file  → .data/catalog.json, only during local development
     none  → deployed without a database: reading falls back to the
             sample catalog and saving reports how to finish setup
   Photos:
     blob  → Vercel Blob (Vercel → Storage → Blob)
     file  → public/uploads, only during local development
     none  → photo upload disabled (image links still work)
*/

import fs from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

const CATALOG_KEY = "storefront:catalog";
const DATA_DIR = path.join(process.cwd(), ".data");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export class SetupError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function redisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/+$/, ""), token } : null;
}

const isDeployed = () => Boolean(process.env.VERCEL);

export const catalogStorage = () => (redisConfig() ? "redis" : isDeployed() ? "none" : "file");

export const uploadStorage = () =>
  process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID ? "blob" : isDeployed() ? "none" : "file";

/** Runs Redis commands through Upstash's REST pipeline endpoint. */
async function redis(commands) {
  const { url, token } = redisConfig();
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error(`Database request failed (${res.status}).`);
  const out = await res.json();
  return out.map((r) => {
    if (r.error) throw new Error(`Database error: ${r.error}`);
    return r.result;
  });
}

/* ---------- catalog ---------- */

export async function readCatalog() {
  const mode = catalogStorage();
  if (mode === "redis") {
    const [raw] = await redis([["GET", CATALOG_KEY]]);
    return raw ? JSON.parse(raw) : null;
  }
  if (mode === "file") {
    try {
      return JSON.parse(await fs.readFile(path.join(DATA_DIR, "catalog.json"), "utf8"));
    } catch {
      return null;
    }
  }
  return null;
}

export async function writeCatalog(catalog) {
  const mode = catalogStorage();
  const body = JSON.stringify(catalog);
  if (mode === "redis") {
    await redis([["SET", CATALOG_KEY, body]]);
    return;
  }
  if (mode === "file") {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(path.join(DATA_DIR, "catalog.json"), body);
    return;
  }
  throw new SetupError("NO_DATABASE", "Connect a database (Upstash for Redis) in Vercel to save changes.");
}

/* ---------- login attempt limiting ---------- */

const memoryCounters = new Map();

/** Increments a counter that expires after `windowSec`; returns the new count. */
export async function bumpCounter(key, windowSec) {
  if (catalogStorage() === "redis") {
    const [count] = await redis([["INCR", `storefront:${key}`]]);
    if (count === 1) await redis([["EXPIRE", `storefront:${key}`, windowSec]]);
    return count;
  }
  const now = Date.now();
  const entry = memoryCounters.get(key);
  if (!entry || entry.expires < now) {
    memoryCounters.set(key, { count: 1, expires: now + windowSec * 1000 });
    return 1;
  }
  entry.count += 1;
  return entry.count;
}

export async function resetCounter(key) {
  if (catalogStorage() === "redis") await redis([["DEL", `storefront:${key}`]]);
  else memoryCounters.delete(key);
}

/* ---------- photos ---------- */

const EXT = { "image/jpeg": "jpg", "image/webp": "webp", "image/png": "png" };
export const ALLOWED_IMAGE_TYPES = Object.keys(EXT);

export async function saveImage(buffer, contentType, baseName) {
  const ext = EXT[contentType];
  const safe = String(baseName || "photo")
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "photo";
  const mode = uploadStorage();

  if (mode === "blob") {
    const result = await put(`products/${safe}.${ext}`, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: true,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    return result.url;
  }
  if (mode === "file") {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const name = `${safe}-${Date.now().toString(36)}.${ext}`;
    await fs.writeFile(path.join(UPLOAD_DIR, name), buffer);
    return `/uploads/${name}`;
  }
  throw new SetupError("NO_BLOB", "Connect Vercel Blob in Vercel to upload photos.");
}
