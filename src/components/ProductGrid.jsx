import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useCatalog } from "../context/CatalogContext.jsx";
import ProductCard from "./ProductCard.jsx";
import "./ProductGrid.css";

const SORTS = {
  featured: { label: "Featured", fn: null },
  "price-asc": { label: "Price: low to high", fn: (a, b) => a.price - b.price },
  "price-desc": { label: "Price: high to low", fn: (a, b) => b.price - a.price },
};

export default function ProductGrid({ filter, setFilter, onView }) {
  const { products: allProducts, collections, productsIn } = useCatalog();
  const [sort, setSort] = useState("featured");

  // Filters = "All" + every collection currently shown on the store
  const filters = useMemo(
    () => [{ id: "all", label: "All" }, ...collections.map((c) => ({ id: c.id, label: c.name }))],
    [collections]
  );
  const activeCollection = collections.find((c) => c.id === filter);
  const activeFilter = activeCollection ? filter : "all";

  const products = useMemo(() => {
    const list = activeCollection ? productsIn(activeCollection) : allProducts;
    // Sold-out pieces always sink to the end
    const sorter = SORTS[sort].fn;
    return [...list].sort((a, b) => {
      const so = (a.availability === "sold_out") - (b.availability === "sold_out");
      return so || (sorter ? sorter(a, b) : 0);
    });
  }, [activeCollection, allProducts, productsIn, sort]);

  const activeLabel = activeCollection?.name ?? "All";

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

        <div className="shop__toolbar">
          <div className="shop__filters" role="group" aria-label="Filter by category">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`chip ${activeFilter === f.id ? "is-active" : ""}`}
                aria-pressed={activeFilter === f.id}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="shop__meta">
            <span className="shop__count" aria-live="polite">
              {products.length} {products.length === 1 ? "piece" : "pieces"}
              <span className="sr-only"> in {activeLabel}</span>
            </span>
            <label className="shop__sort">
              <span className="sr-only">Sort products</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                {Object.entries(SORTS).map(([id, s]) => (
                  <option key={id} value={id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} strokeWidth={1.5} aria-hidden="true" />
            </label>
          </div>
        </div>

        {products.length ? (
          <div className="product-grid" key={activeFilter}>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onView={onView} />
            ))}
          </div>
        ) : (
          <div className="shop__empty">
            <p>No pieces in this collection yet — new arrivals are on their way.</p>
            <button type="button" className="link-underline" onClick={() => setFilter("all")}>
              View all jewelry
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
