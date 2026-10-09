import { Minus, Plus } from "lucide-react";
import "./QuantityStepper.css";

export default function QuantityStepper({ value, onChange, min = 1, max = 10, label = "Quantity", size = "md" }) {
  return (
    <div className={`qty qty--${size}`} role="group" aria-label={label}>
      <button
        type="button"
        className="qty__btn"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <Minus size={14} strokeWidth={1.6} />
      </button>
      <span className="qty__value" aria-live="polite" aria-atomic="true">
        <span className="sr-only">{label}: </span>
        {value}
      </span>
      <button
        type="button"
        className="qty__btn"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus size={14} strokeWidth={1.6} />
      </button>
    </div>
  );
}
