import { STORE_CONFIG, WHATSAPP_TEXT as T } from "../config/store.js";
import { formatPrice, fill } from "./format.js";
import { getOrderSummary } from "./pricing.js";

/** Keep only digits so "+212 6 00-00-00-00" still produces a valid link. */
const cleanNumber = (n) => String(n || "").replace(/\D/g, "");

/** https://wa.me/<number>?text=<encoded message> */
export function buildWhatsAppUrl(settings, message) {
  const base = `https://wa.me/${cleanNumber(settings.whatsappNumber)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function describeVariant(variant) {
  if (!variant) return "";
  return [variant.color, variant.size && `size ${variant.size}`]
    .filter(Boolean)
    .join(", ");
}

/**
 * Builds the order message from resolved cart lines
 * ({ product, quantity, variant, lineTotal }).
 */
export function buildOrderMessage(lines, settings) {
  const summary = getOrderSummary(lines, settings);

  const items = lines.map((l) => {
    const variant = describeVariant(l.variant);
    const name = variant ? `${l.product.name} (${variant})` : l.product.name;
    return `• ${name} × ${l.quantity} — ${formatPrice(l.lineTotal)}\n   Ref. ${l.product.id} · ${formatPrice(l.product.price)} each`;
  });

  let deliveryLine;
  let totalLine;
  if (summary.status === "free") {
    deliveryLine = T.deliveryFree;
    totalLine = formatPrice(summary.total);
  } else if (summary.status === "flat") {
    deliveryLine = formatPrice(summary.deliveryFee);
    totalLine = formatPrice(summary.total);
  } else {
    deliveryLine = T.deliveryTbc;
    totalLine = fill(T.totalPlusDelivery, { amount: formatPrice(summary.subtotal) });
  }

  return [
    fill(T.greeting, { brand: STORE_CONFIG.name }),
    "",
    T.orderDetails,
    ...items,
    "",
    `${T.subtotal}: ${formatPrice(summary.subtotal)}`,
    `${T.delivery}: ${deliveryLine}`,
    `${T.total}: ${totalLine}`,
    "",
    T.closing,
    T.thanks,
  ].join("\n");
}

export const generalEnquiryUrl = (settings) =>
  buildWhatsAppUrl(settings, fill(T.generalEnquiry, { brand: STORE_CONFIG.name }));

export const productEnquiryUrl = (product, settings) =>
  buildWhatsAppUrl(
    settings,
    fill(T.productEnquiry, { brand: STORE_CONFIG.name, product: product.name, id: product.id })
  );

/** "212600000000" -> "+212 600 000 000" for display only */
export function displayNumber(n) {
  const d = cleanNumber(n);
  return d ? `+${d.slice(0, 3)} ${d.slice(3).replace(/(\d{3})(?=\d)/g, "$1 ")}` : "";
}
