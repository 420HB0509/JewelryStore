/* Where the catalog and photos are kept.

   Catalog:
     redis → a Redis database connected in Vercel → Storage. Two flavours
             are supported automatically:
               • REDIS_URL                       (Redis / Redis Cloud, direct connection)
               • KV_REST_API_URL + _TOKEN        (Upstash for Redis, REST API)
     file  → .data/catalog.json, only during local development
     none  → deployed without a database: reading falls back to the
             sample catalog and saving reports how to finish setup
   Photos:
     blob  → Vercel Blob (BLOB_READ_WRITE_TOKEN, or BLOB_STORE_ID + Vercel OIDC)
     file  → public/uploads, only during local development
     none  → photo upload disabled (image links still work)
*/

import fs from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { createClient } from "redis";

const CATALOG_KEY = "storefront:catalog";
const DATA_DIR = path.join(process.cwd(), ".data");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export class SetupError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function restConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/+$/, ""), token } : null;
}

const redisUrl = () => process.env.REDIS_URL || process.env.KV_URL || "";

const isDeployed = () => Boolean(process.env.VERCEL);

export const catalogStorage = () => (restConfig() || redisUrl() ? "redis" : isDeployed() ? "none" : "file");

export const uploadStorage = () =>
  process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID ? "blob" : isDeployed() ? "none" : "file";

/* ---------- Redis access (REST or direct connection) ---------- */

/** Upstash REST: runs commands through the pipeline endpoint. */
async function restCommand(command) {
  const { url, token } = restConfig();
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify([command]),
  });
  if (!res.ok) throw new Error(`Database request failed (${res.status}).`);
  const [out] = await res.json();
  if (out.error) throw new Error(`Database error: ${out.error}`);
  return out.result;
}

/* Direct connection: one client per function instance, reused between requests. */
let clientPromise = null;

async function directClient() {
  if (!clientPromise) {
    const client = createClient({
      url: redisUrl(),
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => (retries > 3 ? false : Math.min(retries * 200, 1000)),
      },
    });
    client.on("error", (err) => console.error("Redis connection error:", err.message));
    clientPromise = client.connect().then(
      () => client,
      (err) => {
        clientPromise = null;
        throw err;
      }
    );
  }
  const client = await clientPromise;
  if (!client.isOpen) {
    clientPromise = null;
    return directClient();
  }
  return client;
}

/** Minimal Redis API used by this app: GET, SET, INCR, EXPIRE, DEL. */
async function kv(command, ...args) {
  if (restConfig()) return restCommand([command, ...args]);
  const client = await directClient();
  switch (command) {
    case "GET":
      return client.get(args[0]);
    case "SET":
      return client.set(args[0], args[1]);
    case "INCR":
      return client.incr(args[0]);
    case "EXPIRE":
      return client.expire(args[0], args[1]);
    case "DEL":
      return client.del(args[0]);
    default:
      throw new Error(`Unsupported command ${command}`);
  }
}

/* ---------- catalog ---------- */

export async function readCatalog() {
  const mode = catalogStorage();
  if (mode === "redis") {
    const raw = await kv("GET", CATALOG_KEY);
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
    await kv("SET", CATALOG_KEY, body);
    return;
  }
  if (mode === "file") {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(path.join(DATA_DIR, "catalog.json"), body);
    return;
  }
  throw new SetupError("NO_DATABASE", "Connect a Redis database in Vercel (Storage tab) to save changes.");
}

/* ---------- login attempt limiting ---------- */

const memoryCounters = new Map();

/** Increments a counter that expires after `windowSec`; returns the new count. */
export async function bumpCounter(key, windowSec) {
  if (catalogStorage() === "redis") {
    const count = Number(await kv("INCR", `storefront:${key}`));
    if (count === 1) await kv("EXPIRE", `storefront:${key}`, windowSec);
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
  if (catalogStorage() === "redis") await kv("DEL", `storefront:${key}`);
  else memoryCounters.delete(key);
}

/* ---------- photos ---------- */

const EXT = { "image/jpeg": "jpg", "image/webp": "webp", "image/png": "png" };
export const ALLOWED_IMAGE_TYPES = Object.keys(EXT);

/**
 * Saves a photo and returns its public URL.
 * `oidcToken` comes from the request's x-vercel-oidc-token header; Blob stores
 * created with BLOB_STORE_ID (no read-write token) authenticate with it.
 */
export async function saveImage(buffer, contentType, baseName, oidcToken) {
  const ext = EXT[contentType];
  const safe =
    String(baseName || "photo")
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
      ...(!process.env.BLOB_READ_WRITE_TOKEN && oidcToken ? { oidcToken } : {}),
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
