import { useEffect, useRef, useState } from "react";
import { Check, Plus } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { discountPercent } from "../utils/format.js";
import { imgSrc, imgSrcSet } from "../utils/image.js";
import Price from "./Price.jsx";
import "./ProductCard.css";

const BADGE_LABEL = { bestseller: "Best Seller", new: "New" };

export default function ProductCard({ product, onView }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);

  const soldOut = product.availability === "sold_out";
  const needsSize = Boolean(product.variants?.sizes?.length);
  const discount = discountPercent(product.price, product.originalPrice);
  const [main, hover] = product.images;

  const handleQuickAdd = () => {
    if (soldOut) return;
    // Pieces with sizes need a choice first — open the detail view instead
    if (needsSize) {
      onView(product);
      return;
    }
    const color = product.variants?.colors?.[0]?.name;
    const result = addItem(product.id, color ? { color } : {}, 1);
    if (result.ok) {
      setAdded(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setAdded(false), 1600);
    }
  };

  const quickLabel = soldOut ? "Sold out" : added ? "Added" : needsSize ? "Choose size" : "Quick add";

  return (
    <article className={`pcard ${soldOut ? "is-soldout" : ""}`}>
      <div className="pcard__media">
        <button
          type="button"
          className="pcard__imgbtn"
          onClick={() => onView(product)}
          aria-label={`View details: ${product.name}`}
        >
          <img
            className="pcard__img"
            src={imgSrc(main, 600)}
            srcSet={imgSrcSet(main, [300, 450, 600, 900])}
            sizes="(min-width: 1100px) 24vw, (min-width: 700px) 32vw, 48vw"
            alt={product.name}
            width="600"
            height="750"
            loading="lazy"
            decoding="async"
          />
          {hover && (
            <img
              className="pcard__img pcard__img--hover"
              src={imgSrc(hover, 600)}
              srcSet={imgSrcSet(hover, [300, 450, 600, 900])}
              sizes="(min-width: 1100px) 24vw, (min-width: 700px) 32vw, 48vw"
              alt=""
              aria-hidden="true"
              width="600"
              height="750"
              loading="lazy"
              decoding="async"
            />
          )}
        </button>

        <div className="pcard__badges">
          {product.badge && <span className="pcard__badge">{BADGE_LABEL[product.badge]}</span>}
          {discount > 0 && <span className="pcard__badge pcard__badge--sale">−{discount}%</span>}
        </div>

        {soldOut && <span className="pcard__soldout">Sold out</span>}

        <button
          type="button"
          className={`pcard__quick ${added ? "is-added" : ""}`}
          onClick={handleQuickAdd}
          disabled={soldOut}
          aria-label={soldOut ? `${product.name} is sold out` : `${quickLabel}: ${product.name}`}
        >
          {added ? <Check size={18} strokeWidth={1.6} /> : <Plus size={18} strokeWidth={1.4} />}
          <span className="pcard__quick-label">{quickLabel}</span>
        </button>
      </div>

      <div className="pcard__info">
        <button type="button" className="pcard__name" onClick={() => onView(product)}>
          {product.name}
        </button>
        <p className="pcard__material">{product.material}</p>
        <div className="pcard__row">
          <Price price={product.price} originalPrice={product.originalPrice} />
          {product.availability === "low_stock" && <span className="pcard__low">Few left</span>}
        </div>
      </div>
    </article>
  );
}
