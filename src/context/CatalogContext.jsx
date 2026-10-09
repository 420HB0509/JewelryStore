import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  isAvailable,
  isCollectionVisible,
  normalizeCatalog,
  productsInCollection,
  storeProducts,
} from "../../shared/catalog.js";
import { DEFAULT_CATALOG } from "../catalog/defaultCatalog.js";
import Wordmark from "../components/Wordmark.jsx";

const CatalogContext = createContext(null);
const CACHE_KEY = "storefront-catalog-cache-v1";
const TIMEOUT_MS = 4000;

const readCache = () => {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? normalizeCatalog(JSON.parse(raw)).catalog : null;
  } catch {
    return null;
  }
};

const writeCache = (catalog) => {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(catalog));
  } catch {
    /* ignore */
  }
};

const clearCache = () => {
  try {
    window.localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
};

/**
 * Loads the published catalog from /api/catalog.
 * - API says nothing is published yet → sample catalog
 * - API unreachable (offline, static host) → last catalog seen, else sample
 */
async function fetchCatalog(signal) {
  try {
    const res = await fetch("/api/catalog", {
      signal,
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    const type = res.headers.get("content-type") || "";
    if (!res.ok || !type.includes("application/json")) throw new Error("API unavailable");
    const data = await res.json();
    if (!data.catalog) {
      clearCache();
      return DEFAULT_CATALOG;
    }
    const catalog = normalizeCatalog(data.catalog).catalog;
    writeCache(catalog);
    return catalog;
  } catch {
    return readCache() || DEFAULT_CATALOG;
  }
}

export function CatalogProvider({ children }) {
  const [catalog, setCatalog] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    let settled = false;
    const finish = (c) => {
      if (settled) return;
      settled = true;
      setCatalog(c);
    };
    const timer = setTimeout(() => {
      ctrl.abort();
      finish(readCache() || DEFAULT_CATALOG);
    }, TIMEOUT_MS);
    fetchCatalog(ctrl.signal).then((c) => {
      clearTimeout(timer);
      finish(c);
    });
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, []);

  const value = useMemo(() => {
    if (!catalog) return null;
    const allById = new Map(catalog.products.map((p) => [p.id, p]));
    const products = storeProducts(catalog);
    const onStore = new Set(products.map((p) => p.id));
    const visibleCollections = catalog.collections.filter((c) => isCollectionVisible(c, products));
    return {
      settings: catalog.settings,
      /** Products shown on the store (turned on, with a photo, collection on) */
      products,
      /** Collections that are on and have at least one available piece */
      collections: visibleCollections,
      allCollections: catalog.collections,
      /** Any product by reference, including hidden ones (for saved bags) */
      findProduct: (id) => allById.get(id),
      productsIn: (collection) => productsInCollection(collection, products),
      isOnStore: (product) => onStore.has(product.id),
      isAvailable,
    };
  }, [catalog]);

  if (!value) {
    return (
      <div className="catalog-loading" role="status" aria-label="Loading the store">
        <Wordmark />
        <span className="catalog-loading__line" />
      </div>
    );
  }

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside <CatalogProvider>");
  return ctx;
}
