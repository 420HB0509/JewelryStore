import { STORE_CONFIG } from "../config/store.js";

const numberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

/** 1290 -> "1 290 MAD" (space as thousands separator, the common Moroccan style) */
export function formatPrice(amount) {
  return `${numberFormat.format(amount).replace(/,/g, " ")} ${STORE_CONFIG.currency}`;
}

export function discountPercent(price, originalPrice) {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

/** Replace {key} tokens in a template string. */
export function fill(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    values[key] !== undefined ? String(values[key]) : `{${key}}`
  );
}
