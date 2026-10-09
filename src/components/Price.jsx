import { formatPrice } from "../utils/format.js";

export default function Price({ price, originalPrice, className = "" }) {
  const onSale = originalPrice && originalPrice > price;
  return (
    <span className={`price ${className}`}>
      <span className="price__now">
        {onSale && <span className="sr-only">Sale price </span>}
        {formatPrice(price)}
      </span>
      {onSale && (
        <s className="price__was">
          <span className="sr-only">Original price </span>
          {formatPrice(originalPrice)}
        </s>
      )}
    </span>
  );
}
