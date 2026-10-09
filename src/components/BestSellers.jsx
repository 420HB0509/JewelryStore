import { ArrowRight } from "lucide-react";
import { useCatalog } from "../context/CatalogContext.jsx";
import ProductCard from "./ProductCard.jsx";
import "./BestSellers.css";

export default function BestSellers({ onView, onSeeAll }) {
  const { products, collections, isAvailable } = useCatalog();
  const items = products.filter((p) => p.badge === "bestseller" && isAvailable(p)).slice(0, 4);
  if (!items.length) return null;

  // Link to the Best Sellers collection when it is shown on the store
  const bestCollection = collections.find((c) => c.kind === "bestsellers");

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
          {bestCollection && (
            <button type="button" className="link-underline" onClick={() => onSeeAll(bestCollection.id)}>
              Shop all best sellers <ArrowRight size={15} strokeWidth={1.5} />
            </button>
          )}
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
