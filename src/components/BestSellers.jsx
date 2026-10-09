import { ArrowRight } from "lucide-react";
import { PRODUCTS } from "../data/products.js";
import ProductCard from "./ProductCard.jsx";
import "./BestSellers.css";

export default function BestSellers({ onView, onSeeAll }) {
  const items = PRODUCTS.filter((p) => p.badge === "bestseller" && p.availability !== "sold_out").slice(0, 4);
  if (!items.length) return null;

  return (
    <section className="section best" aria-labelledby="best-title">
      <div className="container">
        <div className="best__head reveal">
          <div>
            <span className="eyebrow">Most Loved</span>
            <h2 id="best-title" className="section-title">
              Best <em>sellers</em>
            </h2>
          </div>
          <button type="button" className="link-underline" onClick={onSeeAll}>
            Shop all best sellers <ArrowRight size={15} strokeWidth={1.5} />
          </button>
        </div>
        <div className="best__row">
          {items.map((p) => (
            <div key={p.id} className="best__item">
              <ProductCard product={p} onView={onView} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
