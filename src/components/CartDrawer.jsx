import { useState } from "react";
import { ShoppingBag, Trash2, X } from "lucide-react";
import { useCatalog } from "../context/CatalogContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useDialog } from "../hooks/useDialog.js";
import { formatPrice } from "../utils/format.js";
import { imgSrc } from "../utils/image.js";
import { getOrderSummary, remainingForFreeDelivery } from "../utils/pricing.js";
import { describeVariant } from "../utils/whatsapp.js";
import QuantityStepper from "./QuantityStepper.jsx";
import WhatsAppCheckout from "./WhatsAppCheckout.jsx";
import "./CartDrawer.css";

export default function CartDrawer() {
  const {
    lines,
    count,
    subtotal,
    maxQty,
    setQuantity,
    removeItem,
    clearCart,
    isOpen,
    closeCart,
    checkoutStarted,
  } = useCart();
  const { settings } = useCatalog();
  const ref = useDialog(isOpen, closeCart);
  const [confirmClear, setConfirmClear] = useState(false);

  const summary = getOrderSummary(lines, settings);
  const remaining = remainingForFreeDelivery(subtotal, settings);
  const threshold = settings.freeDeliveryThreshold;
  const empty = lines.length === 0;

  const continueShopping = () => {
    closeCart();
    requestAnimationFrame(() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }));
  };

  return (
    <div className={`drawer ${isOpen ? "is-open" : ""}`} aria-hidden={!isOpen}>
      <div className="drawer__backdrop" onClick={closeCart} />
      <aside
        className="drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        ref={ref}
        tabIndex={-1}
      >
        <header className="drawer__head">
          <h2 id="cart-title" className="drawer__title">
            Your bag <span className="drawer__count">({count})</span>
          </h2>
          <button className="icon-btn" onClick={closeCart} aria-label="Close bag">
            <X size={22} strokeWidth={1.4} />
          </button>
        </header>

        {empty ? (
          <div className="drawer__empty">
            <span className="drawer__empty-icon" aria-hidden="true">
              <ShoppingBag size={28} strokeWidth={1.1} />
            </span>
            <h3>Your bag is empty</h3>
            <p>Little details make a big difference. Discover pieces you'll love wearing every day.</p>
            <button type="button" className="btn btn--primary" onClick={continueShopping}>
              Shop the collection
            </button>
          </div>
        ) : (
          <>
            {typeof threshold === "number" && (
              <div className="drawer__ship" aria-live="polite">
                <p>
                  {remaining > 0 ? (
                    <>
                      You're <strong>{formatPrice(remaining)}</strong> away from free delivery
                    </>
                  ) : (
                    <>Your order qualifies for <strong>free delivery</strong></>
                  )}
                </p>
                <div className="drawer__bar" aria-hidden="true">
                  <span style={{ transform: `scaleX(${Math.min(1, subtotal / threshold)})` }} />
                </div>
              </div>
            )}

            <ul className="drawer__items">
              {lines.map((l) => {
                const variant = describeVariant(l.variant);
                return (
                  <li key={l.key} className={`citem ${l.unavailable ? "is-unavailable" : ""}`}>
                    <img
                      className="citem__img"
                      src={imgSrc(l.product.images[0], 200)}
                      alt={l.product.name}
                      width="88"
                      height="110"
                      loading="lazy"
                    />
                    <div className="citem__body">
                      <div className="citem__top">
                        <div>
                          <p className="citem__name">{l.product.name}</p>
                          {variant && <p className="citem__variant">{variant}</p>}
                          <p className="citem__unit">{formatPrice(l.product.price)}</p>
                        </div>
                        <button
                          type="button"
                          className="citem__remove"
                          onClick={() => removeItem(l.key)}
                          aria-label={`Remove ${l.product.name} from bag`}
                        >
                          <Trash2 size={16} strokeWidth={1.4} />
                        </button>
                      </div>
                      {l.unavailable ? (
                        <p className="citem__warn">This piece is no longer available — please remove it.</p>
                      ) : (
                        <div className="citem__bottom">
                          <QuantityStepper
                            size="sm"
                            value={l.quantity}
                            max={maxQty}
                            label={`Quantity for ${l.product.name}`}
                            onChange={(n) => (n < 1 ? removeItem(l.key) : setQuantity(l.key, n))}
                          />
                          <span className="citem__total">{formatPrice(l.lineTotal)}</span>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            <footer className="drawer__foot">
              {checkoutStarted && (
                <div className="drawer__notice" role="status">
                  <p>
                    <strong>WhatsApp should now be open with your order.</strong> Just tap send — your order is
                    confirmed once we reply. Your bag stays saved here until you clear it.
                  </p>
                </div>
              )}

              <dl className="drawer__sum">
                <div>
                  <dt>Subtotal</dt>
                  <dd>{formatPrice(summary.subtotal)}</dd>
                </div>
                <div>
                  <dt>Delivery</dt>
                  <dd>
                    {summary.status === "free" && "Free"}
                    {summary.status === "flat" && formatPrice(summary.deliveryFee)}
                    {summary.status === "tbc" && "Confirmed on WhatsApp"}
                  </dd>
                </div>
                <div className="drawer__total">
                  <dt>{summary.status === "tbc" ? "Estimated total" : "Total"}</dt>
                  <dd>
                    {formatPrice(summary.total)}
                    {summary.status === "tbc" && <span className="drawer__plus"> + delivery</span>}
                  </dd>
                </div>
              </dl>

              <WhatsAppCheckout />

              <p className="drawer__fine">
                No payment is taken online. Your order details open in WhatsApp — we'll confirm availability,
                delivery and payment with you there.
              </p>

              <div className="drawer__clear">
                {confirmClear ? (
                  <span className="drawer__confirm">
                    Remove all items?
                    <button
                      type="button"
                      onClick={() => {
                        clearCart();
                        setConfirmClear(false);
                      }}
                    >
                      Yes, clear bag
                    </button>
                    <button type="button" onClick={() => setConfirmClear(false)}>
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setConfirmClear(true)}>
                    Clear bag
                  </button>
                )}
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
