import { ChevronDown } from "lucide-react";
import { STORE_CONFIG } from "../config/store.js";
import { useCatalog } from "../context/CatalogContext.jsx";
import { Link, usePageTitle, useRouter } from "../router.jsx";
import { imgSrc, imgSrcSet } from "../utils/image.js";
import CollectionGrid, { collectionPath } from "../components/CollectionGrid.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import NotFound from "./NotFound.jsx";
import "./CollectionPage.css";

const SORTS = {
  featured: { label: "Featured", fn: null },
  "price-asc": { label: "Lowest price", fn: (a, b) => a.price - b.price },
  "price-desc": { label: "Highest price", fn: (a, b) => b.price - a.price },
};

const ALL = {
  name: "All Jewelry",
  description: "Every piece in our collection — gold-plated and gold-tone stainless steel, chosen to be worn every day.",
};

/** One dynamic page for every collection: /collections/<id>, plus /collections/all. */
export default function CollectionPage({ id, onView }) {
  const { products, collections, productsIn, isAvailable } = useCatalog();
  const { params, setParams } = useRouter();

  const isAll = id === "all";
  const collection = isAll ? null : collections.find((c) => c.id === id);
  const name = isAll ? ALL.name : collection?.name;
  usePageTitle(name ? `${name} — ${STORE_CONFIG.name}` : `Collection not found — ${STORE_CONFIG.name}`);

  if (!isAll && !collection) {
    return (
      <NotFound
        title="This collection isn't available"
        text="It may be sold out for now or no longer exist. Take a look at everything else we have."
      />
    );
  }

  const description = isAll ? ALL.description : collection.description;
  const pieces = isAll ? products : productsIn(collection);
  const cover = isAll ? null : collection.image || pieces[0]?.images[0];

  // Sort & availability come from the URL so a filtered page can be shared
  const sort = SORTS[params.get("sort")] ? params.get("sort") : "featured";
  const stock = ["in", "out"].includes(params.get("stock")) ? params.get("stock") : "all";

  const inStock = pieces.filter(isAvailable);
  const counts = { all: pieces.length, in: inStock.length, out: pieces.length - inStock.length };

  const filtered = stock === "in" ? inStock : stock === "out" ? pieces.filter((p) => !isAvailable(p)) : pieces;
  const sorter = SORTS[sort].fn;
  // A price sort is strictly by price; "Featured" keeps sold-out pieces last
  const shown = [...filtered].sort(sorter || ((a, b) => !isAvailable(a) - !isAvailable(b)));

  const stockOptions = [
    ["all", "All"],
    ["in", "In stock"],
    ["out", "Sold out"],
  ].filter(([key]) => key !== "out" || counts.out > 0);

  return (
    <div className="cpage">
      <header className={`cpage__hero ${cover ? "has-image" : ""}`}>
        {cover && (
          <img
            className="cpage__img"
            src={imgSrc(cover, 1600)}
            srcSet={imgSrcSet(cover, [600, 1000, 1600, 2000])}
            sizes="100vw"
            alt={collection.alt || ""}
            fetchpriority="high"
          />
        )}
        <div className="container cpage__hero-inner">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            {isAll ? (
              <span aria-current="page">Shop</span>
            ) : (
              <>
                <Link to="/collections/all">Shop</Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{name}</span>
              </>
            )}
          </nav>
          <h1 className="cpage__title">{name}</h1>
          {description && <p className="cpage__desc">{description}</p>}
          <p className="cpage__count">
            {counts.all} {counts.all === 1 ? "piece" : "pieces"}
          </p>
        </div>
      </header>

      {/* Quick switch between collections */}
      <nav className="cnav" aria-label="Collections">
        <div className="container">
          <div className="cnav__list">
            <Link to="/collections/all" className={`chip ${isAll ? "is-active" : ""}`} aria-current={isAll ? "page" : undefined}>
              All
            </Link>
            {collections.map((c) => (
              <Link
                key={c.id}
                to={collectionPath(c.id)}
                className={`chip ${c.id === id ? "is-active" : ""}`}
                aria-current={c.id === id ? "page" : undefined}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="cpage__toolbar">
        <div className="container cpage__toolbar-inner">
          <div className="cpage__stock" role="group" aria-label="Availability">
            {stockOptions.map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`seg ${stock === key ? "is-active" : ""}`}
                aria-pressed={stock === key}
                onClick={() => setParams({ stock: key === "all" ? null : key })}
              >
                {label} <span className="seg__count">{counts[key]}</span>
              </button>
            ))}
          </div>
          <label className="cpage__sort">
            <span className="cpage__sort-label">Sort</span>
            <select
              value={sort}
              onChange={(e) => setParams({ sort: e.target.value === "featured" ? null : e.target.value })}
              aria-label="Sort products"
            >
              {Object.entries(SORTS).map(([key, s]) => (
                <option key={key} value={key}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown size={15} strokeWidth={1.5} aria-hidden="true" />
          </label>
        </div>
      </div>

      <section className="container cpage__products" aria-label={`${name} products`}>
        <p className="cpage__showing" aria-live="polite">
          Showing {shown.length} {shown.length === 1 ? "piece" : "pieces"}
        </p>
        {shown.length ? (
          <ProductGrid products={shown} onView={onView} animateKey={`${id}-${stock}-${sort}`} />
        ) : (
          <div className="cpage__empty">
            <p>
              {stock === "in" ? "Everything in this collection is sold out right now." : "No pieces to show here."}
            </p>
            <button type="button" className="link-underline" onClick={() => setParams({ stock: null })}>
              Show all pieces
            </button>
          </div>
        )}
      </section>

      <CollectionGrid
        id="more-collections"
        eyebrow="Keep exploring"
        title={
          <>
            Other <em>collections</em>
          </>
        }
        excludeId={isAll ? undefined : id}
        compact
      />
    </div>
  );
}
