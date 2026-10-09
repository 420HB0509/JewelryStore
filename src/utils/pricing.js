import { formatPrice } from "./format.js";

/** A product's own delivery fee, or the store default (null = confirm on WhatsApp). */
export const productDeliveryFee = (product, settings) =>
  product.shippingFee ?? settings.deliveryFee ?? null;

/**
 * Delivery + total for the bag.
 * status: "free" | "flat" | "tbc"
 *   free -> free-delivery threshold reached, or every item ships free
 *   flat -> every item has a known fee (product fee or store default)
 *   tbc  -> at least one item's fee is confirmed on WhatsApp
 *
 * settings.deliveryMode decides how several fees combine:
 *   "highest"  -> one fee per order: the highest fee in the bag
 *   "per_item" -> each item's fee × quantity
 */
export function getOrderSummary(lines, settings) {
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const threshold = settings.freeDeliveryThreshold;

  if (typeof threshold === "number" && subtotal >= threshold) {
    return { subtotal, status: "free", deliveryFee: 0, total: subtotal };
  }

  const fees = lines.map((l) => ({ fee: productDeliveryFee(l.product, settings), quantity: l.quantity }));
  if (!fees.length || fees.some((f) => f.fee === null)) {
    return { subtotal, status: "tbc", deliveryFee: null, total: subtotal };
  }

  const deliveryFee =
    settings.deliveryMode === "per_item"
      ? fees.reduce((sum, f) => sum + f.fee * f.quantity, 0)
      : Math.max(...fees.map((f) => f.fee));

  if (deliveryFee === 0) return { subtotal, status: "free", deliveryFee: 0, total: subtotal };
  return { subtotal, status: "flat", deliveryFee, total: subtotal + deliveryFee };
}

/** Amount left to reach free delivery, or null if not applicable. */
export function remainingForFreeDelivery(subtotal, settings) {
  const threshold = settings.freeDeliveryThreshold;
  if (typeof threshold !== "number") return null;
  return Math.max(0, threshold - subtotal);
}

/** Short delivery line for a product page. */
export function productDeliveryNote(product, settings) {
  const fee = productDeliveryFee(product, settings);
  const threshold = settings.freeDeliveryThreshold;
  const freeFrom = typeof threshold === "number" ? ` · Free from ${formatPrice(threshold)}` : "";
  if (fee === 0) return "Free delivery";
  if (fee === null) return `Delivery fee confirmed on WhatsApp${freeFrom}`;
  const per = settings.deliveryMode === "per_item" ? " per item" : "";
  return `Delivery ${formatPrice(fee)}${per}${freeFrom}`;
}
