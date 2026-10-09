import { ArrowUpRight } from "lucide-react";
import { useCatalog } from "../context/CatalogContext.jsx";
import { imgSrc, imgSrcSet } from "../utils/image.js";
import "./CollectionGrid.css";

export default function CollectionGrid({ onSelect }) {
  // Only collections that are turned on and have an available piece
  const { collections, productsIn } = useCatalog();
  if (!collections.length) return null;

  return (
    <section id="collections" className="section collections" aria-labelledby="collections-title">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">Shop by Collection</span>
          <h2 id="collections-title" className="section-title">
            Find your <em>signature</em> piece
          </h2>
        </div>

        <ul className="collections__grid">
          {collections.map((c, i) => {
            const n = productsIn(c).length;
            const image = c.image || productsIn(c)[0]?.images[0];
            return (
              <li key={c.id} className="reveal" style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
                <button type="button" className="collection-card" onClick={() => onSelect(c.id)}>
                  <span className="collection-card__media">
                    {image && (
                      <img
                        src={imgSrc(image, 700)}
                        srcSet={imgSrcSet(image, [400, 700, 1000])}
                        sizes="(min-width: 900px) 30vw, 50vw"
                        alt={c.alt || c.name}
                        width="700"
                        height="875"
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </span>
                  <span className="collection-card__label">
                    <span className="collection-card__name">{c.name}</span>
                    <span className="collection-card__meta">
                      {n} {n === 1 ? "piece" : "pieces"}
                      <ArrowUpRight size={16} strokeWidth={1.4} aria-hidden="true" />
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
