import { Check, X } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import "./Toast.css";

/** "Added to bag" confirmation with a shortcut to the cart. */
export default function Toast() {
  const { toast, dismissToast, openCart, isOpen } = useCart();
  const visible = Boolean(toast) && !isOpen;

  return (
    <div className="toast-region" role="status" aria-live="polite">
      {visible && (
        <div key={toast.id} className="toast">
          <span className="toast__icon" aria-hidden="true">
            <Check size={15} strokeWidth={2} />
          </span>
          <p className="toast__msg">{toast.message}</p>
          {toast.withCartAction && (
            <button type="button" className="toast__action" onClick={openCart}>
              View bag
            </button>
          )}
          <button type="button" className="toast__close" onClick={dismissToast} aria-label="Dismiss">
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  );
}
