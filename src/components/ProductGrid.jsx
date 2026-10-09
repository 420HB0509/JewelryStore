import ProductCard from "./ProductCard.jsx";
import "./ProductGrid.css";

/** Responsive grid of product cards (2 columns on phones, up to 4 on desktop). */
export default function ProductGrid({ products, onView, animateKey }) {
  return (
    <div className="product-grid" key={animateKey}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onView={onView} />
      ))}
    </div>
  );
}
