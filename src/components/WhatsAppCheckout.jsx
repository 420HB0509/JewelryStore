import { useMemo } from "react";
import { useCart } from "../context/CartContext.jsx";
import { buildOrderMessage, buildWhatsAppUrl } from "../utils/whatsapp.js";
import { WhatsAppIcon } from "./BrandIcons.jsx";

/**
 * The main conversion action: builds the order message from the live cart
 * and opens WhatsApp (app on mobile, WhatsApp Web on desktop) via wa.me.
 * The cart is intentionally kept — opening WhatsApp does not confirm an order.
 */
export default function WhatsAppCheckout() {
  const { lines, setCheckoutStarted } = useCart();

  const hasUnavailable = lines.some((l) => l.unavailable);
  const canCheckout = lines.length > 0 && !hasUnavailable;

  const href = useMemo(
    () => (canCheckout ? buildWhatsAppUrl(buildOrderMessage(lines)) : undefined),
    [lines, canCheckout]
  );

  if (!canCheckout) {
    return (
      <>
        <button type="button" className="btn btn--wa btn--block" disabled>
          <WhatsAppIcon size={19} /> Order via WhatsApp
        </button>
        {hasUnavailable && (
          <p className="checkout__warn" role="alert">
            Please remove sold-out pieces before ordering.
          </p>
        )}
      </>
    );
  }

  return (
    <a
      className="btn btn--wa btn--block checkout__btn"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => setCheckoutStarted(true)}
    >
      <WhatsAppIcon size={19} /> Order via WhatsApp
    </a>
  );
}
