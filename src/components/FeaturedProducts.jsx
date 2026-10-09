import { ArrowRight } from "lucide-react";
import { useCatalog } from "../context/CatalogContext.jsx";
import { Link } from "../router.jsx";
import ProductGrid from "./ProductGrid.jsx";

const FEATURED_COUNT = 8;

/** Home page selection: newest available pieces first, then a link to the full catalog. */
export default function FeaturedProducts({ onView }) {
  const { products, isAvailable } = useCatalog();
  const featured = [...products]
    .sort((a, b) => isAvailable(b) - isAvailable(a) || (b.badge === "new") - (a.badge === "new"))
    .slice(0, FEATURED_COUNT);
  if (!featured.length) return null;

  return (
    <section id="shop" className="section shop" aria-labelledby="shop-title">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">The Collection</span>
          <h2 id="shop-title" className="section-title">
            Featured <em>pieces</em>
          </h2>
          <p className="section-lead">
            Gold-plated and gold-tone stainless steel jewelry, chosen to be worn every day.
          </p>
        </div>
        <ProductGrid products={featured} onView={onView} />
        <div className="shop__more">
          <Link to="/collections/all" className="btn btn--outline">
            Shop all jewelry <ArrowRight size={16} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}
