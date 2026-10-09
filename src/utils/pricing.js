import { STORE_CONFIG } from "../config/store.js";

/**
 * Delivery + total summary for a subtotal.
 * status: "free" | "flat" | "tbc"
 *   free -> subtotal reached the free-delivery threshold
 *   flat -> a fixed delivery fee is configured
 *   tbc  -> fee depends on location; confirmed on WhatsApp
 */
export function getOrderSummary(subtotal) {
  const { deliveryFee, freeDeliveryThreshold } = STORE_CONFIG;
  const qualifiesFree =
    typeof freeDeliveryThreshold === "number" && subtotal >= freeDeliveryThreshold;

  if (qualifiesFree) {
    return { subtotal, status: "free", deliveryFee: 0, total: subtotal };
  }
  if (typeof deliveryFee === "number") {
    return { subtotal, status: "flat", deliveryFee, total: subtotal + deliveryFee };
  }
  return { subtotal, status: "tbc", deliveryFee: null, total: subtotal };
}

/** Amount left to reach free delivery, or null if not applicable. */
export function remainingForFreeDelivery(subtotal) {
  const { freeDeliveryThreshold } = STORE_CONFIG;
  if (typeof freeDeliveryThreshold !== "number") return null;
  return Math.max(0, freeDeliveryThreshold - subtotal);
}
