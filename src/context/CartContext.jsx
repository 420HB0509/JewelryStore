import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { STORE_CONFIG } from "../config/store.js";
import { isListed } from "../../shared/catalog.js";
import { useCatalog } from "./CatalogContext.jsx";

const STORAGE_KEY = "storefront-cart-v1";
const MAX_QTY = STORE_CONFIG.maxQuantityPerItem;

const CartContext = createContext(null);

/* ---------- helpers ---------- */

const lineKey = (id, variant = {}) =>
  [id, variant.color || "", variant.size || ""].join("|");

const clampQty = (n) => Math.min(MAX_QTY, Math.max(1, Math.floor(n)));

/** Checks that a product/variant/quantity combination can be added. */
export function validateSelection(product, variant = {}, quantity = 1) {
  if (!product || !isListed(product)) return { ok: false, error: "This piece is no longer available." };
  if (product.availability === "sold_out")
    return { ok: false, error: "This piece is currently sold out." };
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY)
    return { ok: false, error: `Please choose a quantity between 1 and ${MAX_QTY}.` };

  const sizes = product.variants?.sizes;
  const colors = product.variants?.colors;
  if (sizes?.length && !sizes.includes(variant.size))
    return { ok: false, error: "Please select a size." };
  if (colors?.length && !colors.some((c) => c.name === variant.color))
    return { ok: false, error: "Please select a color." };
  return { ok: true };
}

/** Restores the saved cart, dropping anything invalid or no longer in the catalog. */
function loadCart(getProduct) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((it) => it && typeof it.id === "string" && getProduct(it.id))
      .map((it) => {
        const variant = {
          color: typeof it.variant?.color === "string" ? it.variant.color : undefined,
          size: typeof it.variant?.size === "string" ? it.variant.size : undefined,
        };
        return {
          key: lineKey(it.id, variant),
          id: it.id,
          variant,
          quantity: clampQty(Number(it.quantity) || 1),
        };
      });
  } catch {
    return [];
  }
}

function saveCart(items) {
  try {
    const slim = items.map(({ id, variant, quantity }) => ({ id, variant, quantity }));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
  } catch {
    /* storage full or blocked — the cart still works for this visit */
  }
}

/* ---------- reducer ---------- */

function reducer(state, action) {
  switch (action.type) {
    case "add": {
      const { id, variant, quantity } = action;
      const key = lineKey(id, variant);
      const existing = state.find((it) => it.key === key);
      if (existing) {
        return state.map((it) =>
          it.key === key ? { ...it, quantity: clampQty(it.quantity + quantity) } : it
        );
      }
      return [...state, { key, id, variant, quantity: clampQty(quantity) }];
    }
    case "setQty":
      return state.map((it) =>
        it.key === action.key ? { ...it, quantity: clampQty(action.quantity) } : it
      );
    case "remove":
      return state.filter((it) => it.key !== action.key);
    case "clear":
      return [];
    case "replace":
      return action.items;
    default:
      return state;
  }
}

/* ---------- provider ---------- */

export function CartProvider({ children }) {
  const { findProduct: getProduct, isOnStore } = useCatalog();
  const [items, dispatch] = useReducer(reducer, getProduct, loadCart);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [checkoutStarted, setCheckoutStarted] = useState(false);
  const toastTimer = useRef();
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Persist on every change
  useEffect(() => saveCart(items), [items]);

  // Keep several open tabs in sync
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) dispatch({ type: "replace", items: loadCart(getProduct) });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [getProduct]);

  const showToast = useCallback((message, withCartAction = false) => {
    window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message, withCartAction });
    toastTimer.current = window.setTimeout(() => setToast(null), 3800);
  }, []);

  const dismissToast = useCallback(() => {
    window.clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

  /** Returns { ok, error? } so callers can show inline validation. */
  const addItem = useCallback(
    (productId, variant = {}, quantity = 1) => {
      const product = getProduct(productId);
      const check = validateSelection(product, variant, quantity);
      if (!check.ok) return check;
      if (!isOnStore(product)) return { ok: false, error: "This piece is no longer available." };

      const key = lineKey(productId, variant);
      const already = itemsRef.current.find((it) => it.key === key)?.quantity || 0;
      if (already >= MAX_QTY) {
        return { ok: false, error: `You can order up to ${MAX_QTY} of this piece at once.` };
      }
      dispatch({ type: "add", id: productId, variant, quantity });
      setCheckoutStarted(false);
      const capped = already + quantity > MAX_QTY;
      showToast(
        capped
          ? `Quantity limited to ${MAX_QTY} — ${product.name}`
          : `${product.name} added to your bag`,
        true
      );
      return { ok: true };
    },
    [showToast, getProduct, isOnStore]
  );

  const setQuantity = useCallback((key, quantity) => {
    if (!Number.isFinite(quantity)) return;
    dispatch({ type: "setQty", key, quantity });
  }, []);

  const removeItem = useCallback((key) => dispatch({ type: "remove", key }), []);
  const clearCart = useCallback(() => {
    dispatch({ type: "clear" });
    setCheckoutStarted(false);
  }, []);

  const openCart = useCallback(() => {
    dismissToast();
    setIsOpen(true);
  }, [dismissToast]);
  const closeCart = useCallback(() => setIsOpen(false), []);

  // Resolve against the catalog so prices always come from products.js
  const lines = useMemo(
    () =>
      items
        .map((it) => {
          const product = getProduct(it.id);
          if (!product) return null;
          return {
            ...it,
            product,
            unavailable: !isOnStore(product) || product.availability === "sold_out",
            lineTotal: product.price * it.quantity,
          };
        })
        .filter(Boolean),
    [items, getProduct, isOnStore]
  );

  const count = lines.reduce((n, l) => n + l.quantity, 0);
  const subtotal = lines.reduce((n, l) => n + l.lineTotal, 0);

  const value = {
    lines,
    count,
    subtotal,
    maxQty: MAX_QTY,
    addItem,
    setQuantity,
    removeItem,
    clearCart,
    isOpen,
    openCart,
    closeCart,
    toast,
    dismissToast,
    checkoutStarted,
    setCheckoutStarted,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
