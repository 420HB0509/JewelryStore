import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useDialog } from "../../hooks/useDialog.js";
import { STORE_CONFIG } from "../../config/store.js";

/* ---------- Switch ---------- */

export function Switch({ checked, onChange, label, disabled, showLabel = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={showLabel ? undefined : label}
      className={`switch ${checked ? "is-on" : ""}`}
      onClick={() => onChange(!checked)}
      disabled={disabled}
    >
      <span className="switch__track" aria-hidden="true">
        <span className="switch__thumb" />
      </span>
      {showLabel && <span className="switch__label">{label}</span>}
    </button>
  );
}

/* ---------- Form field ---------- */

export function Field({ label, hint, error, htmlFor, children, optional }) {
  return (
    <div className={`field ${error ? "has-error" : ""}`}>
      {label && (
        <label className="field__label" htmlFor={htmlFor}>
          {label}
          {optional && <span className="field__optional">optional</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="field__error" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="field__hint">{hint}</p>
      )}
    </div>
  );
}

/** Number input with the currency shown at the end. */
export function MoneyInput({ id, value, onChange, placeholder = "0", ...rest }) {
  return (
    <div className="money">
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min="0"
        step="any"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
      <span className="money__unit">{STORE_CONFIG.currency}</span>
    </div>
  );
}

export function Pill({ tone = "neutral", children }) {
  return <span className={`pill pill--${tone}`}>{children}</span>;
}

/* ---------- Modal (sheet on phones, dialog on desktop) ---------- */

export function Modal({ open, onClose, title, subtitle, children, footer, size = "md" }) {
  const ref = useDialog(open, onClose);
  if (!open) return null;
  return (
    <div className="modal" role="presentation">
      <div className="modal__backdrop" onClick={onClose} />
      <div
        className={`modal__panel modal__panel--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        ref={ref}
        tabIndex={-1}
      >
        <header className="modal__head">
          <div>
            <h2 id="modal-title">{title}</h2>
            {subtitle && <p className="modal__subtitle">{subtitle}</p>}
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={20} strokeWidth={1.6} />
          </button>
        </header>
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__foot">{footer}</footer>}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = "Confirm",
  tone = "danger",
  busy = false,
  disabled = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <button type="button" className="abtn abtn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={`abtn ${tone === "danger" ? "abtn--danger" : "abtn--primary"}`}
            onClick={onConfirm}
            disabled={busy || disabled}
            data-autofocus
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </>
      }
    >
      <div className="confirm__body">{children}</div>
    </Modal>
  );
}

/* ---------- Toasts ---------- */

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const show = useCallback(
    (message, tone = "success", duration = 3500) => {
      const id = ++idRef.current;
      setToasts((t) => [...t.slice(-2), { id, message, tone }]);
      if (duration) setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="atoasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`atoast atoast--${t.tone}`}>
            {t.tone === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <p>{t.message}</p>
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
